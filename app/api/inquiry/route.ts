import { NextResponse } from "next/server";
import { getSession } from "@/lib/authz";
import { guardMutationRequest } from "@/lib/request-security";
import { hashPassword } from "@/lib/password";
import { getDisplayNameById } from "@/lib/users";
import { createInquiry, getInquiryList } from "@/lib/inquiry";

export const runtime = "nodejs";

const TITLE_MAX = 200;
const CONTENT_MAX = 20_000;
const PW_MIN = 4;
const PW_MAX = 128;

type Payload = {
  title?: string;
  content?: string;
  password?: string;
  name?: string;
};

// 목록: 제목·작성자·답변여부·날짜만(본문 비공개). 공개.
export async function GET() {
  const inquiries = await getInquiryList();
  return NextResponse.json({ inquiries });
}

// 등록: 비회원도 가능(임시 비밀번호 필수). 회원은 세션으로 소유가 잡혀 비번 불필요.
export async function POST(request: Request) {
  const rejected = guardMutationRequest(request, { maxBytes: 64 * 1024 });
  if (rejected) return rejected;

  let payload: Payload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const title = (payload.title ?? "").trim();
  const content = (payload.content ?? "").trim();
  if (!title || !content) {
    return NextResponse.json({ message: "제목과 내용을 입력해주세요." }, { status: 400 });
  }
  if (title.length > TITLE_MAX || content.length > CONTENT_MAX) {
    return NextResponse.json({ message: "입력이 너무 깁니다." }, { status: 400 });
  }

  const session = getSession(request);
  const isMember = Boolean(session && session.userId > 0);

  let passwordHash: string | null = null;
  let userId: number | null = null;
  let authorName = (payload.name ?? "").trim().slice(0, 60);

  if (isMember) {
    userId = session!.userId;
    // 작성자명은 계정의 사이트 닉네임에서 끌어온다(클라 입력 무시).
    authorName = (await getDisplayNameById(userId)) ?? "회원";
  } else {
    // 비회원: 임시 비밀번호 필수(본인 문의 열람·삭제용).
    const password = payload.password?.trim() ?? "";
    if (password.length < PW_MIN || password.length > PW_MAX) {
      return NextResponse.json(
        { message: `비밀번호는 ${PW_MIN}~${PW_MAX}자로 입력해주세요.` },
        { status: 400 },
      );
    }
    passwordHash = hashPassword(password);
    if (!authorName) authorName = "비회원";
  }

  const id = await createInquiry({ title, content, authorName, passwordHash, userId });
  return NextResponse.json({ ok: true, id }, { status: 201 });
}
