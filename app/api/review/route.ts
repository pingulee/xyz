import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { ensureReviewSchema, getReviewList, toReview } from "@/lib/review";
import { getSession } from "@/lib/authz";
import { invalidateReviewCaches } from "@/lib/cache-tags";
import { guardMutationRequest } from "@/lib/request-security";

export const runtime = "nodejs";

type ReviewRow = RowDataPacket & {
  id: number;
  name: string;
  service: string;
  booster_id: number | null;
  booster_name: string | null;
  rating: number;
  content: string;
  view_count: number | null;
  user_id: number | null;
  created_at: Date;
  reply_id: number | null;
  reply_booster_id: number | null;
  reply_booster_name: string | null;
  reply_content: string | null;
  reply_tier_records: string | null;
  reply_created_at: Date | null;
};

type BoosterNameRow = RowDataPacket & { name: string };

type ReviewPayload = {
  name?: string;
  service?: string;
  boosterId?: string;
  rating?: number;
  content?: string;
  createdAt?: string;
};

const REVIEW_SELECT = `
  SELECT r.id, r.name, r.service, r.booster_id,
         COALESCE(b.name, r.booster_name) AS booster_name,
         r.rating, r.content, r.view_count, r.user_id, r.created_at,
         rr.id AS reply_id, rr.booster_id AS reply_booster_id,
         rr.booster_name AS reply_booster_name,
         rr.content AS reply_content, rr.tier_records AS reply_tier_records,
         rr.created_at AS reply_created_at
  FROM \`review\` r
  LEFT JOIN booster b ON b.id = r.booster_id
  LEFT JOIN review_replies rr ON rr.review_id = r.id
`;

type RateLimitRow = RowDataPacket & {
  last_created_at: Date;
};

const allowedServices = new Set(["롤 대리", "롤 듀오"]);
const reviewCooldownMs = 10 * 60 * 1000;
const reviewNameMaxLength = 7;
const reviewContentMinLength = 10;
const reviewContentMaxLength = 100;

function isAdminRequest(request: Request): boolean {
  return getSession(request)?.role === "admin";
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
    return NextResponse.json({ reviewList: await getReviewList(100) });
  } catch (error) {
    console.error("Failed to load review", error);
    return NextResponse.json(
      { message: "후기를 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const rejected = guardMutationRequest(request);
  if (rejected) return rejected;

  const session = getSession(request);
  if (session?.role !== "customer" && session?.role !== "admin") {
    return NextResponse.json(
      { message: "로그인한 회원만 후기를 작성할 수 있습니다." },
      { status: 401 },
    );
  }

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
  const boosterId = payload.boosterId ? Number(payload.boosterId) : null;
  const content = payload.content?.trim() ?? "";
  const rating = Number(payload.rating);

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

  if (boosterId === null || !Number.isInteger(boosterId) || boosterId < 1) {
    return NextResponse.json(
      { message: "작업 기사를 선택해주세요." },
      { status: 400 },
    );
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json(
      { message: "평점은 1~5점으로 선택해주세요." },
      { status: 400 },
    );
  }

  if (content.length < reviewContentMinLength || content.length > reviewContentMaxLength) {
    return NextResponse.json(
      { message: `후기는 ${reviewContentMinLength}~${reviewContentMaxLength}자로 입력해주세요.` },
      { status: 400 },
    );
  }

  // 고객 후기는 서명된 세션의 user_id로만 소유권을 연결한다.
  const ownerUserId = session?.role === "customer" ? session.userId : null;

  try {
    await ensureReviewSchema();
    const [boosterRows] = await getPool().execute<BoosterNameRow[]>(
      `SELECT name FROM booster WHERE id = :boosterId AND active = 1 LIMIT 1`,
      { boosterId },
    );
    const boosterName = boosterRows[0]?.name;
    if (!boosterName) {
      return NextResponse.json(
        { message: "작업 기사를 다시 선택해주세요." },
        { status: 400 },
      );
    }

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

    const [result] = await getPool().execute<ResultSetHeader>(
      `INSERT INTO \`review\` (name, service, booster_id, booster_name, rating, content, user_id)
       VALUES (:name, :service, :boosterId, :boosterName, :rating, :content, :userId)`,
      { name, service, boosterId, boosterName, rating, content, userId: ownerUserId },
    );

    const [rows] = await getPool().execute<ReviewRow[]>(
      `${REVIEW_SELECT} WHERE r.id = :id`,
      { id: result.insertId },
    );

    if (!adminWrite) await markReviewCreated(request);

    invalidateReviewCaches();
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
  const rejected = guardMutationRequest(request);
  if (rejected) return rejected;

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

  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json(
      { message: "수정할 후기를 찾을 수 없습니다." },
      { status: 400 },
    );
  }

  const session = getSession(request);
  const adminRequest = session?.role === "admin";

  if (!adminRequest && session?.role !== "customer") {
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 },
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
    await ensureReviewSchema();
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

    const ownsByUser =
      session?.role === "customer" &&
      existingReview.user_id !== null &&
      existingReview.user_id === session.userId;

    if (
      !adminRequest &&
      !ownsByUser
    ) {
      return NextResponse.json(
        { message: "본인이 작성한 후기만 수정할 수 있습니다." },
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
        `UPDATE \`review\` SET service = :service, rating = :rating, content = :content, created_at = :createdAt WHERE id = :id`,
        { id, service, rating, content, createdAt },
      );
    } else {
      await getPool().execute(
        `UPDATE \`review\` SET service = :service, rating = :rating, content = :content WHERE id = :id`,
        { id, service, rating, content },
      );
    }

    const [rows] = await getPool().execute<ReviewRow[]>(
      `${REVIEW_SELECT} WHERE r.id = :id`,
      { id },
    );

    invalidateReviewCaches(id);
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
  const rejected = guardMutationRequest(request, { maxBytes: 4 * 1024 });
  if (rejected) return rejected;

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
    await ensureReviewSchema();
    await getPool().execute(
      `UPDATE \`review\` SET view_count = view_count + 1 WHERE id = :id`,
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
  const rejected = guardMutationRequest(request, { maxBytes: 4 * 1024 });
  if (rejected) return rejected;

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

  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json(
      { message: "삭제할 후기를 찾을 수 없습니다." },
      { status: 400 },
    );
  }

  const session = getSession(request);
  const adminRequest = session?.role === "admin";

  if (!adminRequest && session?.role !== "customer") {
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

  try {
    await ensureReviewSchema();
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

    const ownsByUser =
      session?.role === "customer" &&
      review.user_id !== null &&
      review.user_id === session.userId;

    if (!adminRequest && !ownsByUser) {
      return NextResponse.json(
        { message: "본인이 작성한 후기만 삭제할 수 있습니다." },
        { status: 403 },
      );
    }

    if (!adminRequest && review.reply_id) {
      return NextResponse.json(
        { message: "기사 답변이 달린 후기는 삭제할 수 없습니다." },
        { status: 409 },
      );
    }

    await getPool().execute(`DELETE FROM \`review\` WHERE id = :id`, { id });
    invalidateReviewCaches(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete review", error);
    return NextResponse.json(
      { message: "후기를 삭제하지 못했습니다." },
      { status: 500 },
    );
  }
}
