import { NextResponse } from "next/server";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { getSession, resolveBoosterId } from "@/lib/authz";
import { ensureReviewSchema, type TierRecord } from "@/lib/review";
import { invalidateReviewCaches } from "@/lib/cache-tags";
import { guardMutationRequest } from "@/lib/request-security";

export const runtime = "nodejs";

const REPLY_CONTENT_MIN_LENGTH = 10;

type ReviewRow = RowDataPacket & { booster_id: number | null };
type BoosterRow = RowDataPacket & { name: string };

const MAX_TIER_RECORDS = 200;

function isNonNegativeNumber(value: unknown): boolean {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

// 판별 기록: 게임 1판 = 기록 1개 — 티어·챔피언·승패·킬/데스/어시 모두 필수
function isValidTierRecords(records: unknown): records is TierRecord[] {
  if (!Array.isArray(records) || records.length > MAX_TIER_RECORDS) return false;
  return records.every((r) => {
    if (typeof r !== "object" || r === null) return false;
    const obj = r as Record<string, unknown>;
    return (
      typeof obj.tier === "string" &&
      obj.tier.trim() !== "" &&
      typeof obj.champion === "string" &&
      obj.champion.trim() !== "" &&
      typeof obj.win === "boolean" &&
      isNonNegativeNumber(obj.kills) &&
      isNonNegativeNumber(obj.deaths) &&
      isNonNegativeNumber(obj.assists)
    );
  });
}

function toCountStat(value: number | undefined | null): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.min(99, Math.max(0, Math.floor(value)));
}

export async function POST(request: Request) {
  const rejected = guardMutationRequest(request);
  if (rejected) return rejected;

  // 답글 작성은 기사 본인만(role=booster → 자기 booster.id). 관리자는 작성 대상이
  // 아니라 resolveBoosterId가 null → 401. 슈퍼권한은 아래 DELETE에서 처리.
  const boosterId = await resolveBoosterId(getSession(request));
  if (!boosterId) {
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

  let payload: { reviewId?: string; content?: string; tierRecords?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const reviewId = Number(payload.reviewId);
  const content = payload.content?.trim() ?? "";

  const rawRecords = payload.tierRecords ?? [];
  if (!isValidTierRecords(rawRecords)) {
    return NextResponse.json(
      { message: "작업 기록의 티어·챔피언·킬/데스/어시를 모두 입력해주세요." },
      { status: 400 },
    );
  }
  const tierRecords: TierRecord[] = rawRecords.map((r) => ({
    tier: r.tier.trim(),
    champion: r.champion?.trim().slice(0, 40) ?? "",
    win: r.win === true,
    kills: toCountStat(r.kills),
    deaths: toCountStat(r.deaths),
    assists: toCountStat(r.assists),
  }));

  if (!Number.isInteger(reviewId) || reviewId < 1) {
    return NextResponse.json(
      { message: "후기를 찾을 수 없습니다." },
      { status: 400 },
    );
  }
  if (content.length < REPLY_CONTENT_MIN_LENGTH || content.length > 500) {
    return NextResponse.json(
      { message: "답변은 10~500자로 입력해주세요." },
      { status: 400 },
    );
  }

  const [reviewRows] = await getPool().execute<ReviewRow[]>(
    `SELECT booster_id FROM \`review\` WHERE id = :reviewId LIMIT 1`,
    { reviewId },
  );
  const review = reviewRows[0];
  if (!review) {
    return NextResponse.json(
      { message: "후기를 찾을 수 없습니다." },
      { status: 404 },
    );
  }
  if (review.booster_id !== boosterId) {
    return NextResponse.json(
      { message: "해당 후기에 답변 권한이 없습니다." },
      { status: 403 },
    );
  }

  const [boosterRows] = await getPool().execute<BoosterRow[]>(
    `SELECT name FROM booster WHERE id = :id LIMIT 1`,
    { id: boosterId },
  );
  const boosterName = boosterRows[0]?.name ?? "";

  const tierJson = tierRecords.length > 0 ? JSON.stringify(tierRecords) : null;

  await ensureReviewSchema();
  await getPool().execute(
    `DELETE FROM review_replies WHERE review_id = :reviewId`,
    { reviewId },
  );
  const [result] = await getPool().execute<ResultSetHeader>(
    `INSERT INTO review_replies (review_id, booster_id, booster_name, content, tier_records)
     VALUES (:reviewId, :boosterId, :boosterName, :content, :tierJson)`,
    { reviewId, boosterId, boosterName, content, tierJson },
  );

  const [replyRows] = await getPool().execute<RowDataPacket[]>(
    `SELECT id, booster_id, booster_name, content, tier_records, created_at FROM review_replies WHERE id = :id`,
    { id: result.insertId },
  );
  invalidateReviewCaches(reviewId);
  const r = replyRows[0];
  const parsedTier = r.tier_records
    ? ((typeof r.tier_records === "string"
        ? JSON.parse(r.tier_records)
        : r.tier_records) as TierRecord[])
    : [];

  return NextResponse.json(
    {
      reply: {
        id: String(r.id),
        boosterId: String(r.booster_id),
        boosterName: r.booster_name,
        content: r.content,
        tierRecords: parsedTier,
        createdAt: (r.created_at as Date).toISOString(),
      },
    },
    { status: 201 },
  );
}

export async function DELETE(request: Request) {
  const rejected = guardMutationRequest(request, { maxBytes: 4 * 1024 });
  if (rejected) return rejected;

  const session = getSession(request);
  const boosterId = await resolveBoosterId(session);
  const admin = session?.role === "admin"; // 관리자 슈퍼권한: 모든 답글 삭제
  if (!boosterId && !admin) {
    return NextResponse.json({ message: "권한이 없습니다." }, { status: 401 });
  }

  let payload: { reviewId?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { message: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const reviewId = Number(payload.reviewId);
  if (!Number.isInteger(reviewId) || reviewId < 1) {
    return NextResponse.json(
      { message: "후기를 찾을 수 없습니다." },
      { status: 400 },
    );
  }

  if (!admin) {
    const [rows] = await getPool().execute<RowDataPacket[]>(
      `SELECT booster_id FROM review_replies WHERE review_id = :reviewId LIMIT 1`,
      { reviewId },
    );
    if (rows[0]?.booster_id !== boosterId) {
      return NextResponse.json(
        { message: "삭제 권한이 없습니다." },
        { status: 403 },
      );
    }
  }

  await getPool().execute(
    `DELETE FROM review_replies WHERE review_id = :reviewId`,
    { reviewId },
  );
  invalidateReviewCaches(reviewId);
  return NextResponse.json({ ok: true });
}
