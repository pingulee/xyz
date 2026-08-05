import { NextResponse } from "next/server";
import { getSession } from "@/lib/authz";
import { guardMutationRequest } from "@/lib/request-security";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getPasswordHashById, updateUserPassword } from "@/lib/users";

export const runtime = "nodejs";

const MIN = 8;
const MAX = 128;

// 로그인 회원 본인 비밀번호 변경. 현재 비밀번호 확인 필수(세션 탈취 시 임의 변경 방지).
export async function POST(request: Request) {
  const rejected = guardMutationRequest(request, { maxBytes: 4 * 1024 });
  if (rejected) return rejected;

  const session = getSession(request);
  if (!session || session.userId < 1 || session.role === "admin") {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  let payload: { currentPassword?: string; newPassword?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const current = payload.currentPassword ?? "";
  const next = payload.newPassword?.trim() ?? "";
  if (next.length < MIN || next.length > MAX) {
    return NextResponse.json(
      { message: `새 비밀번호는 ${MIN}~${MAX}자여야 합니다.` },
      { status: 400 },
    );
  }

  const hash = await getPasswordHashById(session.userId);
  if (!hash || !verifyPassword(current, hash)) {
    return NextResponse.json(
      { message: "현재 비밀번호가 일치하지 않습니다." },
      { status: 403 },
    );
  }

  await updateUserPassword(session.userId, hashPassword(next));
  return NextResponse.json({ ok: true });
}
