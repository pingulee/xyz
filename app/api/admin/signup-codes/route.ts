import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/authz";
import {
  createSignupCode,
  listSignupCodes,
  deleteSignupCode,
} from "@/lib/signupCodes";
import { guardMutationRequest } from "@/lib/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 기사 가입 코드 관리(관리자 전용). 합격 기사에게 발급한다.
export async function GET(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 });
  }
  return NextResponse.json({ codes: await listSignupCodes() });
}

export async function POST(request: Request) {
  const rejected = guardMutationRequest(request, { maxBytes: 1024, contentTypes: ["application/json", "text/plain"] });
  if (rejected) return rejected;

  if (!isAdmin(request)) {
    return NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 });
  }
  const code = await createSignupCode();
  return NextResponse.json({ code }, { status: 201 });
}

export async function DELETE(request: Request) {
  const rejected = guardMutationRequest(request, { maxBytes: 4 * 1024 });
  if (rejected) return rejected;

  if (!isAdmin(request)) {
    return NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 });
  }
  let payload: { code?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  const code = payload.code?.trim() ?? "";
  if (!code) {
    return NextResponse.json({ message: "코드를 지정해주세요." }, { status: 400 });
  }
  await deleteSignupCode(code);
  return NextResponse.json({ ok: true });
}
