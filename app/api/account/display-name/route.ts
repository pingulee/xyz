import { NextResponse } from "next/server";
import { getSession } from "@/lib/authz";
import { guardMutationRequest } from "@/lib/request-security";
import {
  isValidDisplayName,
  normalizeDisplayName,
  updateUserDisplayName,
} from "@/lib/users";

export const runtime = "nodejs";

// 사이트 닉네임 변경. 후기·문의 작성자명으로 쓰인다. 세션 게이트.
export async function POST(request: Request) {
  const rejected = guardMutationRequest(request, { maxBytes: 2 * 1024 });
  if (rejected) return rejected;

  const session = getSession(request);
  if (!session || session.userId < 1 || session.role === "admin") {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  let payload: { displayName?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const displayName = normalizeDisplayName(payload.displayName ?? "");
  if (!isValidDisplayName(displayName)) {
    return NextResponse.json(
      { message: "사이트 닉네임은 2~20자로 입력해주세요." },
      { status: 400 },
    );
  }

  await updateUserDisplayName(session.userId, displayName);
  return NextResponse.json({ ok: true, displayName });
}
