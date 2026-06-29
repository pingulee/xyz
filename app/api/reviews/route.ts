import { NextResponse } from "next/server";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

type ReviewRow = RowDataPacket & {
  id: number;
  name: string;
  service: string;
  rating: number;
  content: string;
  image_data: string | null;
  password_hash: string | null;
  created_at: Date;
};

type ReviewPayload = {
  name?: string;
  service?: string;
  rating?: number;
  content?: string;
  image?: string;
  password?: string;
  admin?: boolean;
};

const allowedServices = new Set(["롤 대리", "롤 듀오", "롤 계정"]);
const maxImageLength = 1024 * 1024 * 3;

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const hashBuffer = Buffer.from(hash, "hex");
  const inputBuffer = scryptSync(password, salt, 64);

  return (
    hashBuffer.length === inputBuffer.length &&
    timingSafeEqual(hashBuffer, inputBuffer)
  );
}

function toReview(row: ReviewRow) {
  return {
    id: String(row.id),
    name: row.name,
    service: row.service,
    rating: row.rating,
    content: row.content,
    image: row.image_data ?? undefined,
    createdAt: row.created_at.toISOString(),
  };
}

export async function GET() {
  try {
    const [rows] = await getPool().query<ReviewRow[]>(
      `SELECT id, name, service, rating, content, image_data, created_at
       FROM reviews
       ORDER BY created_at DESC
       LIMIT 100`,
    );

    return NextResponse.json({ reviews: rows.map(toReview) });
  } catch (error) {
    console.error("Failed to load reviews", error);
    return NextResponse.json(
      { message: "후기를 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let payload: ReviewPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const name = payload.name?.trim() ?? "";
  const service = payload.service?.trim() ?? "";
  const content = payload.content?.trim() ?? "";
  const rating = Number(payload.rating);
  const image = payload.image?.trim() || null;
  const password = payload.password?.trim() ?? "";

  if (name.length < 1 || name.length > 20) {
    return NextResponse.json(
      { message: "닉네임은 1~20자로 입력해주세요." },
      { status: 400 },
    );
  }

  if (!allowedServices.has(service)) {
    return NextResponse.json(
      { message: "서비스를 다시 선택해주세요." },
      { status: 400 },
    );
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { message: "평점은 1~5점으로 선택해주세요." },
      { status: 400 },
    );
  }

  if (content.length < 1 || content.length > 400) {
    return NextResponse.json(
      { message: "후기는 1~400자로 입력해주세요." },
      { status: 400 },
    );
  }

  if (password.length < 4 || password.length > 40) {
    return NextResponse.json(
      { message: "비밀번호는 4~40자로 입력해주세요." },
      { status: 400 },
    );
  }

  if (image && (!image.startsWith("data:image/") || image.length > maxImageLength)) {
    return NextResponse.json(
      { message: "이미지는 2MB 이하의 이미지 파일만 첨부할 수 있습니다." },
      { status: 400 },
    );
  }

  try {
    const passwordHash = hashPassword(password);
    const [result] = await getPool().execute<ResultSetHeader>(
      `INSERT INTO reviews (name, service, rating, content, image_data, password_hash)
       VALUES (:name, :service, :rating, :content, :image, :passwordHash)`,
      { name, service, rating, content, image, passwordHash },
    );

    const [rows] = await getPool().execute<ReviewRow[]>(
      `SELECT id, name, service, rating, content, image_data, created_at
       FROM reviews
       WHERE id = :id`,
      { id: result.insertId },
    );

    return NextResponse.json({ review: toReview(rows[0]) }, { status: 201 });
  } catch (error) {
    console.error("Failed to create review", error);
    return NextResponse.json(
      { message: "후기를 저장하지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  let payload: ReviewPayload & { id?: string };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const id = Number(payload.id);
  const name = payload.name?.trim() ?? "";
  const password = payload.password?.trim() ?? "";

  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json(
      { message: "삭제할 후기를 찾을 수 없습니다." },
      { status: 400 },
    );
  }

  if (!password) {
    return NextResponse.json(
      { message: "비밀번호를 입력해주세요." },
      { status: 400 },
    );
  }

  try {
    const [rows] = await getPool().execute<ReviewRow[]>(
      `SELECT id, name, service, rating, content, image_data, password_hash, created_at
       FROM reviews
       WHERE id = :id
       LIMIT 1`,
      { id },
    );

    const review = rows[0];
    if (!review) {
      return NextResponse.json(
        { message: "삭제할 후기를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    const adminPassword = process.env.REVIEW_ADMIN_PASSWORD;
    const isAdmin = Boolean(
      payload.admin && adminPassword && password === adminPassword,
    );
    const isOwner = review.password_hash
      ? name === review.name && verifyPassword(password, review.password_hash)
      : false;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { message: "이름 또는 비밀번호가 일치하지 않습니다." },
        { status: 403 },
      );
    }

    await getPool().execute(`DELETE FROM reviews WHERE id = :id`, { id });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete review", error);
    return NextResponse.json(
      { message: "후기를 삭제하지 못했습니다." },
      { status: 500 },
    );
  }
}
