import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { verifyPassword, dummyVerify } from "@/lib/password";
import { getUserByUsername, normalizeUsername } from "@/lib/users";
import {
  createSessionToken,
  getSessionCookieHeader,
  type Role,
} from "@/lib/session";
import {
  isAuthRateLimited,
  isAuthAccountRateLimited,
  recordAuthAttempt,
  clearAuthAttempts,
} from "@/lib/authRateLimit";
import { guardMutationRequest } from "@/lib/request-security";

export const runtime = "nodejs";

// 길이가 다르면 timingSafeEqual이 던지므로 먼저 길이를 확인한다.
function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

async function success(username: string, role: Role, userId: number) {
  await clearAuthAttempts(username);
  const token = createSessionToken(role, userId);
  return NextResponse.json(
    { ok: true, role },
    { headers: { "Set-Cookie": getSessionCookieHeader(token) } },
  );
}

// username·비번 모두 불일치와 동일한 응답(열거 방지) + 시도 카운트.
async function fail(request: Request, username: string) {
  await recordAuthAttempt(request, username);
  return NextResponse.json(
    { message: "아이디 또는 비밀번호가 일치하지 않습니다." },
    { status: 403 },
  );
}

export async function POST(request: Request) {
  const rejected = guardMutationRequest(request, { maxBytes: 8 * 1024 });
  if (rejected) return rejected;

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

  const username = normalizeUsername(payload.username ?? "");
  const password = payload.password?.trim() ?? "";
  if (!username || !password || password.length > 128) {
    return NextResponse.json({ message: "아이디와 비밀번호를 입력해주세요." }, { status: 400 });
  }
  if (await isAuthAccountRateLimited(username)) {
    return NextResponse.json(
      { message: "시도가 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  // 1) 관리자 env 계정(DB 아님). 아이디 일치 시 이 경로에서만 판정.
  const adminUsername = normalizeUsername(process.env.ADMIN_USERNAME ?? "");
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  if (adminUsername && adminPassword && username === adminUsername) {
    if (safeEqual(password, adminPassword)) return success(username, "admin", 0);
    return fail(request, username);
  }

  // 2) users 테이블(고객·기사). getUserByUsername이 첫 호출 시 스키마 생성 + 백필.
  const user = await getUserByUsername(username);
  if (user && verifyPassword(password, user.password_hash)) {
    return success(username, user.role, user.id);
  }

  // 미존재 계정도 scrypt 1회 태워 타이밍 균일화(열거 방지)
  if (!user) dummyVerify(password);
  return fail(request, username);
}
