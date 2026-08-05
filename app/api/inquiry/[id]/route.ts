import { NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/authz";
import { guardMutationRequest } from "@/lib/request-security";
import { verifyPassword } from "@/lib/password";
import {
  deleteInquiry,
  getInquiryRecordById,
  setInquiryAnswer,
  toFull,
  type InquiryRecord,
} from "@/lib/inquiry";
import type { Session } from "@/lib/session";

export const runtime = "nodejs";

const ANSWER_MAX = 20_000;

// 열람·삭제 권한: 관리자 | 세션 소유(회원 작성) | 임시 비밀번호 일치(비회원 작성).
function authorize(
  session: Session | null,
  rec: InquiryRecord,
  password: string,
): boolean {
  if (session?.role === "admin") return true;
  if (session && session.userId > 0 && rec.userId === session.userId) return true;
  if (password && rec.passwordHash && verifyPassword(password, rec.passwordHash)) {
    return true;
  }
  return false;
}

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// 본문 열람. 인증(관리자|소유|비번) 통과 시에만 content/answer를 내려준다.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const rejected = guardMutationRequest(request, { maxBytes: 4 * 1024 });
  if (rejected) return rejected;

  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });

  let password = "";
  try {
    const body = (await request.json().catch(() => ({}))) as { password?: string };
    password = body.password?.trim() ?? "";
  } catch {
    /* 본문 없어도 됨(세션 소유/관리자) */
  }

  const rec = await getInquiryRecordById(id);
  if (!rec) return NextResponse.json({ message: "문의를 찾을 수 없습니다." }, { status: 404 });

  if (!authorize(getSession(request), rec, password)) {
    return NextResponse.json(
      { message: "열람 권한이 없습니다. 비밀번호를 확인해주세요." },
      { status: 403 },
    );
  }
  return NextResponse.json({ inquiry: toFull(rec) });
}

// 답변(관리자 전용).
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const rejected = guardMutationRequest(request, { maxBytes: 32 * 1024 });
  if (rejected) return rejected;
  if (!isAdmin(request)) {
    return NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });

  let answer = "";
  try {
    const body = (await request.json()) as { answer?: string };
    answer = (body.answer ?? "").trim();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }
  if (!answer || answer.length > ANSWER_MAX) {
    return NextResponse.json({ message: "답변 내용을 확인해주세요." }, { status: 400 });
  }

  const ok = await setInquiryAnswer(id, answer);
  if (!ok) return NextResponse.json({ message: "문의를 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

// 삭제(관리자 | 소유 | 비번).
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const rejected = guardMutationRequest(request, { maxBytes: 4 * 1024 });
  if (rejected) return rejected;

  const id = parseId((await params).id);
  if (!id) return NextResponse.json({ message: "잘못된 요청입니다." }, { status: 400 });

  let password = "";
  try {
    const body = (await request.json().catch(() => ({}))) as { password?: string };
    password = body.password?.trim() ?? "";
  } catch {
    /* 세션 소유/관리자면 본문 없어도 됨 */
  }

  const rec = await getInquiryRecordById(id);
  if (!rec) return NextResponse.json({ message: "문의를 찾을 수 없습니다." }, { status: 404 });

  if (!authorize(getSession(request), rec, password)) {
    return NextResponse.json({ message: "삭제 권한이 없습니다." }, { status: 403 });
  }
  await deleteInquiry(id);
  return NextResponse.json({ ok: true });
}
