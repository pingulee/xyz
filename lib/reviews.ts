import { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { oncePerProcess } from "@/lib/schema-once";

export type TierRecord = {
  tier: string;
  champion?: string;
  wins: number;
  losses: number;
  /** 게임당 평균 킬/데스/어시 (선택 입력) */
  kills?: number;
  deaths?: number;
  assists?: number;
};

export type ReviewReply = {
  id: string;
  lineupId: string;
  knightName: string;
  content: string;
  tierRecords: TierRecord[];
  createdAt: string;
};

export type Review = {
  id: string;
  name: string;
  service: string;
  lineupId?: string;
  lineupName?: string;
  rating: number;
  content: string;
  createdAt: string;
  viewCount: number;
  reply?: ReviewReply;
};

export type ReviewNavItem = {
  id: string;
  name: string;
  content: string;
  createdAt: string;
};

type ReviewRow = RowDataPacket & {
  id: number;
  name: string;
  service: string;
  lineup_id: number | null;
  lineup_name: string | null;
  rating: number;
  content: string;
  view_count: number | null;
  created_at: Date;
  reply_id: number | null;
  reply_lineup_id: number | null;
  reply_knight_name: string | null;
  reply_content: string | null;
  reply_tier_records: string | null;
  reply_created_at: Date | null;
};

export const ensureReviewsSchema = oncePerProcess(async () => {
  await getPool().execute(
    `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS lineup_id BIGINT UNSIGNED NULL`,
  );
  await getPool().execute(
    `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS lineup_name VARCHAR(60) NULL`,
  );
  await getPool().execute(
    `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS view_count INT UNSIGNED NOT NULL DEFAULT 0`,
  );
  await getPool().execute(`
    CREATE TABLE IF NOT EXISTS review_replies (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      review_id BIGINT UNSIGNED NOT NULL,
      lineup_id BIGINT UNSIGNED NOT NULL,
      knight_name VARCHAR(60) NOT NULL DEFAULT '',
      content TEXT NOT NULL,
      tier_records JSON NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_review_replies_review_id (review_id),
      INDEX idx_review_replies_lineup_id (lineup_id)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
  await getPool().execute(
    `ALTER TABLE review_replies ADD COLUMN IF NOT EXISTS knight_name VARCHAR(60) NOT NULL DEFAULT ''`,
  );
  await getPool().execute(
    `ALTER TABLE review_replies ADD COLUMN IF NOT EXISTS tier_records JSON NULL`,
  );
});

function parseTierRecords(raw: string | null | unknown): TierRecord[] {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed)) return [];
    const toAvg = (value: unknown): number | undefined => {
      if (value === undefined || value === null || value === "") return undefined;
      const num = Number(value);
      return Number.isFinite(num) ? num : undefined;
    };
    return parsed.map((r: unknown) => {
      const obj = r as Record<string, unknown>;
      return {
        tier: String(obj.tier ?? ""),
        champion: String(obj.champion ?? ""),
        wins: Number(obj.wins ?? 0),
        losses: Number(obj.losses ?? 0),
        kills: toAvg(obj.kills),
        deaths: toAvg(obj.deaths),
        assists: toAvg(obj.assists),
      };
    });
  } catch {
    return [];
  }
}

export function toReview(row: ReviewRow): Review {
  return {
    id: String(row.id),
    name: row.name,
    service: row.service,
    lineupId: row.lineup_id ? String(row.lineup_id) : undefined,
    lineupName: row.lineup_name ?? undefined,
    rating: row.rating,
    content: row.content,
    createdAt: row.created_at.toISOString(),
    viewCount: Number(row.view_count ?? 0),
    reply: row.reply_id
      ? {
          id: String(row.reply_id),
          lineupId: String(row.reply_lineup_id),
          knightName: row.reply_knight_name ?? "",
          content: row.reply_content ?? "",
          tierRecords: parseTierRecords(row.reply_tier_records),
          createdAt: row.reply_created_at!.toISOString(),
        }
      : undefined,
  };
}

const REVIEW_SELECT = `
  SELECT r.id, r.name, r.service, r.lineup_id, l.name AS lineup_name,
         r.rating, r.content, r.view_count, r.created_at,
         rr.id AS reply_id, rr.lineup_id AS reply_lineup_id,
         rr.knight_name AS reply_knight_name,
         rr.content AS reply_content, rr.tier_records AS reply_tier_records,
         rr.created_at AS reply_created_at
  FROM reviews r
  LEFT JOIN lineups l ON l.id = r.lineup_id
  LEFT JOIN review_replies rr ON rr.review_id = r.id
`;

export async function getReviewsByLineupId(lineupId: number): Promise<Review[]> {
  await ensureReviewsSchema();
  const [rows] = await getPool().execute<ReviewRow[]>(
    `${REVIEW_SELECT} WHERE r.lineup_id = :lineupId ORDER BY r.created_at DESC`,
    { lineupId },
  );
  return rows.map(toReview);
}

export async function getReviews(limit = 100) {
  await ensureReviewsSchema();
  const [rows] = await getPool().execute<ReviewRow[]>(
    `${REVIEW_SELECT} ORDER BY r.created_at DESC LIMIT :limit`,
    { limit },
  );
  return rows.map(toReview);
}

export async function getReviewById(id: number): Promise<Review | null> {
  await ensureReviewsSchema();
  const [rows] = await getPool().execute<ReviewRow[]>(
    `${REVIEW_SELECT} WHERE r.id = :id LIMIT 1`,
    { id },
  );
  return rows[0] ? toReview(rows[0]) : null;
}

export async function incrementReviewView(id: number): Promise<Review | null> {
  await ensureReviewsSchema();
  await getPool().execute(
    `UPDATE reviews SET view_count = view_count + 1 WHERE id = :id`,
    { id },
  );
  return getReviewById(id);
}

export async function getReviewNavigation(id: number): Promise<{
  previous?: ReviewNavItem;
  next?: ReviewNavItem;
}> {
  await ensureReviewsSchema();
  const reviews = await getReviews(500);
  const index = reviews.findIndex((review) => review.id === String(id));
  if (index < 0) return {};

  const toNavItem = (review: Review): ReviewNavItem => ({
    id: review.id,
    name: review.name,
    content: review.content,
    createdAt: review.createdAt,
  });

  return {
    previous: index > 0 ? toNavItem(reviews[index - 1]) : undefined,
    next: index < reviews.length - 1 ? toNavItem(reviews[index + 1]) : undefined,
  };
}
