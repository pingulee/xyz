import { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { ensureReviewsSchema } from "@/lib/reviews";
import type { TierRecord } from "@/lib/reviews";
import { getLineupSlug } from "@/lib/lineup-model";
import type { Lineup } from "@/lib/lineup-model";

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
  nationality: number | string | null;
  image_url: string | null;
  sort_order: number;
  active: 0 | 1;
  average_rating: number | null;
  review_count: number | null;
};

type ColumnRow = RowDataPacket & {
  DATA_TYPE: string;
};

function split(val: string): string[] {
  return val
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function displayRank(rank: string): string {
  if (rank === "챌린저") return "Challenger";
  if (rank === "그랜드마스터") return "Grandmaster";
  return rank;
}

function nationalityCode(value: number | string | null | undefined): number {
  if (value === 2 || value === "2" || value === "중국") return 2;
  return 1;
}

export async function ensureLineupsSchema() {
  await getPool().execute(
    `ALTER TABLE lineups ADD COLUMN IF NOT EXISTS nationality TINYINT UNSIGNED NOT NULL DEFAULT 1`,
  );

  const [columns] = await getPool().execute<ColumnRow[]>(
    `SELECT DATA_TYPE
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'lineups'
       AND COLUMN_NAME = 'nationality'
     LIMIT 1`,
  );

  const dataType = columns[0]?.DATA_TYPE;
  if (dataType && dataType !== "tinyint") {
    await getPool().execute(
      `UPDATE lineups
       SET nationality = CASE
         WHEN CAST(nationality AS CHAR) IN ('중국', '2') THEN '2'
         ELSE '1'
       END`,
    );
    await getPool().execute(
      `ALTER TABLE lineups MODIFY COLUMN nationality TINYINT UNSIGNED NOT NULL DEFAULT 1`,
    );
  }
}

export function toLineup(row: LineupRow): Lineup {
  return {
    id: String(row.id),
    name: row.name,
    positions: split(row.positions),
    rank: displayRank(row.rank),
    tier: row.tier,
    description: row.description,
    weekdayHours: row.weekday_hours,
    weekendHours: row.weekend_hours,
    champions: split(row.champions),
    services: split(row.services),
    nationality: nationalityCode(row.nationality),
    image: row.image_url ?? null,
    sortOrder: row.sort_order,
    active: Boolean(row.active),
    averageRating:
      row.average_rating !== null ? Number(row.average_rating) : null,
    reviewCount: Number(row.review_count ?? 0),
  };
}

export async function getLineups(
  activeOnly = true,
  sortByReviews = false,
): Promise<Lineup[]> {
  await ensureReviewsSchema();
  await ensureLineupsSchema();
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
     ORDER BY ${
       sortByReviews
         ? "review_count DESC, average_rating DESC, l.sort_order ASC, l.id ASC"
         : "l.sort_order ASC, l.id ASC"
     }`,
  );
  return rows.map(toLineup);
}

export async function getLineupById(id: number): Promise<Lineup | null> {
  await ensureReviewsSchema();
  await ensureLineupsSchema();
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

export { getLineupPath } from "@/lib/lineup-model";

export async function getLineupBySlug(slug: string): Promise<Lineup | null> {
  const decoded = decodeURIComponent(slug);
  const lineups = await getLineups(false);
  return (
    lineups.find(
      (lineup) => getLineupSlug(lineup.name) === decoded,
    ) ?? null
  );
}

const TIER_ORDER = [
  "아이언", "브론즈", "실버", "골드", "플래티넘",
  "에메랄드", "다이아몬드", "마스터", "그랜드마스터", "챌린저",
];

export type WinStatsGroup = {
  wins: number;
  losses: number;
  byTier: { tier: string; wins: number; losses: number }[];
};

function createWinStatsAccumulator() {
  return {
    wins: 0,
    losses: 0,
    byTier: {} as Record<string, { wins: number; losses: number }>,
  };
}

function toWinStatsGroup(acc: ReturnType<typeof createWinStatsAccumulator>): WinStatsGroup {
  return {
    wins: acc.wins,
    losses: acc.losses,
    byTier: Object.entries(acc.byTier)
      .map(([tier, v]) => ({ tier, ...v }))
      .sort((a, b) => TIER_ORDER.indexOf(b.tier) - TIER_ORDER.indexOf(a.tier)),
  };
}

export async function getLineupWinStats(lineupId: number): Promise<{
  total: WinStatsGroup;
  boost: WinStatsGroup;
  duo: WinStatsGroup;
}> {
  const [rows] = await getPool().execute<RowDataPacket[]>(
    `SELECT rr.tier_records AS tier_records, r.service AS service
       FROM review_replies rr
       JOIN reviews r ON r.id = rr.review_id
       WHERE rr.lineup_id = :lineupId AND rr.tier_records IS NOT NULL`,
    { lineupId },
  );

  const total = createWinStatsAccumulator();
  const boost = createWinStatsAccumulator();
  const duo = createWinStatsAccumulator();

  for (const row of rows) {
    let records: TierRecord[] = [];
    try {
      const raw = row.tier_records;
      records = (typeof raw === "string" ? JSON.parse(raw) : raw) as TierRecord[];
    } catch { continue; }
    const service = String(row.service ?? "");
    const serviceAcc = service.includes("듀오")
      ? duo
      : service.includes("대리")
        ? boost
        : null;
    for (const r of records) {
      if (!r.tier) continue;
      const wins = Number(r.wins) || 0;
      const losses = Number(r.losses) || 0;
      for (const acc of serviceAcc ? [total, serviceAcc] : [total]) {
        if (!acc.byTier[r.tier]) acc.byTier[r.tier] = { wins: 0, losses: 0 };
        acc.byTier[r.tier].wins += wins;
        acc.byTier[r.tier].losses += losses;
        acc.wins += wins;
        acc.losses += losses;
      }
    }
  }

  return {
    total: toWinStatsGroup(total),
    boost: toWinStatsGroup(boost),
    duo: toWinStatsGroup(duo),
  };
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
