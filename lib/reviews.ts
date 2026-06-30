import { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";

export type ReviewReply = {
  id: string;
  lineupId: string;
  content: string;
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
  reply?: ReviewReply;
};

type ReviewRow = RowDataPacket & {
  id: number;
  name: string;
  service: string;
  lineup_id: number | null;
  lineup_name: string | null;
  rating: number;
  content: string;
  created_at: Date;
  reply_id: number | null;
  reply_lineup_id: number | null;
  reply_content: string | null;
  reply_created_at: Date | null;
};

export async function ensureReviewsSchema() {
  await getPool().execute(
    `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS lineup_id BIGINT UNSIGNED NULL`,
  );
  await getPool().execute(
    `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS lineup_name VARCHAR(60) NULL`,
  );
  await getPool().execute(`
    CREATE TABLE IF NOT EXISTS review_replies (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      review_id BIGINT UNSIGNED NOT NULL,
      lineup_id BIGINT UNSIGNED NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_review_replies_review_id (review_id)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
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
    reply: row.reply_id
      ? {
          id: String(row.reply_id),
          lineupId: String(row.reply_lineup_id),
          content: row.reply_content ?? "",
          createdAt: row.reply_created_at!.toISOString(),
        }
      : undefined,
  };
}

const REVIEW_SELECT = `
  SELECT r.id, r.name, r.service, r.lineup_id, l.name AS lineup_name,
         r.rating, r.content, r.created_at,
         rr.id AS reply_id, rr.lineup_id AS reply_lineup_id,
         rr.content AS reply_content, rr.created_at AS reply_created_at
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
