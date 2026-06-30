import { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";

export type Review = {
  id: string;
  name: string;
  service: string;
  lineupId?: string;
  lineupName?: string;
  rating: number;
  content: string;
  image?: string;
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
  image_url: string | null;
  created_at: Date;
};

export async function ensureReviewsSchema() {
  await getPool().execute(
    `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS lineup_id BIGINT UNSIGNED NULL`,
  );
  await getPool().execute(
    `ALTER TABLE reviews ADD COLUMN IF NOT EXISTS lineup_name VARCHAR(60) NULL`,
  );
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
    image: row.image_url ?? undefined,
    createdAt: row.created_at.toISOString(),
  };
}

export async function getReviews(limit = 100) {
  await ensureReviewsSchema();
  const [rows] = await getPool().execute<ReviewRow[]>(
    `SELECT r.id, r.name, r.service, r.lineup_id, l.name AS lineup_name, r.rating, r.content, r.image_url, r.created_at
     FROM reviews r
     LEFT JOIN lineups l ON l.id = r.lineup_id
     ORDER BY r.created_at DESC
     LIMIT :limit`,
    { limit },
  );

  return rows.map(toReview);
}
