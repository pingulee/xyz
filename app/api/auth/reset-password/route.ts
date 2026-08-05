import { NextResponse } from "next/server";
import { guardMutationRequest } from "@/lib/request-security";
import { isAuthRateLimited, recordAuthAttempt } from "@/lib/authRateLimit";
import { hashPassword } from "@/lib/password";
import { consumeResetToken } from "@/lib/passwordReset";
import { updateUserPassword } from "@/lib/users";
import { isValidPassword, PASSWORD_RULE_TEXT } from "@/lib/authPolicy";

export const runtime = "nodejs";

// 재설정 링크의 토큰 + 새 비밀번호로 실제 변경. 토큰은 1회용·1시간 유효.
export async function POST(request: Request) {
  const rejected = guardMutationRequest(request, { maxBytes: 4 * 1024 });
  if (rejected) return rejected;
  if (await isAuthRateLimited(request)) {
    return NextResponse.json(
      { message: "시도가 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }
  await recordAuthAttempt(request);

  let payload: { token?: string; newPassword?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const token = (payload.token ?? "").trim();
  const next = payload.newPassword?.trim() ?? "";
  if (!isValidPassword(next)) {
    return NextResponse.json({ message: PASSWORD_RULE_TEXT }, { status: 400 });
  }

  const userId = await consumeResetToken(token);
  if (!userId) {
    return NextResponse.json(
      { message: "유효하지 않거나 만료된 링크입니다. 재설정을 다시 요청해주세요." },
      { status: 400 },
    );
  }

  await updateUserPassword(userId, hashPassword(next));
  return NextResponse.json({ ok: true });
}
