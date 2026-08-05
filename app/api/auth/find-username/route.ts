import { NextResponse } from "next/server";
import { guardMutationRequest } from "@/lib/request-security";
import { isAuthRateLimited, recordAuthAttempt } from "@/lib/authRateLimit";
import { getUserByEmail, isValidEmail, normalizeEmail } from "@/lib/users";
import { sendUsernameEmail } from "@/lib/mail";

export const runtime = "nodejs";

// 아이디 찾기. 이메일로 계정을 찾아 아이디를 메일로 보낸다. 계정 존재 여부는
// 응답에 노출하지 않는다(열거 방지) — 항상 동일한 성공 메시지.
const GENERIC = {
  ok: true,
  message: "가입된 이메일이라면 아이디를 발송했습니다. 메일함을 확인해주세요.",
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
  try {
    const body = (await request.json()) as { email?: string };
    email = normalizeEmail(body.email ?? "");
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ message: "올바른 이메일을 입력해주세요." }, { status: 400 });
  }

  try {
    const user = await getUserByEmail(email);
    if (user) await sendUsernameEmail(email, user.username);
  } catch (error) {
    // 메일 실패·SMTP 미설정도 응답은 동일(열거 방지). 서버 로그로만 남긴다.
    console.error("find-username mail failed", error);
  }

  return NextResponse.json(GENERIC);
}
