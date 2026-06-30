import { NextResponse } from "next/server";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { getReviews, toReview } from "@/lib/reviews";

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
};

type RateLimitRow = RowDataPacket & {
  last_created_at: Date;
};

const allowedServices = new Set(["롤 대리", "롤 듀오", "롤 계정"]);
const maxImageLength = 1024 * 1024 * 3;
const reviewCooldownMs = 10 * 60 * 1000;
const allowedImagePrefixes = [
  "data:image/jpeg;base64,",
  "data:image/jpg;base64,",
  "data:image/png;base64,",
  "data:image/webp;base64,",
];

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

function isAllowedImageData(image: string | null) {
  if (!image) return true;

  return (
    image.length <= maxImageLength &&
    allowedImagePrefixes.some((prefix) => image.startsWith(prefix))
  );
}

function canModifyReview(password: string, review: ReviewRow) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  const isAdmin = Boolean(adminPassword && password === adminPassword);
  const isOwner = review.password_hash
    ? verifyPassword(password, review.password_hash)
    : false;

  return isAdmin || isOwner;
}

function isAdminPassword(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  return Boolean(adminPassword && password === adminPassword);
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    forwardedFor?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function hashClientIp(request: Request) {
  return createHash("sha256").update(getClientIp(request)).digest("hex");
}

async function getReviewCooldown(request: Request) {
  const ipHash = hashClientIp(request);
  const [rows] = await getPool().execute<RateLimitRow[]>(
    `SELECT last_created_at
     FROM review_rate_limits
     WHERE ip_hash = :ipHash
     LIMIT 1`,
    { ipHash },
  );

  const lastCreatedAt = rows[0]?.last_created_at;
  if (!lastCreatedAt) return 0;

  return Math.max(0, reviewCooldownMs - (Date.now() - lastCreatedAt.getTime()));
}

async function markReviewCreated(request: Request) {
  const ipHash = hashClientIp(request);
  await getPool().execute(
    `INSERT INTO review_rate_limits (ip_hash, last_created_at)
     VALUES (:ipHash, CURRENT_TIMESTAMP)
     ON DUPLICATE KEY UPDATE last_created_at = CURRENT_TIMESTAMP`,
    { ipHash },
  );
}

export async function GET() {
  try {
    return NextResponse.json({ reviews: await getReviews() });
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

  if (!isAllowedImageData(image)) {
    return NextResponse.json(
      {
        message:
          "이미지는 2MB 이하의 JPG, PNG, WEBP, GIF만 첨부할 수 있습니다.",
      },
      { status: 400 },
    );
  }

  try {
    const adminWrite = isAdminPassword(password);
    if (!adminWrite) {
      const cooldown = await getReviewCooldown(request);
      if (cooldown > 0) {
        const minutes = Math.ceil(cooldown / 60000);
        return NextResponse.json(
          { message: `후기는 ${minutes}분 뒤에 다시 작성할 수 있습니다.` },
          { status: 429 },
        );
      }
    }

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

    if (!adminWrite) {
      await markReviewCreated(request);
    }

    return NextResponse.json({ review: toReview(rows[0]) }, { status: 201 });
  } catch (error) {
    console.error("Failed to create review", error);
    return NextResponse.json(
      { message: "후기를 저장하지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
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
  const service = payload.service?.trim() ?? "";
  const content = payload.content?.trim() ?? "";
  const rating = Number(payload.rating);
  const image = payload.image?.trim() || null;
  const password = payload.password?.trim() ?? "";

  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json(
      { message: "수정할 후기를 찾을 수 없습니다." },
      { status: 400 },
    );
  }

  if (!password) {
    return NextResponse.json(
      { message: "비밀번호를 입력해주세요." },
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

  if (!isAllowedImageData(image)) {
    return NextResponse.json(
      {
        message:
          "이미지는 2MB 이하의 JPG, PNG, WEBP, GIF만 첨부할 수 있습니다.",
      },
      { status: 400 },
    );
  }

  try {
    const [existingRows] = await getPool().execute<ReviewRow[]>(
      `SELECT id, name, service, rating, content, image_data, password_hash, created_at
       FROM reviews
       WHERE id = :id
       LIMIT 1`,
      { id },
    );

    const existingReview = existingRows[0];
    if (!existingReview) {
      return NextResponse.json(
        { message: "수정할 후기를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (!canModifyReview(password, existingReview)) {
      return NextResponse.json(
        { message: "비밀번호가 일치하지 않습니다." },
        { status: 403 },
      );
    }

    await getPool().execute(
      `UPDATE reviews
       SET service = :service,
           rating = :rating,
           content = :content,
           image_data = :image
       WHERE id = :id`,
      { id, service, rating, content, image },
    );

    const [rows] = await getPool().execute<ReviewRow[]>(
      `SELECT id, name, service, rating, content, image_data, created_at
       FROM reviews
       WHERE id = :id`,
      { id },
    );

    return NextResponse.json({ review: toReview(rows[0]) });
  } catch (error) {
    console.error("Failed to update review", error);
    return NextResponse.json(
      { message: "후기를 수정하지 못했습니다." },
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

    if (!canModifyReview(password, review)) {
      return NextResponse.json(
        { message: "비밀번호가 일치하지 않습니다." },
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
