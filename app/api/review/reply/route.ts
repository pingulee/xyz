import { NextResponse } from "next/server";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { getBoosterLineupId } from "@/lib/boosterSession";
import {
  getSessionTokenFromRequest,
  validateSession,
} from "@/lib/adminSession";
import { ensureReviewSchema, type TierRecord } from "@/lib/review";
import { clearStatsCache } from "@/lib/stats-cache";

export const runtime = "nodejs";

const REPLY_CONTENT_MIN_LENGTH = 10;

type ReviewRow = RowDataPacket & { lineup_id: number | null };
type LineupRow = RowDataPacket & { name: string };

function isAdminRequest(request: Request): boolean {
  const token = getSessionTokenFromRequest(request);
  return token ? validateSession(token) : false;
}

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
  const boosterLineupId = getBoosterLineupId(request);
  if (!boosterLineupId) {
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
    `SELECT lineup_id FROM \`review\` WHERE id = :reviewId LIMIT 1`,
    { reviewId },
  );
  const review = reviewRows[0];
  if (!review) {
    return NextResponse.json(
      { message: "후기를 찾을 수 없습니다." },
      { status: 404 },
    );
  }
  if (review.lineup_id !== boosterLineupId) {
    return NextResponse.json(
      { message: "해당 후기에 답변 권한이 없습니다." },
      { status: 403 },
    );
  }

  const [lineupRows] = await getPool().execute<LineupRow[]>(
    `SELECT name FROM lineups WHERE id = :id LIMIT 1`,
    { id: boosterLineupId },
  );
  const boosterName = lineupRows[0]?.name ?? "";

  const tierJson = tierRecords.length > 0 ? JSON.stringify(tierRecords) : null;

  await ensureReviewSchema();
  await getPool().execute(
    `DELETE FROM review_replies WHERE review_id = :reviewId`,
    { reviewId },
  );
  const [result] = await getPool().execute<ResultSetHeader>(
    `INSERT INTO review_replies (review_id, lineup_id, booster_name, content, tier_records)
     VALUES (:reviewId, :lineupId, :boosterName, :content, :tierJson)`,
    { reviewId, lineupId: boosterLineupId, boosterName, content, tierJson },
  );

  const [replyRows] = await getPool().execute<RowDataPacket[]>(
    `SELECT id, lineup_id, booster_name, content, tier_records, created_at FROM review_replies WHERE id = :id`,
    { id: result.insertId },
  );
  clearStatsCache();
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
        lineupId: String(r.lineup_id),
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
  const boosterLineupId = getBoosterLineupId(request);
  const admin = isAdminRequest(request);
  if (!boosterLineupId && !admin) {
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
      `SELECT lineup_id FROM review_replies WHERE review_id = :reviewId LIMIT 1`,
      { reviewId },
    );
    if (rows[0]?.lineup_id !== boosterLineupId) {
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
  clearStatsCache();
  return NextResponse.json({ ok: true });
}
