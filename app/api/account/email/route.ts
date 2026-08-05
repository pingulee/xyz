import { NextResponse } from "next/server";
import { getSession } from "@/lib/authz";
import { guardMutationRequest } from "@/lib/request-security";
import { verifyPassword } from "@/lib/password";
import {
  getPasswordHashById,
  isValidEmail,
  normalizeEmail,
  updateUserEmail,
} from "@/lib/users";

export const runtime = "nodejs";

// 로그인 회원 본인 이메일 변경. 현재 비밀번호 확인 필수. UNIQUE 충돌이면 409.
export async function POST(request: Request) {
  const rejected = guardMutationRequest(request, { maxBytes: 4 * 1024 });
  if (rejected) return rejected;

  const session = getSession(request);
  if (!session || session.userId < 1 || session.role === "admin") {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  let payload: { currentPassword?: string; email?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const email = normalizeEmail(payload.email ?? "");
  if (!isValidEmail(email)) {
    return NextResponse.json({ message: "올바른 이메일을 입력해주세요." }, { status: 400 });
  }

  const hash = await getPasswordHashById(session.userId);
  if (!hash || !verifyPassword(payload.currentPassword ?? "", hash)) {
    return NextResponse.json(
      { message: "현재 비밀번호가 일치하지 않습니다." },
      { status: 403 },
    );
  }

  const ok = await updateUserEmail(session.userId, email);
  if (!ok) {
    return NextResponse.json({ message: "이미 사용 중인 이메일입니다." }, { status: 409 });
  }
  return NextResponse.json({ ok: true, email });
}
