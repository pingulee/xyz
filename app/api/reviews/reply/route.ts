import { NextResponse } from "next/server";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { getKnightLineupId } from "@/lib/knightSession";
import {
  getSessionTokenFromRequest,
  validateSession,
} from "@/lib/adminSession";
import type { TierRecord } from "@/lib/reviews";

export const runtime = "nodejs";

type ReviewRow = RowDataPacket & { lineup_id: number | null };
type LineupRow = RowDataPacket & { name: string };

function isAdminRequest(request: Request): boolean {
  const token = getSessionTokenFromRequest(request);
  return token ? validateSession(token) : false;
}

function isValidTierRecords(records: unknown): records is TierRecord[] {
  if (!Array.isArray(records)) return false;
  return records.every(
    (r) =>
      typeof r === "object" &&
      r !== null &&
      typeof (r as Record<string, unknown>).tier === "string" &&
      typeof (r as Record<string, unknown>).wins === "number" &&
      typeof (r as Record<string, unknown>).losses === "number" &&
      Number((r as Record<string, unknown>).wins) >= 0 &&
      Number((r as Record<string, unknown>).losses) >= 0,
  );
}

export async function POST(request: Request) {
  const knightLineupId = getKnightLineupId(request);
  if (!knightLineupId) {
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
  const tierRecords: TierRecord[] = isValidTierRecords(payload.tierRecords)
    ? payload.tierRecords
        .map((r) => ({
          tier: r.tier.trim(),
          wins: Math.floor(r.wins),
          losses: Math.floor(r.losses),
        }))
        .filter((r) => r.tier)
    : [];

  if (!Number.isInteger(reviewId) || reviewId < 1) {
    return NextResponse.json(
      { message: "후기를 찾을 수 없습니다." },
      { status: 400 },
    );
  }
  if (content.length < 1 || content.length > 500) {
    return NextResponse.json(
      { message: "답변은 1~500자로 입력해주세요." },
      { status: 400 },
    );
  }

  const [reviewRows] = await getPool().execute<ReviewRow[]>(
    `SELECT lineup_id FROM reviews WHERE id = :reviewId LIMIT 1`,
    { reviewId },
  );
  const review = reviewRows[0];
  if (!review) {
    return NextResponse.json(
      { message: "후기를 찾을 수 없습니다." },
      { status: 404 },
    );
  }
  if (review.lineup_id !== knightLineupId) {
    return NextResponse.json(
      { message: "해당 후기에 답변 권한이 없습니다." },
      { status: 403 },
    );
  }

  const [lineupRows] = await getPool().execute<LineupRow[]>(
    `SELECT name FROM lineups WHERE id = :id LIMIT 1`,
    { id: knightLineupId },
  );
  const knightName = lineupRows[0]?.name ?? "";

  const tierJson = tierRecords.length > 0 ? JSON.stringify(tierRecords) : null;

  await getPool().execute(
    `DELETE FROM review_replies WHERE review_id = :reviewId`,
    { reviewId },
  );
  const [result] = await getPool().execute<ResultSetHeader>(
    `INSERT INTO review_replies (review_id, lineup_id, knight_name, content, tier_records)
     VALUES (:reviewId, :lineupId, :knightName, :content, :tierJson)`,
    { reviewId, lineupId: knightLineupId, knightName, content, tierJson },
  );

  const [replyRows] = await getPool().execute<RowDataPacket[]>(
    `SELECT id, lineup_id, knight_name, content, tier_records, created_at FROM review_replies WHERE id = :id`,
    { id: result.insertId },
  );
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
        knightName: r.knight_name,
        content: r.content,
        tierRecords: parsedTier,
        createdAt: (r.created_at as Date).toISOString(),
      },
    },
    { status: 201 },
  );
}

export async function DELETE(request: Request) {
  const knightLineupId = getKnightLineupId(request);
  const admin = isAdminRequest(request);
  if (!knightLineupId && !admin) {
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
    if (rows[0]?.lineup_id !== knightLineupId) {
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
  return NextResponse.json({ ok: true });
}
