import { NextResponse } from "next/server";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { getNotices, toNotice } from "@/lib/notices";
import { getSessionTokenFromRequest, validateSession } from "@/lib/adminSession";

export const runtime = "nodejs";

type NoticePayload = {
  id?: string;
  title?: string;
  content?: string;
  image?: string | null;
  pinned?: boolean;
};

type NoticeRow = RowDataPacket & {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  pinned: 0 | 1;
  created_at: Date;
  updated_at: Date;
};

function isAdminRequest(request: Request): boolean {
  const token = getSessionTokenFromRequest(request);
  return token ? validateSession(token) : false;
}

function isValidImageUrl(image: string | null | undefined): boolean {
  if (!image) return true;
  return image.startsWith("/uploads/notices/") && image.length <= 255;
}

function validateNotice(payload: NoticePayload) {
  const title = payload.title?.trim() ?? "";
  const content = payload.content?.trim() ?? "";
  const image = payload.image ?? null;

  if (title.length < 1 || title.length > 120) {
    return { message: "제목은 1~120자로 입력해주세요." };
  }

  if (content.length < 1 || content.length > 3000) {
    return { message: "내용은 1~3000자로 입력해주세요." };
  }

  if (!isValidImageUrl(image)) {
    return { message: "이미지 형식이 올바르지 않습니다. (JPG/PNG/WEBP, 3MB 이하)" };
  }

  return { title, content, image };
}

export async function GET() {
  try {
    return NextResponse.json({ notices: await getNotices() });
  } catch (error) {
    console.error("Failed to load notices", error);
    return NextResponse.json(
      { message: "공지사항을 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  let payload: NoticePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const validated = validateNotice(payload);
  if ("message" in validated) {
    return NextResponse.json({ message: validated.message }, { status: 400 });
  }

  try {
    const [result] = await getPool().execute<ResultSetHeader>(
      `INSERT INTO notices (title, content, image_url, pinned)
       VALUES (:title, :content, :image, :pinned)`,
      {
        title: validated.title,
        content: validated.content,
        image: validated.image,
        pinned: Boolean(payload.pinned),
      },
    );

    const [rows] = await getPool().execute<NoticeRow[]>(
      `SELECT id, title, content, image_url, pinned, created_at, updated_at
       FROM notices
       WHERE id = :id`,
      { id: result.insertId },
    );

    return NextResponse.json({ notice: toNotice(rows[0]) }, { status: 201 });
  } catch (error) {
    console.error("Failed to create notice", error);
    return NextResponse.json(
      { message: "공지사항을 저장하지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  let payload: NoticePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const id = Number(payload.id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json(
      { message: "수정할 공지사항을 찾을 수 없습니다." },
      { status: 400 },
    );
  }

  const validated = validateNotice(payload);
  if ("message" in validated) {
    return NextResponse.json({ message: validated.message }, { status: 400 });
  }

  try {
    await getPool().execute(
      `UPDATE notices
       SET title = :title,
           content = :content,
           image_url = :image,
           pinned = :pinned
       WHERE id = :id`,
      {
        id,
        title: validated.title,
        content: validated.content,
        image: validated.image,
        pinned: Boolean(payload.pinned),
      },
    );

    const [rows] = await getPool().execute<NoticeRow[]>(
      `SELECT id, title, content, image_url, pinned, created_at, updated_at
       FROM notices
       WHERE id = :id`,
      { id },
    );

    if (!rows[0]) {
      return NextResponse.json(
        { message: "수정할 공지사항을 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    return NextResponse.json({ notice: toNotice(rows[0]) });
  } catch (error) {
    console.error("Failed to update notice", error);
    return NextResponse.json(
      { message: "공지사항을 수정하지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  let payload: { id?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const id = Number(payload.id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json(
      { message: "삭제할 공지사항을 찾을 수 없습니다." },
      { status: 400 },
    );
  }

  try {
    await getPool().execute(`DELETE FROM notices WHERE id = :id`, { id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete notice", error);
    return NextResponse.json(
      { message: "공지사항을 삭제하지 못했습니다." },
      { status: 500 },
    );
  }
}
