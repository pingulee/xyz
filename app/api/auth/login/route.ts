import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { ensureBoosterSchema } from "@/lib/booster";
import { verifyPassword, dummyVerify } from "@/lib/password";
import { getUserByUsername, normalizeUsername } from "@/lib/users";
import {
  createSessionToken,
  getSessionCookieHeader,
  type Role,
} from "@/lib/session";
import {
  isAuthRateLimited,
  recordAuthAttempt,
  clearAuthAttempts,
} from "@/lib/authRateLimit";

export const runtime = "nodejs";

type LegacyBoosterRow = RowDataPacket & {
  id: number;
  user_id: number | null;
  booster_password_hash: string | null;
};

// 길이가 다르면 timingSafeEqual이 던지므로 먼저 길이를 확인한다.
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

async function success(request: Request, role: Role, userId: number) {
  await clearAuthAttempts(request);
  const token = createSessionToken(role, userId);
  return NextResponse.json(
    { ok: true, role },
    { headers: { "Set-Cookie": getSessionCookieHeader(token) } },
  );
}

// username·비번 모두 불일치와 동일한 응답(열거 방지) + 시도 카운트.
async function fail(request: Request) {
  await recordAuthAttempt(request);
  return NextResponse.json(
    { message: "아이디 또는 비밀번호가 일치하지 않습니다." },
    { status: 403 },
  );
}

/**
 * 과도기 폴백: users로 아직 승계되지 않았거나 기사가 신규 username을 모르는 동안,
 * 기존 방식(booster.name + 비번)으로 로그인시킨다. 세션 userId는 연결된 users.id가
 * 있으면 그걸, 없으면 booster.id를 쓴다(authz.resolveBoosterId가 둘 다 흡수).
 * Phase 4에서 이 폴백을 종료한다.
 */
async function tryLegacyBoosterLogin(
  rawName: string,
  password: string,
): Promise<number | null> {
  const name = rawName.trim();
  if (!name) return null;
  await ensureBoosterSchema();
  const [rows] = await getPool().execute<LegacyBoosterRow[]>(
    `SELECT id, user_id, booster_password_hash
     FROM booster WHERE name = :name AND active = 1 LIMIT 1`,
    { name },
  );
  const booster = rows[0];
  if (!booster?.booster_password_hash) return null;
  if (!verifyPassword(password, booster.booster_password_hash)) return null;
  return booster.user_id ?? booster.id;
}

export async function POST(request: Request) {
  if (await isAuthRateLimited(request)) {
    return NextResponse.json(
      { message: "시도가 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  let payload: { username?: string; password?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const rawUsername = payload.username ?? "";
  const username = normalizeUsername(rawUsername);
  const password = payload.password?.trim() ?? "";
  if (!username || !password) {
    return NextResponse.json({ message: "아이디와 비밀번호를 입력해주세요." }, { status: 400 });
  }

  // 1) 관리자 env 계정(DB 아님). 아이디 일치 시 이 경로에서만 판정.
  const adminUsername = normalizeUsername(process.env.ADMIN_USERNAME ?? "");
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  if (adminUsername && adminPassword && username === adminUsername) {
    if (safeEqual(password, adminPassword)) return success(request, "admin", 0);
    return fail(request);
  }

  // 2) users 테이블(고객·기사). ensureAuthSchema는 getUserByUsername 안에서 실행되며
  //    첫 호출 시 스키마 생성 + 기존 기사 백필까지 수행한다.
  const user = await getUserByUsername(username);
  if (user && verifyPassword(password, user.password_hash)) {
    return success(request, user.role, user.id);
  }

  // 3) 과도기: users 미매칭 시 구 기사 로그인(name+비번) 폴백. 정규화 전 원본 이름으로.
  if (!user) {
    const legacyBoosterUserId = await tryLegacyBoosterLogin(rawUsername, password);
    if (legacyBoosterUserId) return success(request, "booster", legacyBoosterUserId);
    dummyVerify(password); // 미존재 계정도 scrypt 1회 태워 타이밍 균일화(열거 방지)
  }

  return fail(request);
}
