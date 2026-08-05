import { NextResponse } from "next/server";
import { guardMutationRequest } from "@/lib/request-security";
import { isAuthRateLimited, recordAuthAttempt } from "@/lib/authRateLimit";
import {
  getUserByEmail,
  isValidEmail,
  normalizeEmail,
  normalizeUsername,
} from "@/lib/users";
import { createResetToken } from "@/lib/passwordReset";
import { sendPasswordResetEmail } from "@/lib/mail";
import { site } from "@/lib/site";

export const runtime = "nodejs";

// 비밀번호 재설정 요청. 이메일로 재설정 링크(1시간 유효)를 보낸다. 계정 존재
// 여부는 노출하지 않는다(열거 방지) — 항상 동일한 성공 메시지.
const GENERIC = {
  ok: true,
  message: "가입된 이메일이라면 재설정 링크를 발송했습니다. 메일함을 확인해주세요.",
};

export async function POST(request: Request) {
  const rejected = guardMutationRequest(request, { maxBytes: 2 * 1024 });
  if (rejected) return rejected;
  if (await isAuthRateLimited(request)) {
    return NextResponse.json(
      { message: "시도가 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }
  await recordAuthAttempt(request);

  let email = "";
  let username = "";
  try {
    const body = (await request.json()) as { email?: string; username?: string };
    email = normalizeEmail(body.email ?? "");
    username = normalizeUsername(body.username ?? "");
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (!username) {
    return NextResponse.json({ message: "아이디를 입력해주세요." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ message: "올바른 이메일을 입력해주세요." }, { status: 400 });
  }

  try {
    const user = await getUserByEmail(email);
    // 아이디와 이메일이 같은 계정을 가리킬 때만 발송한다(둘 다 맞아야 함).
    if (user && user.username === username) {
      const token = await createResetToken(user.id);
      const url = `${site.url}/reset-password?token=${token}`;
      await sendPasswordResetEmail(email, url);
    }
  } catch (error) {
    console.error("request-reset mail failed", error);
  }

  return NextResponse.json(GENERIC);
}
