import { NextResponse } from "next/server";
import { ResultSetHeader } from "mysql2";
import { getPool } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import {
  addNicknamesBulk,
  createCustomer,
  ensureAuthSchema,
  isValidEmail,
  isValidRiotId,
  isValidUsername,
  normalizeEmail,
  normalizeRiotId,
  normalizeUsername,
} from "@/lib/users";
import { verifyRiotId } from "@/lib/riot";
import { ensureBoosterSchema } from "@/lib/booster";
import { validateBooster, type BoosterProfileInput } from "@/lib/booster-model";
import { ensureCodeSchema, consumeCode } from "@/lib/signupCodes";
import { createSessionToken, getSessionCookieHeader } from "@/lib/session";
import { isAuthRateLimited, isAuthAccountRateLimited, recordAuthAttempt } from "@/lib/authRateLimit";
import { guardMutationRequest } from "@/lib/request-security";

export const runtime = "nodejs";

const PASSWORD_MIN_LENGTH = 8;

type SignupPayload = BoosterProfileInput & {
  username?: string;
  password?: string;
  role?: string;
  code?: string;
  email?: string;
  nicknames?: string[];
};

function authCookie(role: "customer" | "booster", userId: number) {
  return { "Set-Cookie": getSessionCookieHeader(createSessionToken(role, userId)) };
}

// 회원가입. 일반회원(customer)은 셀프가입 즉시 로그인. 기사(booster)는 관리자가
// 발급한 가입 코드 + 프로필을 함께 제출해야 하며, 코드 유효 시 즉시 활성 기사가 된다.
// role은 이 둘만 허용(admin은 env 전용이라 가입 불가).
export async function POST(request: Request) {
  const rejected = guardMutationRequest(request, { maxBytes: 32 * 1024 });
  if (rejected) return rejected;

  if (await isAuthRateLimited(request)) {
    return NextResponse.json(
      { message: "시도가 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  let payload: SignupPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const username = normalizeUsername(payload.username ?? "");
  const password = payload.password?.trim() ?? "";
  const role = payload.role === "booster" ? "booster" : "customer";

  if (!isValidUsername(username)) {
    return NextResponse.json(
      { message: "아이디는 영문 소문자·숫자·밑줄 3~30자로 입력해주세요." },
      { status: 400 },
    );
  }
  if (await isAuthAccountRateLimited(username)) {
    return NextResponse.json(
      { message: "시도가 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }
  if (password.length < PASSWORD_MIN_LENGTH || password.length > 128) {
    return NextResponse.json(
      { message: `비밀번호는 ${PASSWORD_MIN_LENGTH}~128자여야 합니다.` },
      { status: 400 },
    );
  }
  if (username === normalizeUsername(process.env.ADMIN_USERNAME ?? "")) {
    return NextResponse.json({ message: "사용할 수 없는 아이디입니다." }, { status: 409 });
  }

  const passwordHash = hashPassword(password);
  await recordAuthAttempt(request, username);

  // ── 일반회원 ── (이메일 필수·고유 + 롤 닉네임 여러 개)
  if (role === "customer") {
    const email = normalizeEmail(payload.email ?? "");
    if (!isValidEmail(email)) {
      return NextResponse.json({ message: "올바른 이메일을 입력해주세요." }, { status: 400 });
    }
    const nicknames = Array.isArray(payload.nicknames) ? payload.nicknames : [];

    const created = await createCustomer(username, passwordHash, email);
    if ("error" in created) {
      const message =
        created.error === "email"
          ? "이미 사용 중인 이메일입니다."
          : created.error === "username"
            ? "이미 사용 중인 아이디입니다."
            : "회원가입에 실패했습니다.";
      const status = created.error === "unknown" ? 500 : 409;
      return NextResponse.json({ message }, { status });
    }
    // 닉네임은 서버에서 실존 재확인한 것만 저장(클라 "확인" 불신). 형식 오류·미존재·
    // 조회불가는 조용히 건너뛴다 — 가입 자체는 막지 않는다(이메일이 주 식별자).
    const verified: string[] = [];
    for (const raw of nicknames.slice(0, 10)) {
      const rid = normalizeRiotId(raw);
      if (!isValidRiotId(rid)) continue;
      try {
        if ((await verifyRiotId(rid)).valid) verified.push(rid);
      } catch {
        // op.gg 조회 불가 → 이 닉네임은 건너뜀(마이페이지에서 나중에 추가 가능)
      }
    }
    if (verified.length > 0) await addNicknamesBulk(created.id, verified);

    return NextResponse.json(
      { ok: true, role: "customer" },
      { headers: authCookie("customer", created.id) },
    );
  }

  // ── 기사(가입 코드 + 프로필) ──
  const code = payload.code?.trim() ?? "";
  if (!code) {
    return NextResponse.json({ message: "가입 코드를 입력해주세요." }, { status: 400 });
  }
  const profile = validateBooster(payload);
  if ("message" in profile) {
    return NextResponse.json({ message: profile.message }, { status: 400 });
  }

  await ensureAuthSchema();
  await ensureBoosterSchema();
  await ensureCodeSchema();

  const conn = await getPool().getConnection();
  let userId: number;
  try {
    await conn.beginTransaction();
    const [userRes] = await conn.execute<ResultSetHeader>(
      `INSERT INTO users (username, password_hash, role, active)
       VALUES (:username, :hash, 'booster', 1)`,
      { username, hash: passwordHash },
    );
    userId = userRes.insertId;

    // 코드 소진(미사용만). 실패면 무효/이미 사용된 코드 → 전체 롤백.
    const consumed = await consumeCode(conn, code, userId);
    if (!consumed) {
      await conn.rollback();
      return NextResponse.json(
        { message: "유효하지 않거나 이미 사용된 가입 코드입니다." },
        { status: 400 },
      );
    }

    await conn.execute<ResultSetHeader>(
      `INSERT INTO booster (name, positions, rank, tier, description, weekday_hours, weekend_hours, champions, services, nationality, image_url, sort_order, active, booster_password_hash, user_id)
       VALUES (:name, :positions, :rank, :tier, :description, :weekdayHours, :weekendHours, '', :services, :nationality, :image, 0, 1, :hash, :userId)`,
      {
        name: profile.name,
        positions: profile.positions,
        rank: profile.rank,
        tier: profile.tier,
        description: profile.description,
        weekdayHours: profile.weekdayHours,
        weekendHours: profile.weekendHours,
        services: profile.services,
        nationality: profile.nationality,
        image: profile.image,
        hash: passwordHash,
        userId,
      },
    );
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") {
      return NextResponse.json({ message: "이미 사용 중인 아이디입니다." }, { status: 409 });
    }
    console.error("Failed to sign up booster", error);
    return NextResponse.json({ message: "회원가입에 실패했습니다." }, { status: 500 });
  } finally {
    conn.release();
  }

  return NextResponse.json(
    { ok: true, role: "booster" },
    { headers: authCookie("booster", userId) },
  );
}
