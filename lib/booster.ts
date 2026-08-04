import { cache } from "react";
import { unstable_cache } from "next/cache";
import { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { CACHE_MAX_AGE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags";
import { ensureReviewSchema } from "@/lib/review";
import type { TierRecord } from "@/lib/review";
import { getChampionImageMap } from "@/lib/champions";
import { oncePerProcess } from "@/lib/schema-once";
import { getBoosterSlug } from "@/lib/booster-model";
import type { Booster } from "@/lib/booster-model";
import { getCachedStat, setCachedStat } from "@/lib/stats-cache";

type BoosterRow = RowDataPacket & {
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
  COLUMN_NAME?: string;
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

export const ensureBoosterSchema = oncePerProcess(async () => {
  await getPool().execute(
    `ALTER TABLE booster ADD COLUMN IF NOT EXISTS booster_password_hash VARCHAR(200) NULL`,
  );
  // 통합 인증: 기사 프로필을 users 계정에 연결(NULL 허용, 논리 참조). 백필·기사
  // 로그인이 이 컬럼을 쓴다.
  await getPool().execute(
    `ALTER TABLE booster ADD COLUMN IF NOT EXISTS user_id BIGINT UNSIGNED NULL`,
  );

  // 배포 전에 저장된 기사 로그인 비밀번호를 새 컬럼으로 안전하게 승계한다.
  const [legacyPasswordColumns] = await getPool().execute<ColumnRow[]>(
    `SELECT COLUMN_NAME, DATA_TYPE
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'booster'
       AND COLUMN_NAME <> 'booster_password_hash'
       AND COLUMN_NAME REGEXP '_password_hash$'
     ORDER BY ORDINAL_POSITION
     LIMIT 1`,
  );
  const legacyPasswordColumn = legacyPasswordColumns[0]?.COLUMN_NAME;
  if (
    legacyPasswordColumn &&
    /^[a-z][a-z0-9_]*$/i.test(legacyPasswordColumn)
  ) {
    const escapedColumn = legacyPasswordColumn.replaceAll("`", "``");
    await getPool().execute(
      `UPDATE booster
       SET booster_password_hash = \`${escapedColumn}\`
       WHERE booster_password_hash IS NULL
         AND \`${escapedColumn}\` IS NOT NULL`,
    );
    await getPool().execute(
      `ALTER TABLE booster DROP COLUMN \`${escapedColumn}\``,
    );
  }

  await getPool().execute(
    `ALTER TABLE booster ADD COLUMN IF NOT EXISTS nationality TINYINT UNSIGNED NOT NULL DEFAULT 1`,
  );

  const [columns] = await getPool().execute<ColumnRow[]>(
    `SELECT DATA_TYPE
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'booster'
       AND COLUMN_NAME = 'nationality'
     LIMIT 1`,
  );

  const dataType = columns[0]?.DATA_TYPE;
  if (dataType && dataType !== "tinyint") {
    await getPool().execute(
      `UPDATE booster
       SET nationality = CASE
         WHEN CAST(nationality AS CHAR) IN ('중국', '2') THEN '2'
         ELSE '1'
       END`,
    );
    await getPool().execute(
      `ALTER TABLE booster MODIFY COLUMN nationality TINYINT UNSIGNED NOT NULL DEFAULT 1`,
    );
  }
});

function toBooster(row: BoosterRow): Booster {
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

type BoosterRecordSummary = { champions: string[]; wins: number; losses: number };

/** 기사별 작업 기록에서 승/패 합계와 판수 기준 모스트 챔피언 TOP3를 집계 */
async function getRecordSummariesByBooster(): Promise<
  Map<number, BoosterRecordSummary>
> {
  const CACHE_KEY = "recordSummariesByBooster";
  const cachedSummary =
    getCachedStat<Map<number, BoosterRecordSummary>>(CACHE_KEY);
  if (cachedSummary) return cachedSummary;

  const [rows] = await getPool().execute<RowDataPacket[]>(
    `SELECT booster_id, tier_records
       FROM review_replies
       WHERE tier_records IS NOT NULL`,
  );

  const counts = new Map<
    number,
    { wins: number; losses: number; champions: Map<string, { games: number; wins: number }> }
  >();
  for (const row of rows) {
    let records: TierRecord[] = [];
    try {
      const raw = row.tier_records;
      records = (typeof raw === "string" ? JSON.parse(raw) : raw) as TierRecord[];
    } catch { continue; }
    const boosterId = Number(row.booster_id);
    if (!Number.isInteger(boosterId)) continue;
    let acc = counts.get(boosterId);
    if (!acc) {
      acc = { wins: 0, losses: 0, champions: new Map() };
      counts.set(boosterId, acc);
    }
    for (const r of records) {
      if (!r.tier) continue;
      const isPerGame = typeof r.win === "boolean";
      const wins = isPerGame ? (r.win ? 1 : 0) : Number(r.wins) || 0;
      const losses = isPerGame ? (r.win ? 0 : 1) : Number(r.losses) || 0;
      acc.wins += wins;
      acc.losses += losses;
      const champion = (r.champion ?? "").trim();
      if (!champion) continue;
      const entry = acc.champions.get(champion) ?? { games: 0, wins: 0 };
      entry.games += wins + losses;
      entry.wins += wins;
      acc.champions.set(champion, entry);
    }
  }

  const result = new Map<number, BoosterRecordSummary>();
  for (const [boosterId, acc] of counts) {
    result.set(boosterId, {
      wins: acc.wins,
      losses: acc.losses,
      champions: [...acc.champions.entries()]
        .sort(([, a], [, b]) => b.games - a.games || b.wins - a.wins)
        .slice(0, 3)
        .map(([champion]) => champion),
    });
  }
  setCachedStat(CACHE_KEY, result);
  return result;
}

/**
 * 사이트맵 전용 경량 조회. slug 파생에 이름만 필요하므로 리뷰 집계 JOIN·전적
 * 요약·스키마 보정 DDL을 모두 건너뛴다. getBoosterList를 쓰면 5초를 넘겨
 * 검색엔진 페처가 사이트맵을 포기한다(GSC "가져올 수 없음").
 * name/active/sort_order는 기본 컬럼이라 DDL 없이 안전하고
 * idx_booster_active_sort 인덱스를 그대로 탄다.
 */
export async function getBoosterSitemapEntries(): Promise<
  Array<{ name: string }>
> {
  const [rows] = await getPool().execute<RowDataPacket[]>(
    `SELECT name FROM booster WHERE active = 1 ORDER BY sort_order ASC, id ASC`,
  );
  return rows.map((row) => ({ name: String(row.name) }));
}

export type BoosterOption = Pick<
  Booster,
  "id" | "name" | "services" | "image" | "active" | "weekdayHours" | "weekendHours"
>;

/**
 * 후기 작성 폼의 기사 선택용 경량 조회.
 * getBoosterList는 리뷰 집계 JOIN과 전적 요약까지 돌리는데, 드롭다운에는
 * 이름·서비스·영업시간만 필요하다. 요청마다 도는 페이지라 낭비가 크다.
 */
export const getBoosterOptions = unstable_cache(
  queryBoosterOptions,
  ["booster-options"],
  { tags: [CACHE_TAGS.boosters], revalidate: CACHE_MAX_AGE_SECONDS },
);

async function queryBoosterOptions(): Promise<BoosterOption[]> {
  const [rows] = await getPool().execute<RowDataPacket[]>(
    `SELECT id, name, services, image_url, active, weekday_hours, weekend_hours
     FROM booster WHERE active = 1 ORDER BY sort_order ASC, id ASC`,
  );
  return rows.map((row) => ({
    id: String(row.id),
    name: String(row.name),
    services: String(row.services ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    image: (row.image_url as string | null) ?? null,
    active: Boolean(row.active),
    weekdayHours: String(row.weekday_hours ?? ""),
    weekendHours: String(row.weekend_hours ?? ""),
  }));
}

/**
 * 사이트에서 가장 무거운 조회다. 기사 전체에 리뷰 집계 JOIN과 전적 요약이
 * 붙는데 방문자와 무관하게 결과가 같다. 요청 간 캐시하고 기사·후기 쓰기에서
 * 무효화한다. 스키마 보정 DDL은 캐시가 적중하면 실행되지 않으므로
 * 캐시 바깥(getBoosterList)에 둔다.
 */
const getBoosterListCached = unstable_cache(
  queryBoosterList,
  ["booster-list"],
  {
    // 집계가 후기에서 오므로 후기 쓰기에도 함께 무효화되어야 한다.
    tags: [CACHE_TAGS.boosters, CACHE_TAGS.reviews],
    revalidate: CACHE_MAX_AGE_SECONDS,
  },
);

export async function getBoosterList(
  activeOnly = true,
  sortByReview = false,
): Promise<Booster[]> {
  await ensureReviewSchema();
  await ensureBoosterSchema();
  return getBoosterListCached(activeOnly, sortByReview);
}

async function queryBoosterList(
  activeOnly: boolean,
  sortByReview: boolean,
): Promise<Booster[]> {
  const [rows] = await getPool().execute<BoosterRow[]>(
    `SELECT l.*, COALESCE(stats.average_rating, 0) AS average_rating, COALESCE(stats.review_count, 0) AS review_count
     FROM booster l
     LEFT JOIN (
       SELECT booster_id, AVG(rating) AS average_rating, COUNT(*) AS review_count
       FROM \`review\`
       WHERE booster_id IS NOT NULL
       GROUP BY booster_id
     ) stats ON stats.booster_id = l.id
     ${activeOnly ? "WHERE l.active = 1" : ""}
     ORDER BY ${
       sortByReview
         ? "review_count DESC, average_rating DESC, l.sort_order ASC, l.id ASC"
         : "l.sort_order ASC, l.id ASC"
     }`,
  );
  const summaries = await getRecordSummariesByBooster();
  return rows.map((row) => {
    const summary = summaries.get(row.id);
    return {
      ...toBooster(row),
      champions: summary?.champions ?? [],
      wins: summary?.wins ?? 0,
      losses: summary?.losses ?? 0,
    };
  });
}

export async function getBoosterById(id: number): Promise<Booster | null> {
  await ensureReviewSchema();
  await ensureBoosterSchema();
  const [rows] = await getPool().execute<BoosterRow[]>(
    `SELECT l.*, COALESCE(stats.average_rating, 0) AS average_rating, COALESCE(stats.review_count, 0) AS review_count
     FROM booster l
     LEFT JOIN (
       SELECT booster_id, AVG(rating) AS average_rating, COUNT(*) AS review_count
       FROM \`review\`
       WHERE booster_id IS NOT NULL
       GROUP BY booster_id
     ) stats ON stats.booster_id = l.id
     WHERE l.id = :id`,
    { id },
  );
  if (!rows[0]) return null;
  const summaries = await getRecordSummariesByBooster();
  const summary = summaries.get(rows[0].id);
  return {
    ...toBooster(rows[0]),
    champions: summary?.champions ?? [],
    wins: summary?.wins ?? 0,
    losses: summary?.losses ?? 0,
  };
}

export { getBoosterPath } from "@/lib/booster-model";

/**
 * slug는 저장하지 않고 이름에서 파생하므로 목록을 받아 대조할 수밖에 없다.
 * generateMetadata와 페이지 본문이 각각 호출하는데 Next는 임의 DB 호출을
 * 중복 제거하지 않으므로, 요청 단위로 메모이즈해 같은 조회가 두 번 돌지 않게 한다.
 */
export const getBoosterBySlug = cache(
  async (slug: string): Promise<Booster | null> => {
    // 퍼센트 인코딩이 깨진 값이 들어와도 던지지 않게 막는다.
    // (경로 자체가 잘못된 요청은 Next 라우터가 이 함수 전에 거른다.)
    let decoded: string;
    try {
      decoded = decodeURIComponent(slug);
    } catch {
      return null;
    }

    const boosterList = await getBoosterList(false);
    return (
      boosterList.find(
        (booster) => getBoosterSlug(booster.name) === decoded,
      ) ?? null
    );
  },
);

const TIER_ORDER = [
  "언랭크", "아이언", "브론즈", "실버", "골드", "플래티넘",
  "에메랄드", "다이아몬드", "마스터", "그랜드마스터", "챌린저",
];

type ChampionStat = {
  champion: string;
  image: string | null;
  wins: number;
  losses: number;
  /** 게임당 평균 킬/데스/어시 — 입력된 기록이 없으면 null */
  kills: number | null;
  deaths: number | null;
  assists: number | null;
};

type RecentGame = {
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

const RECENT_GAMES_LIMIT = 15;

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

export async function getBoosterWinStats(boosterId: number): Promise<{
  total: WinStatsGroup;
  boost: WinStatsGroup;
  duo: WinStatsGroup;
}> {
  const CACHE_KEY = `winStats:${boosterId}`;
  const cached = getCachedStat<{
    total: WinStatsGroup;
    boost: WinStatsGroup;
    duo: WinStatsGroup;
  }>(CACHE_KEY);
  if (cached) return cached;

  const [rows] = await getPool().execute<RowDataPacket[]>(
    `SELECT rr.tier_records AS tier_records, r.service AS service,
            r.created_at AS created_at
       FROM review_replies rr
       JOIN \`review\` r ON r.id = rr.review_id
       WHERE rr.booster_id = :boosterId AND rr.tier_records IS NOT NULL
       ORDER BY r.created_at DESC, rr.created_at DESC`,
    { boosterId },
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

  const result = {
    total: toWinStatsGroup(total, championImages),
    boost: toWinStatsGroup(boost, championImages),
    duo: toWinStatsGroup(duo, championImages),
  };
  setCachedStat(CACHE_KEY, result);
  return result;
}

export async function getBoosterReviewStats(id: number) {
  await ensureReviewSchema();
  const [rows] = await getPool().execute<RowDataPacket[]>(
    `SELECT rating, COUNT(*) AS count
     FROM \`review\`
     WHERE booster_id = :id
     GROUP BY rating
     ORDER BY rating DESC`,
    { id },
  );
  const [summaryRows] = await getPool().execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS review_count, AVG(rating) AS average_rating
     FROM \`review\`
     WHERE booster_id = :id`,
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
