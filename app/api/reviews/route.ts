import { NextResponse } from "next/server";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { ensureReviewsSchema, getReviews, toReview } from "@/lib/reviews";
import {
  getSessionTokenFromRequest,
  validateSession,
} from "@/lib/adminSession";

export const runtime = "nodejs";

type ReviewRow = RowDataPacket & {
  id: number;
  name: string;
  service: string;
  lineup_id: number | null;
  lineup_name: string | null;
  rating: number;
  content: string;
  view_count: number | null;
  password_hash: string | null;
  created_at: Date;
  reply_id: number | null;
  reply_lineup_id: number | null;
  reply_knight_name: string | null;
  reply_content: string | null;
  reply_tier_records: string | null;
  reply_created_at: Date | null;
};

type ReviewPayload = {
  name?: string;
  service?: string;
  lineupId?: string;
  lineupName?: string;
  rating?: number;
  content?: string;
  password?: string;
  createdAt?: string;
};

const REVIEW_SELECT = `
  SELECT r.id, r.name, r.service, r.lineup_id, l.name AS lineup_name,
         r.rating, r.content, r.view_count, r.password_hash, r.created_at,
         rr.id AS reply_id, rr.lineup_id AS reply_lineup_id,
         rr.knight_name AS reply_knight_name,
         rr.content AS reply_content, rr.tier_records AS reply_tier_records,
         rr.created_at AS reply_created_at
  FROM reviews r
  LEFT JOIN lineups l ON l.id = r.lineup_id
  LEFT JOIN review_replies rr ON rr.review_id = r.id
`;

type RateLimitRow = RowDataPacket & {
  last_created_at: Date;
};

const allowedServices = new Set(["롤 대리", "롤 듀오"]);
const reviewCooldownMs = 10 * 60 * 1000;
const reviewNameMaxLength = 7;
const reviewContentMaxLength = 100;

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

function isAdminRequest(request: Request): boolean {
  const token = getSessionTokenFromRequest(request);
  return token ? validateSession(token) : false;
}

function canModifyReview(password: string, review: ReviewRow) {
  return review.password_hash
    ? verifyPassword(password, review.password_hash)
    : false;
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
    `SELECT last_created_at FROM review_rate_limits WHERE ip_hash = :ipHash LIMIT 1`,
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
  const lineupId = payload.lineupId ? Number(payload.lineupId) : null;
  const lineupName = payload.lineupName?.trim() || null;
  const content = payload.content?.trim() ?? "";
  const rating = Number(payload.rating);
  const password = payload.password?.trim() ?? "";

  if (name.length < 1 || name.length > reviewNameMaxLength) {
    return NextResponse.json(
      { message: `닉네임은 1~${reviewNameMaxLength}자로 입력해주세요.` },
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

  if (content.length < 1 || content.length > reviewContentMaxLength) {
    return NextResponse.json(
      { message: `후기는 1~${reviewContentMaxLength}자로 입력해주세요.` },
      { status: 400 },
    );
  }

  if (password.length < 4 || password.length > 40) {
    return NextResponse.json(
      { message: "비밀번호는 4~40자로 입력해주세요." },
      { status: 400 },
    );
  }

  try {
    const adminWrite = isAdminRequest(request);
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
      `INSERT INTO reviews (name, service, lineup_id, lineup_name, rating, content, password_hash)
       VALUES (:name, :service, :lineupId, :lineupName, :rating, :content, :passwordHash)`,
      { name, service, lineupId, lineupName, rating, content, passwordHash },
    );

    const [rows] = await getPool().execute<ReviewRow[]>(
      `${REVIEW_SELECT} WHERE r.id = :id`,
      { id: result.insertId },
    );

    if (!adminWrite) await markReviewCreated(request);

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
  const password = payload.password?.trim() ?? "";

  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json(
      { message: "수정할 후기를 찾을 수 없습니다." },
      { status: 400 },
    );
  }

  const adminRequest = isAdminRequest(request);

  if (!adminRequest && !password) {
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

  if (content.length < 1 || content.length > reviewContentMaxLength) {
    return NextResponse.json(
      { message: `후기는 1~${reviewContentMaxLength}자로 입력해주세요.` },
      { status: 400 },
    );
  }

  try {
    const [existingRows] = await getPool().execute<ReviewRow[]>(
      `${REVIEW_SELECT} WHERE r.id = :id LIMIT 1`,
      { id },
    );

    const existingReview = existingRows[0];
    if (!existingReview) {
      return NextResponse.json(
        { message: "수정할 후기를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (!adminRequest && !canModifyReview(password, existingReview)) {
      return NextResponse.json(
        { message: "비밀번호가 일치하지 않습니다." },
        { status: 403 },
      );
    }

    if (!adminRequest && existingReview.reply_id) {
      return NextResponse.json(
        { message: "기사 답변이 달린 후기는 수정할 수 없습니다." },
        { status: 409 },
      );
    }

    const createdAt =
      adminRequest && payload.createdAt ? new Date(payload.createdAt) : null;
    if (createdAt && isNaN(createdAt.getTime())) {
      return NextResponse.json(
        { message: "날짜 형식이 올바르지 않습니다." },
        { status: 400 },
      );
    }

    if (createdAt) {
      await getPool().execute(
        `UPDATE reviews SET service = :service, rating = :rating, content = :content, created_at = :createdAt WHERE id = :id`,
        { id, service, rating, content, createdAt },
      );
    } else {
      await getPool().execute(
        `UPDATE reviews SET service = :service, rating = :rating, content = :content WHERE id = :id`,
        { id, service, rating, content },
      );
    }

    const [rows] = await getPool().execute<ReviewRow[]>(
      `${REVIEW_SELECT} WHERE r.id = :id`,
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

export async function PATCH(request: Request) {
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
      { message: "후기를 찾을 수 없습니다." },
      { status: 400 },
    );
  }

  try {
    await ensureReviewsSchema();
    await getPool().execute(
      `UPDATE reviews SET view_count = view_count + 1 WHERE id = :id`,
      { id },
    );
    const [rows] = await getPool().execute<ReviewRow[]>(
      `${REVIEW_SELECT} WHERE r.id = :id`,
      { id },
    );
    if (!rows[0]) {
      return NextResponse.json(
        { message: "후기를 찾을 수 없습니다." },
        { status: 404 },
      );
    }
    return NextResponse.json({ review: toReview(rows[0]) });
  } catch (error) {
    console.error("Failed to update review view count", error);
    return NextResponse.json(
      { message: "조회수를 업데이트하지 못했습니다." },
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

  const adminRequest = isAdminRequest(request);

  if (!adminRequest && !password) {
    return NextResponse.json(
      { message: "비밀번호를 입력해주세요." },
      { status: 400 },
    );
  }

  try {
    const [rows] = await getPool().execute<ReviewRow[]>(
      `${REVIEW_SELECT} WHERE r.id = :id LIMIT 1`,
      { id },
    );

    const review = rows[0];
    if (!review) {
      return NextResponse.json(
        { message: "삭제할 후기를 찾을 수 없습니다." },
        { status: 404 },
      );
    }

    if (!adminRequest && !canModifyReview(password, review)) {
      return NextResponse.json(
        { message: "비밀번호가 일치하지 않습니다." },
        { status: 403 },
      );
    }

    if (!adminRequest && review.reply_id) {
      return NextResponse.json(
        { message: "기사 답변이 달린 후기는 삭제할 수 없습니다." },
        { status: 409 },
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
