import { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { oncePerProcess } from "@/lib/schema-once";

export type TierRecord = {
  tier: string;
  champion?: string;
  /** 판별 기록: 해당 게임 승리 여부 (신규 형식) */
  win?: boolean;
  /** 해당 게임의 킬/데스/어시 (신규 형식) — 구형식에서는 게임당 평균 */
  kills?: number;
  deaths?: number;
  assists?: number;
  /** @deprecated 구형식(집계 기록) 호환용 — 신규 기록은 win 사용 */
  wins?: number;
  losses?: number;
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
        win: typeof obj.win === "boolean" ? obj.win : undefined,
        kills: toAvg(obj.kills),
        deaths: toAvg(obj.deaths),
        assists: toAvg(obj.assists),
        wins: toAvg(obj.wins),
        losses: toAvg(obj.losses),
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

/** 기사 상세용 서버 사이드 페이지네이션: 해당 페이지 분량 + 전체 개수 */
export async function getReviewsByLineupIdPage(
  lineupId: number,
  page = 1,
  perPage = 3,
): Promise<{ reviews: Review[]; total: number; page: number; perPage: number }> {
  await ensureReviewsSchema();
  const safePer = Math.max(1, Math.min(50, Math.floor(perPage)));
  const [countRows] = await getPool().execute<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM reviews WHERE lineup_id = :lineupId`,
    { lineupId },
  );
  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / safePer));
  const safePage = Math.max(1, Math.min(totalPages, Math.floor(page) || 1));
  const offset = (safePage - 1) * safePer;
  const safeLineupId = Math.floor(lineupId);
  const [rows] = await getPool().query<ReviewRow[]>(
    `${REVIEW_SELECT} WHERE r.lineup_id = ${safeLineupId}
     ORDER BY r.created_at DESC, r.id DESC LIMIT ${safePer} OFFSET ${offset}`,
  );
  return { reviews: rows.map(toReview), total, page: safePage, perPage: safePer };
}

export async function getReviews(limit = 5000) {
  await ensureReviewsSchema();
  const safeLimit = Math.max(1, Math.min(100000, Math.floor(limit)));
  const [rows] = await getPool().query<ReviewRow[]>(
    `${REVIEW_SELECT} ORDER BY r.created_at DESC, r.id DESC LIMIT ${safeLimit}`,
  );
  return rows.map(toReview);
}

/** sitemap용 경량 조회: id/created_at만 (조인·JSON 파싱 없음) */
export async function getReviewSitemapEntries(
  limit = 5000,
): Promise<Array<{ id: string; createdAt: string }>> {
  await ensureReviewsSchema();
  const safeLimit = Math.max(1, Math.min(100000, Math.floor(limit)));
  const [rows] = await getPool().query<RowDataPacket[]>(
    `SELECT id, created_at FROM reviews ORDER BY created_at DESC, id DESC LIMIT ${safeLimit}`,
  );
  return rows.map((r) => ({
    id: String(r.id),
    createdAt: (r.created_at as Date).toISOString(),
  }));
}

/** 서버 사이드 페이지네이션: 현재 페이지 분량만 조회 + 전체 개수 */
export async function getReviewsPage(
  page = 1,
  perPage = 20,
): Promise<{ reviews: Review[]; total: number; page: number; perPage: number }> {
  await ensureReviewsSchema();
  const safePer = Math.max(1, Math.min(100, Math.floor(perPage)));
  const [countRows] = await getPool().query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM reviews`,
  );
  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / safePer));
  const safePage = Math.max(1, Math.min(totalPages, Math.floor(page) || 1));
  const offset = (safePage - 1) * safePer;
  const [rows] = await getPool().query<ReviewRow[]>(
    `${REVIEW_SELECT} ORDER BY r.created_at DESC, r.id DESC LIMIT ${safePer} OFFSET ${offset}`,
  );
  return { reviews: rows.map(toReview), total, page: safePage, perPage: safePer };
}

export async function getReviewById(id: number): Promise<Review | null> {
  await ensureReviewsSchema();
  const [rows] = await getPool().execute<ReviewRow[]>(
    `${REVIEW_SELECT} WHERE r.id = :id LIMIT 1`,
    { id },
  );
  return rows[0] ? toReview(rows[0]) : null;
}

export async function getReviewNavigation(id: number): Promise<{
  previous?: ReviewNavItem;
  next?: ReviewNavItem;
}> {
  await ensureReviewsSchema();
  const pool = getPool();
  const [curRows] = await pool.execute<RowDataPacket[]>(
    `SELECT created_at FROM reviews WHERE id = :id LIMIT 1`,
    { id },
  );
  if (!curRows[0]) return {};
  const createdAt = curRows[0].created_at as Date;

  const NAV_SELECT = `SELECT id, name, content, created_at FROM reviews`;
  // 목록 정렬: created_at DESC, id DESC → 이전=더 최신, 다음=더 과거
  const [prevRows] = await pool.execute<RowDataPacket[]>(
    `${NAV_SELECT} WHERE (created_at > :createdAt) OR (created_at = :createdAt AND id > :id)
     ORDER BY created_at ASC, id ASC LIMIT 1`,
    { createdAt, id },
  );
  const [nextRows] = await pool.execute<RowDataPacket[]>(
    `${NAV_SELECT} WHERE (created_at < :createdAt) OR (created_at = :createdAt AND id < :id)
     ORDER BY created_at DESC, id DESC LIMIT 1`,
    { createdAt, id },
  );

  const toNavItem = (row: RowDataPacket): ReviewNavItem => ({
    id: String(row.id),
    name: row.name,
    content: row.content,
    createdAt: (row.created_at as Date).toISOString(),
  });

  return {
    previous: prevRows[0] ? toNavItem(prevRows[0]) : undefined,
    next: nextRows[0] ? toNavItem(nextRows[0]) : undefined,
  };
}
