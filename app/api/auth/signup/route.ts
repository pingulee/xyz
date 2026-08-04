import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";
import {
  createCustomer,
  isValidUsername,
  normalizeUsername,
} from "@/lib/users";
import { createSessionToken, getSessionCookieHeader } from "@/lib/session";
import { isAuthRateLimited, recordAuthAttempt } from "@/lib/authRateLimit";

export const runtime = "nodejs";

const PASSWORD_MIN_LENGTH = 4;

// 고객 셀프 회원가입. role은 서버에서 'customer'로 강제한다(클라이언트가 role을
// 보내도 무시). 성공 시 자동 로그인 세션을 발급한다.
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

  const username = normalizeUsername(payload.username ?? "");
  const password = payload.password?.trim() ?? "";

  if (!isValidUsername(username)) {
    return NextResponse.json(
      { message: "아이디는 영문 소문자·숫자·밑줄 3~30자로 입력해주세요." },
      { status: 400 },
    );
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return NextResponse.json(
      { message: `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.` },
      { status: 400 },
    );
  }
  // 관리자 아이디 사칭 방지.
  if (username === normalizeUsername(process.env.ADMIN_USERNAME ?? "")) {
    return NextResponse.json({ message: "사용할 수 없는 아이디입니다." }, { status: 409 });
  }

  // 계정 대량 생성 남용 방지 위해 가입 시도를 카운트한다.
  await recordAuthAttempt(request);

  const userId = await createCustomer(username, hashPassword(password));
  if (userId === null) {
    // UNIQUE 충돌 → 이미 존재. (열거 우려는 있으나 가입 UX상 명시가 필요)
    return NextResponse.json({ message: "이미 사용 중인 아이디입니다." }, { status: 409 });
  }

  const token = createSessionToken("customer", userId);
  return NextResponse.json(
    { ok: true, role: "customer" },
    { headers: { "Set-Cookie": getSessionCookieHeader(token) } },
  );
}
