import { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { ensureReviewsSchema } from "@/lib/reviews";

export type Lineup = {
  id: string;
  name: string;
  positions: string[];
  rank: string;
  tier: string;
  description: string;
  weekdayHours: string;
  weekendHours: string;
  champions: string[];
  services: string[];
  image: string | null;
  sortOrder: number;
  active: boolean;
  averageRating?: number | null;
  reviewCount?: number;
};

type LineupRow = RowDataPacket & {
  id: number;
  name: string;
  positions: string;
  rank: string;
  tier: string;
  description: string;
  weekday_hours: string;
  weekend_hours: string;
  champions: string;
  services: string;
  image_url: string | null;
  sort_order: number;
  active: 0 | 1;
  average_rating: number | null;
  review_count: number | null;
};

function split(val: string): string[] {
  return val
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getLineupSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getLineupPath(lineup: Pick<Lineup, "id" | "name">): string {
  return `/lineup/${getLineupSlug(lineup.name)}`;
}

export function toLineup(row: LineupRow): Lineup {
  return {
    id: String(row.id),
    name: row.name,
    positions: split(row.positions),
    rank: row.rank,
    tier: row.tier,
    description: row.description,
    weekdayHours: row.weekday_hours,
    weekendHours: row.weekend_hours,
    champions: split(row.champions),
    services: split(row.services),
    image: row.image_url ?? null,
    sortOrder: row.sort_order,
    active: Boolean(row.active),
    averageRating:
      row.average_rating !== null ? Number(row.average_rating) : null,
    reviewCount: Number(row.review_count ?? 0),
  };
}

export async function getLineups(activeOnly = true): Promise<Lineup[]> {
  await ensureReviewsSchema();
  const [rows] = await getPool().execute<LineupRow[]>(
    `SELECT l.*, COALESCE(stats.average_rating, 0) AS average_rating, COALESCE(stats.review_count, 0) AS review_count
     FROM lineups l
     LEFT JOIN (
       SELECT lineup_id, AVG(rating) AS average_rating, COUNT(*) AS review_count
       FROM reviews
       WHERE lineup_id IS NOT NULL
       GROUP BY lineup_id
     ) stats ON stats.lineup_id = l.id
     ${activeOnly ? "WHERE l.active = 1" : ""}
     ORDER BY l.sort_order ASC, l.id ASC`,
  );
  return rows.map(toLineup);
}

export async function getLineupById(id: number): Promise<Lineup | null> {
  await ensureReviewsSchema();
  const [rows] = await getPool().execute<LineupRow[]>(
    `SELECT l.*, COALESCE(stats.average_rating, 0) AS average_rating, COALESCE(stats.review_count, 0) AS review_count
     FROM lineups l
     LEFT JOIN (
       SELECT lineup_id, AVG(rating) AS average_rating, COUNT(*) AS review_count
       FROM reviews
       WHERE lineup_id IS NOT NULL
       GROUP BY lineup_id
     ) stats ON stats.lineup_id = l.id
     WHERE l.id = :id`,
    { id },
  );
  return rows[0] ? toLineup(rows[0]) : null;
}

export async function getLineupBySlug(slug: string): Promise<Lineup | null> {
  const lineups = await getLineups(false);
  return lineups.find((lineup) => getLineupSlug(lineup.name) === slug) ?? null;
}

export async function getLineupReviewStats(id: number) {
  await ensureReviewsSchema();
  const [rows] = await getPool().execute<RowDataPacket[]>(
    `SELECT rating, COUNT(*) AS count
     FROM reviews
     WHERE lineup_id = :id
     GROUP BY rating
     ORDER BY rating DESC`,
    { id },
  );
  const [summaryRows] = await getPool().execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS review_count, AVG(rating) AS average_rating
     FROM reviews
     WHERE lineup_id = :id`,
    { id },
  );

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const row of rows) {
    const rating = Number(row.rating);
    if (rating >= 1 && rating <= 5) {
      distribution[rating as keyof typeof distribution] = Number(row.count);
    }
  }

  return {
    averageRating: Number(summaryRows[0]?.average_rating ?? 0),
    reviewCount: Number(summaryRows[0]?.review_count ?? 0),
    ratingDistribution: distribution,
  };
}
