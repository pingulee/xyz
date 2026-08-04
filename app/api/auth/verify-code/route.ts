import { NextResponse } from "next/server";
import { verifyCode } from "@/lib/signupCodes";
import { isAuthRateLimited, recordAuthAttempt } from "@/lib/authRateLimit";

export const runtime = "nodejs";

// 기사 회원가입 1단계: 가입 코드 유효성만 확인(소진 안 함). 유효하면 폼이
// 프로필 입력 단계로 넘어간다. 최종 소진·활성화는 /api/auth/signup 트랜잭션.
// 코드는 96비트 랜덤이라 추측 불가하나, 열거 방지로 레이트리밋을 건다.
export async function POST(request: Request) {
  if (await isAuthRateLimited(request)) {
    return NextResponse.json(
      { message: "시도가 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  let code = "";
  try {
    const body = (await request.json()) as { code?: string };
    code = body.code?.trim() ?? "";
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  await recordAuthAttempt(request);

  if (!code) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  const valid = await verifyCode(code);
  return NextResponse.json({ valid });
}
