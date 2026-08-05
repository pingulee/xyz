import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/authz";
import { guardMutationRequest } from "@/lib/request-security";
import { invalidateNoticeCaches } from "@/lib/cache-tags";
import {
  createNotice,
  deleteNotice,
  getNoticeList,
  updateNotice,
} from "@/lib/notice";

export const runtime = "nodejs";

const TITLE_MAX = 200;
const CONTENT_MAX = 20_000;

type NoticePayload = {
  id?: number | string;
  title?: string;
  content?: string;
  pinned?: boolean;
};

// 공지 본문·제목 검증. 공백만이면 거부, 상한 초과면 거부.
function validate(
  payload: NoticePayload,
): { title: string; content: string; pinned: boolean } | { message: string } {
  const title = (payload.title ?? "").trim();
  const content = (payload.content ?? "").trim();
  if (!title || !content) {
    return { message: "제목과 내용을 입력해주세요." };
  }
  if (title.length > TITLE_MAX) {
    return { message: `제목은 ${TITLE_MAX}자 이하여야 합니다.` };
  }
  if (content.length > CONTENT_MAX) {
    return { message: `내용은 ${CONTENT_MAX}자 이하여야 합니다.` };
  }
  return { title, content, pinned: Boolean(payload.pinned) };
}

// 목록은 공개 조회(공지 페이지 클라이언트 갱신용). 상세는 페이지에서 직접 읽는다.
export async function GET() {
  const notices = await getNoticeList();
  return NextResponse.json({ notices });
}

export async function POST(request: Request) {
  const rejected = guardMutationRequest(request, { maxBytes: 64 * 1024 });
  if (rejected) return rejected;
  if (!isAdmin(request)) {
    return NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  let payload: NoticePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const result = validate(payload);
  if ("message" in result) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  const id = await createNotice(result);
  invalidateNoticeCaches(id);
  return NextResponse.json({ ok: true, id }, { status: 201 });
}

export async function PUT(request: Request) {
  const rejected = guardMutationRequest(request, { maxBytes: 64 * 1024 });
  if (rejected) return rejected;
  if (!isAdmin(request)) {
    return NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  let payload: NoticePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const id = Number(payload.id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ message: "잘못된 공지 id입니다." }, { status: 400 });
  }
  const result = validate(payload);
  if ("message" in result) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  const updated = await updateNotice(id, result);
  if (!updated) {
    return NextResponse.json({ message: "공지를 찾을 수 없습니다." }, { status: 404 });
  }
  invalidateNoticeCaches(id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const rejected = guardMutationRequest(request, { maxBytes: 4 * 1024 });
  if (rejected) return rejected;
  if (!isAdmin(request)) {
    return NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  let payload: NoticePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const id = Number(payload.id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ message: "잘못된 공지 id입니다." }, { status: 400 });
  }

  const deleted = await deleteNotice(id);
  if (!deleted) {
    return NextResponse.json({ message: "공지를 찾을 수 없습니다." }, { status: 404 });
  }
  invalidateNoticeCaches(id);
  return NextResponse.json({ ok: true });
}
