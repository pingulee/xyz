import { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { ensureReviewsSchema } from "@/lib/reviews";
import type { TierRecord } from "@/lib/reviews";
import { getChampionImageMap } from "@/lib/champions";
import { oncePerProcess } from "@/lib/schema-once";
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

export const ensureLineupsSchema = oncePerProcess(async () => {
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
});

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

/** 기사별 작업 기록에서 플레이 판수 기준 모스트 챔피언 TOP3를 집계 */
async function getMostChampionsByLineup(): Promise<Map<number, string[]>> {
  const [rows] = await getPool().execute<RowDataPacket[]>(
    `SELECT lineup_id, tier_records
       FROM review_replies
       WHERE tier_records IS NOT NULL`,
  );

  const counts = new Map<number, Map<string, { games: number; wins: number }>>();
  for (const row of rows) {
    let records: TierRecord[] = [];
    try {
      const raw = row.tier_records;
      records = (typeof raw === "string" ? JSON.parse(raw) : raw) as TierRecord[];
    } catch { continue; }
    const lineupId = Number(row.lineup_id);
    if (!Number.isInteger(lineupId)) continue;
    let acc = counts.get(lineupId);
    if (!acc) {
      acc = new Map();
      counts.set(lineupId, acc);
    }
    for (const r of records) {
      const champion = (r.champion ?? "").trim();
      if (!champion) continue;
      const isPerGame = typeof r.win === "boolean";
      const wins = isPerGame ? (r.win ? 1 : 0) : Number(r.wins) || 0;
      const losses = isPerGame ? (r.win ? 0 : 1) : Number(r.losses) || 0;
      const entry = acc.get(champion) ?? { games: 0, wins: 0 };
      entry.games += wins + losses;
      entry.wins += wins;
      acc.set(champion, entry);
    }
  }

  const result = new Map<number, string[]>();
  for (const [lineupId, acc] of counts) {
    result.set(
      lineupId,
      [...acc.entries()]
        .sort(([, a], [, b]) => b.games - a.games || b.wins - a.wins)
        .slice(0, 3)
        .map(([champion]) => champion),
    );
  }
  return result;
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
  const mostChampions = await getMostChampionsByLineup();
  return rows.map((row) => ({
    ...toLineup(row),
    champions: mostChampions.get(row.id) ?? [],
  }));
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
  if (!rows[0]) return null;
  const mostChampions = await getMostChampionsByLineup();
  return {
    ...toLineup(rows[0]),
    champions: mostChampions.get(rows[0].id) ?? [],
  };
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
  "언랭크", "아이언", "브론즈", "실버", "골드", "플래티넘",
  "에메랄드", "다이아몬드", "마스터", "그랜드마스터", "챌린저",
];

export type ChampionStat = {
  champion: string;
  image: string | null;
  wins: number;
  losses: number;
  /** 게임당 평균 킬/데스/어시 — 입력된 기록이 없으면 null */
  kills: number | null;
  deaths: number | null;
  assists: number | null;
};

export type RecentGame = {
  tier: string;
  champion: string;
  image: string | null;
  win: boolean;
  kills: number | null;
  deaths: number | null;
  assists: number | null;
  date: string;
  service: "대리" | "듀오" | null;
};

export type WinStatsGroup = {
  wins: number;
  losses: number;
  byTier: { tier: string; wins: number; losses: number }[];
  byChampion: ChampionStat[];
  recent: RecentGame[];
};

const RECENT_GAMES_LIMIT = 10;

type ChampionAcc = {
  wins: number;
  losses: number;
  killsSum: number;
  deathsSum: number;
  assistsSum: number;
  kdaGames: number;
};

function createWinStatsAccumulator() {
  return {
    wins: 0,
    losses: 0,
    byTier: {} as Record<string, { wins: number; losses: number }>,
    byChampion: {} as Record<string, ChampionAcc>,
    recent: [] as Omit<RecentGame, "image">[],
  };
}

function toWinStatsGroup(
  acc: ReturnType<typeof createWinStatsAccumulator>,
  championImages: Record<string, string>,
): WinStatsGroup {
  const round1 = (value: number) => Math.round(value * 10) / 10;
  return {
    wins: acc.wins,
    losses: acc.losses,
    byTier: Object.entries(acc.byTier)
      .map(([tier, v]) => ({ tier, ...v }))
      .sort((a, b) => TIER_ORDER.indexOf(b.tier) - TIER_ORDER.indexOf(a.tier)),
    byChampion: Object.entries(acc.byChampion)
      .map(([champion, v]) => ({
        champion,
        image: championImages[champion] ?? null,
        wins: v.wins,
        losses: v.losses,
        kills: v.kdaGames > 0 ? round1(v.killsSum / v.kdaGames) : null,
        deaths: v.kdaGames > 0 ? round1(v.deathsSum / v.kdaGames) : null,
        assists: v.kdaGames > 0 ? round1(v.assistsSum / v.kdaGames) : null,
      }))
      .sort(
        (a, b) =>
          b.wins + b.losses - (a.wins + a.losses) || b.wins - a.wins,
      ),
    recent: acc.recent.map((game) => ({
      ...game,
      image: game.champion ? championImages[game.champion] ?? null : null,
    })),
  };
}

export async function getLineupWinStats(lineupId: number): Promise<{
  total: WinStatsGroup;
  boost: WinStatsGroup;
  duo: WinStatsGroup;
}> {
  const [rows] = await getPool().execute<RowDataPacket[]>(
    `SELECT rr.tier_records AS tier_records, r.service AS service,
            r.created_at AS created_at
       FROM review_replies rr
       JOIN reviews r ON r.id = rr.review_id
       WHERE rr.lineup_id = :lineupId AND rr.tier_records IS NOT NULL
       ORDER BY r.created_at DESC, rr.created_at DESC`,
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

    // 최근 전적: 고객 후기 최신순(쿼리 정렬), 답글 내에서는 나중에 추가한 게임부터
    const createdAt =
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : String(row.created_at ?? "");
    const perGame = records.filter(
      (r) => r.tier && typeof r.win === "boolean",
    );
    const serviceLabel = service.includes("듀오")
      ? ("듀오" as const)
      : service.includes("대리")
        ? ("대리" as const)
        : null;
    for (const r of [...perGame].reverse()) {
      for (const acc of serviceAcc ? [total, serviceAcc] : [total]) {
        if (acc.recent.length < RECENT_GAMES_LIMIT) {
          acc.recent.push({
            tier: r.tier,
            champion: (r.champion ?? "").trim(),
            win: r.win === true,
            kills: r.kills ?? null,
            deaths: r.deaths ?? null,
            assists: r.assists ?? null,
            date: createdAt,
            service: serviceLabel,
          });
        }
      }
    }

    for (const r of records) {
      if (!r.tier) continue;
      const isPerGame = typeof r.win === "boolean";
      // 신규(판별 기록): 기록 1개 = 1판, 구형식: 승/패 집계
      const wins = isPerGame ? (r.win ? 1 : 0) : Number(r.wins) || 0;
      const losses = isPerGame ? (r.win ? 0 : 1) : Number(r.losses) || 0;
      const games = wins + losses;
      const champion = (r.champion ?? "").trim();
      const hasKda =
        games > 0 &&
        (r.kills !== undefined || r.deaths !== undefined || r.assists !== undefined);
      // 판별 기록은 그대로, 구형식(평균)은 판수 가중치를 곱해 합산
      const kdaWeight = isPerGame ? 1 : games;
      for (const acc of serviceAcc ? [total, serviceAcc] : [total]) {
        if (!acc.byTier[r.tier]) acc.byTier[r.tier] = { wins: 0, losses: 0 };
        acc.byTier[r.tier].wins += wins;
        acc.byTier[r.tier].losses += losses;
        acc.wins += wins;
        acc.losses += losses;
        if (champion) {
          if (!acc.byChampion[champion]) {
            acc.byChampion[champion] = {
              wins: 0,
              losses: 0,
              killsSum: 0,
              deathsSum: 0,
              assistsSum: 0,
              kdaGames: 0,
            };
          }
          const champAcc = acc.byChampion[champion];
          champAcc.wins += wins;
          champAcc.losses += losses;
          if (hasKda) {
            champAcc.killsSum += (Number(r.kills) || 0) * kdaWeight;
            champAcc.deathsSum += (Number(r.deaths) || 0) * kdaWeight;
            champAcc.assistsSum += (Number(r.assists) || 0) * kdaWeight;
            champAcc.kdaGames += kdaWeight;
          }
        }
      }
    }
  }

  const championImages = await getChampionImageMap();

  return {
    total: toWinStatsGroup(total, championImages),
    boost: toWinStatsGroup(boost, championImages),
    duo: toWinStatsGroup(duo, championImages),
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
