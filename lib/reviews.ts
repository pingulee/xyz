import { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";

export type Review = {
  id: string;
  name: string;
  service: string;
  rating: number;
  content: string;
  image?: string;
  createdAt: string;
};

type ReviewRow = RowDataPacket & {
  id: number;
  name: string;
  service: string;
  rating: number;
  content: string;
  image_data: string | null;
  created_at: Date;
};

export function toReview(row: ReviewRow): Review {
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

export async function getReviews(limit = 100) {
  const [rows] = await getPool().execute<ReviewRow[]>(
    `SELECT id, name, service, rating, content, image_data, created_at
     FROM reviews
     ORDER BY created_at DESC
     LIMIT :limit`,
    { limit },
  );

  return rows.map(toReview);
}
