import { cache } from "react";
import { unstable_cache } from "next/cache";
import { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { CACHE_MAX_AGE_SECONDS, CACHE_TAGS } from "@/lib/cache-tags";
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
  boosterId: string;
  boosterName: string;
  content: string;
  tierRecords: TierRecord[];
  createdAt: string;
};

export type Review = {
  id: string;
  name: string;
  service: string;
  boosterId?: string;
  boosterName?: string;
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
  booster_id: number | null;
  booster_name: string | null;
  rating: number;
  content: string;
  view_count: number | null;
  created_at: Date;
  reply_id: number | null;
  reply_booster_id: number | null;
  reply_booster_name: string | null;
  reply_content: string | null;
  reply_tier_records: string | null;
  reply_created_at: Date | null;
};

type SchemaColumnRow = RowDataPacket & {
  COLUMN_NAME: string;
};

export const ensureReviewSchema = oncePerProcess(async () => {
  await getPool().execute(
    `ALTER TABLE \`review\` ADD COLUMN IF NOT EXISTS booster_id BIGINT UNSIGNED NULL`,
  );
  await getPool().execute(
    `ALTER TABLE \`review\` ADD COLUMN IF NOT EXISTS booster_name VARCHAR(60) NULL`,
  );
  await getPool().execute(
    `ALTER TABLE \`review\` ADD COLUMN IF NOT EXISTS view_count INT UNSIGNED NOT NULL DEFAULT 0`,
  );
  await getPool().execute(`
    CREATE TABLE IF NOT EXISTS review_replies (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      review_id BIGINT UNSIGNED NOT NULL,
      booster_id BIGINT UNSIGNED NOT NULL,
      booster_name VARCHAR(60) NOT NULL DEFAULT '',
      content TEXT NOT NULL,
      tier_records JSON NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_review_replies_review_id (review_id),
      INDEX idx_review_replies_booster_id (booster_id)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
  await getPool().execute(
    `ALTER TABLE review_replies ADD COLUMN IF NOT EXISTS booster_name VARCHAR(60) NOT NULL DEFAULT ''`,
  );
  await getPool().execute(`
    UPDATE review_replies rr
    LEFT JOIN booster b ON b.id = rr.booster_id
    SET rr.booster_name = COALESCE(b.name, '')
    WHERE rr.booster_name = ''
  `);
  const [legacyNameColumns] = await getPool().execute<SchemaColumnRow[]>(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'review_replies'
       AND COLUMN_NAME <> 'booster_name'
       AND COLUMN_NAME REGEXP '_name$'
     ORDER BY ORDINAL_POSITION
     LIMIT 1`,
  );
  const legacyNameColumn = legacyNameColumns[0]?.COLUMN_NAME;
  if (legacyNameColumn && /^[a-z][a-z0-9_]*$/i.test(legacyNameColumn)) {
    const escapedColumn = legacyNameColumn.replaceAll("`", "``");
    await getPool().execute(
      `ALTER TABLE review_replies DROP COLUMN \`${escapedColumn}\``,
    );
  }
  await getPool().execute(
    `ALTER TABLE review_replies ADD COLUMN IF NOT EXISTS tier_records JSON NULL`,
  );

  await ensureIndexes();
});

/**
 * 실제 쿼리 패턴에 맞춘 복합 인덱스를 보장한다.
 *
 * 기존 인덱스는 단일 컬럼(created_at, booster_id)뿐이라 정렬까지 커버하지
 * 못했다. 목록·이전/다음·관련 후기 조회가 모두 `... ORDER BY created_at DESC,
 * id DESC` 형태라 정렬 컬럼을 인덱스에 포함해야 파일소트가 사라진다.
 *
 * CREATE INDEX IF NOT EXISTS는 MySQL이 지원하지 않으므로
 * INFORMATION_SCHEMA로 존재 여부를 확인한 뒤 생성한다.
 */
const REVIEW_INDEXES: Array<{ name: string; definition: string }> = [
  // getReviewPage, getReviewNavigation: 전체 목록 정렬
  { name: "idx_review_created_id", definition: "(created_at, id)" },
  // getBoosterReviewPage, getRelatedReviews(같은 기사)
  {
    name: "idx_review_booster_created",
    definition: "(booster_id, created_at, id)",
  },
  // getRelatedReviews(같은 서비스)
  {
    name: "idx_review_service_created",
    definition: "(service, created_at, id)",
  },
];

/**
 * 위 복합 인덱스의 왼쪽 접두사라 중복인 기존 단일 컬럼 인덱스.
 * 남겨두면 쓰기마다 갱신 비용과 디스크만 더 든다.
 *   idx_review_booster_id (booster_id) ⊂ idx_review_booster_created
 *   idx_review_created_at (created_at) ⊂ idx_review_created_id
 * 대체 인덱스가 실제로 존재할 때만 지운다.
 */
const REDUNDANT_REVIEW_INDEXES: Array<{ name: string; supersededBy: string }> = [
  { name: "idx_review_booster_id", supersededBy: "idx_review_booster_created" },
  { name: "idx_review_created_at", supersededBy: "idx_review_created_id" },
];

async function ensureIndexes() {
  const pool = getPool();
  const readExisting = async () => {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'review'`,
    );
    return new Set(rows.map((row) => String(row.INDEX_NAME)));
  };

  let existing = await readExisting();

  let created = false;
  for (const index of REVIEW_INDEXES) {
    if (existing.has(index.name)) continue;
    try {
      await pool.execute(
        `CREATE INDEX \`${index.name}\` ON \`review\` ${index.definition}`,
      );
      created = true;
    } catch (error) {
      // 인덱스 생성 실패로 서비스가 죽으면 안 된다. 없어도 동작은 한다.
      console.error(`ensureIndexes: ${index.name} 생성 실패`, error);
    }
  }
  if (created) existing = await readExisting();

  for (const { name, supersededBy } of REDUNDANT_REVIEW_INDEXES) {
    // 대체 인덱스가 없는데 지우면 조회가 느려진다. 둘 다 확인한 뒤에만 지운다.
    if (!existing.has(name) || !existing.has(supersededBy)) continue;
    try {
      await pool.execute(`DROP INDEX \`${name}\` ON \`review\``);
    } catch (error) {
      console.error(`ensureIndexes: ${name} 제거 실패`, error);
    }
  }
}

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
    boosterId: row.booster_id ? String(row.booster_id) : undefined,
    boosterName: row.booster_name ?? undefined,
    rating: row.rating,
    content: row.content,
    createdAt: row.created_at.toISOString(),
    viewCount: Number(row.view_count ?? 0),
    reply: row.reply_id
      ? {
          id: String(row.reply_id),
          boosterId: String(row.reply_booster_id),
          boosterName: row.reply_booster_name ?? "",
          content: row.reply_content ?? "",
          tierRecords: parseTierRecords(row.reply_tier_records),
          createdAt: row.reply_created_at!.toISOString(),
        }
      : undefined,
  };
}

const REVIEW_SELECT = `
  SELECT r.id, r.name, r.service, r.booster_id,
         COALESCE(b.name, r.booster_name) AS booster_name,
         r.rating, r.content, r.view_count, r.created_at,
         rr.id AS reply_id, rr.booster_id AS reply_booster_id,
         rr.booster_name AS reply_booster_name,
         rr.content AS reply_content, rr.tier_records AS reply_tier_records,
         rr.created_at AS reply_created_at
  FROM \`review\` r
  LEFT JOIN booster b ON b.id = r.booster_id
  LEFT JOIN review_replies rr ON rr.review_id = r.id
`;

/** 기사 상세용 서버 사이드 페이지네이션: 해당 페이지 분량 + 전체 개수 */
export async function getBoosterReviewPage(
  boosterId: number,
  page = 1,
  perPage = 3,
): Promise<{ reviewList: Review[]; total: number; page: number; perPage: number }> {
  await ensureReviewSchema();
  return getBoosterReviewPageCached(boosterId, page, perPage);
}

const getBoosterReviewPageCached = unstable_cache(
  queryBoosterReviewPage,
  ["booster-review-page"],
  { tags: [CACHE_TAGS.reviews], revalidate: CACHE_MAX_AGE_SECONDS },
);

async function queryBoosterReviewPage(
  boosterId: number,
  page: number,
  perPage: number,
): Promise<{ reviewList: Review[]; total: number; page: number; perPage: number }> {
  const pool = getPool();
  const safePer = Math.max(1, Math.min(50, Math.floor(perPage)));
  const requestedPage = Math.max(1, Math.floor(page) || 1);
  const safeBoosterId = Math.floor(boosterId);

  const selectPage = (offset: number) =>
    pool.query<ReviewRow[]>(
      `${REVIEW_SELECT} WHERE r.booster_id = ${safeBoosterId}
       ORDER BY r.created_at DESC, r.id DESC LIMIT ${safePer} OFFSET ${offset}`,
    );

  // getReviewPage와 같은 이유로 개수와 행을 함께 던진다.
  const [[countRows], [rows]] = await Promise.all([
    pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM \`review\` WHERE booster_id = :boosterId`,
      { boosterId },
    ),
    selectPage((requestedPage - 1) * safePer),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / safePer));

  if (requestedPage > totalPages) {
    const [lastRows] = await selectPage((totalPages - 1) * safePer);
    return {
      reviewList: lastRows.map(toReview),
      total,
      page: totalPages,
      perPage: safePer,
    };
  }

  return {
    reviewList: rows.map(toReview),
    total,
    page: requestedPage,
    perPage: safePer,
  };
}

export async function getReviewList(limit = 5000) {
  await ensureReviewSchema();
  const safeLimit = Math.max(1, Math.min(100000, Math.floor(limit)));
  const [rows] = await getPool().query<ReviewRow[]>(
    `${REVIEW_SELECT} ORDER BY r.created_at DESC, r.id DESC LIMIT ${safeLimit}`,
  );
  return rows.map(toReview);
}

/** sitemap용 경량 조회: id/created_at만 (조인·JSON 파싱 없음) */
export async function getSitemapReviewEntries(
  limit = 5000,
): Promise<Array<{ id: string; createdAt: string }>> {
  await ensureReviewSchema();
  const safeLimit = Math.max(1, Math.min(100000, Math.floor(limit)));
  const [rows] = await getPool().query<RowDataPacket[]>(
    `SELECT id, created_at FROM \`review\` ORDER BY created_at DESC, id DESC LIMIT ${safeLimit}`,
  );
  return rows.map((r) => ({
    id: String(r.id),
    createdAt: (r.created_at as Date).toISOString(),
  }));
}

/**
 * 서버 사이드 페이지네이션: 현재 페이지 분량만 조회 + 전체 개수.
 *
 * 개수를 먼저 받아 페이지를 보정한 뒤 행을 조회하면 왕복이 두 번이다.
 * 요청 페이지는 대부분 링크에서 오는 유효한 값이므로 개수와 행을 함께 던지고,
 * 범위를 벗어난 경우에만 마지막 페이지로 한 번 더 조회한다.
 */
export async function getReviewPage(
  page = 1,
  perPage = 20,
): Promise<{ reviewList: Review[]; total: number; page: number; perPage: number }> {
  // 요청 간 캐시를 붙이지 않는다. 사용자가 후기를 쓴 직후 확인하는 화면이라
  // 한 번의 stale도 "내 글이 안 보인다"가 된다(lib/cache-tags.ts 주석 참고).
  await ensureReviewSchema();
  const pool = getPool();
  const safePer = Math.max(1, Math.min(100, Math.floor(perPage)));
  const requestedPage = Math.max(1, Math.floor(page) || 1);

  const selectPage = (offset: number) =>
    pool.query<ReviewRow[]>(
      `${REVIEW_SELECT} ORDER BY r.created_at DESC, r.id DESC LIMIT ${safePer} OFFSET ${offset}`,
    );

  const [[countRows], [rows]] = await Promise.all([
    pool.query<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM \`review\``),
    selectPage((requestedPage - 1) * safePer),
  ]);

  const total = Number(countRows[0]?.total ?? 0);
  const totalPages = Math.max(1, Math.ceil(total / safePer));

  if (requestedPage > totalPages) {
    const [lastRows] = await selectPage((totalPages - 1) * safePer);
    return {
      reviewList: lastRows.map(toReview),
      total,
      page: totalPages,
      perPage: safePer,
    };
  }

  return {
    reviewList: rows.map(toReview),
    total,
    page: requestedPage,
    perPage: safePer,
  };
}

/**
 * generateMetadata와 페이지 본문이 각각 호출한다. Next는 임의 DB 호출을
 * 중복 제거하지 않으므로 요청 단위로 메모이즈한다.
 */
export const getReviewById = cache(
  async (id: number): Promise<Review | null> => {
    await ensureReviewSchema();
    const [rows] = await getPool().execute<ReviewRow[]>(
      `${REVIEW_SELECT} WHERE r.id = :id LIMIT 1`,
      { id },
    );
    return rows[0] ? toReview(rows[0]) : null;
  },
);

/**
 * 후기 상세 하단 관련 후기.
 * 후기 본문은 100자 상한이라 상세 페이지 하나의 고유 텍스트가 매우 적다.
 * 같은 기사 → 같은 서비스 순으로 채워 텍스트 분량과 후기 간 내부 링크를
 * 동시에 확보한다(후기 페이지가 목록·이전/다음 외에는 고립돼 있었다).
 */
export async function getRelatedReviews(
  excludeId: number,
  boosterId: string | undefined,
  service: string,
  limit = 6,
): Promise<Review[]> {
  await ensureReviewSchema();
  const safeLimit = Math.max(1, Math.min(20, Math.floor(limit)));
  const safeExclude = Math.floor(excludeId);
  const collected: Review[] = [];
  const seen = new Set<string>([String(safeExclude)]);

  const push = (rows: ReviewRow[]) => {
    for (const row of rows) {
      if (collected.length >= safeLimit) return;
      const review = toReview(row);
      if (seen.has(review.id)) continue;
      seen.add(review.id);
      collected.push(review);
    }
  };

  // 1순위: 같은 기사의 다른 후기. 기사 프로필과 후기를 서로 엮는다.
  const numericBoosterId = Number(boosterId);
  if (Number.isInteger(numericBoosterId) && numericBoosterId > 0) {
    const [rows] = await getPool().query<ReviewRow[]>(
      `${REVIEW_SELECT} WHERE r.booster_id = ${numericBoosterId} AND r.id <> ${safeExclude}
       ORDER BY r.created_at DESC, r.id DESC LIMIT ${safeLimit}`,
    );
    push(rows);
  }

  // 2순위: 같은 서비스의 최근 후기로 나머지를 채운다.
  if (collected.length < safeLimit && service) {
    // 이미 담은 항목과 겹칠 수 있으므로 여유분을 조회해 JS에서 걸러낸다.
    const fetchCount = safeLimit + collected.length + 1;
    const [rows] = await getPool().execute<ReviewRow[]>(
      `${REVIEW_SELECT} WHERE r.service = :service AND r.id <> ${safeExclude}
       ORDER BY r.created_at DESC, r.id DESC LIMIT ${fetchCount}`,
      { service },
    );
    push(rows);
  }

  return collected;
}

/**
 * 이전/다음 후기.
 *
 * 기준 시각(knownCreatedAt)을 넘기면 현재 글 조회를 건너뛴다. 호출부가 이미
 * 후기를 읽은 뒤라면 왕복이 하나 줄어든다. 원격 DB라 쿼리 복잡도보다
 * 왕복 횟수가 응답 시간을 지배한다.
 */
export async function getReviewNavigation(
  id: number,
  knownCreatedAt?: string | Date,
): Promise<{
  previous?: ReviewNavItem;
  next?: ReviewNavItem;
}> {
  await ensureReviewSchema();
  const pool = getPool();

  let createdAt: Date;
  if (knownCreatedAt) {
    createdAt = new Date(knownCreatedAt);
  } else {
    const [curRows] = await pool.execute<RowDataPacket[]>(
      `SELECT created_at FROM \`review\` WHERE id = :id LIMIT 1`,
      { id },
    );
    if (!curRows[0]) return {};
    createdAt = curRows[0].created_at as Date;
  }

  // 목록 정렬: created_at DESC, id DESC → 이전=더 최신, 다음=더 과거.
  // 이전/다음을 각각 조회하면 왕복이 한 번 더 생긴다. UNION ALL로 묶어
  // 한 번에 가져온다(후기 상세는 1,600여 개라 요청당 왕복 수가 그대로 부하다).
  const NAV_COLUMNS = "id, name, content, created_at";
  const [navRows] = await pool.execute<RowDataPacket[]>(
    `(SELECT ${NAV_COLUMNS}, 'previous' AS direction FROM \`review\`
      WHERE (created_at > :createdAt) OR (created_at = :createdAt AND id > :id)
      ORDER BY created_at ASC, id ASC LIMIT 1)
     UNION ALL
     (SELECT ${NAV_COLUMNS}, 'next' AS direction FROM \`review\`
      WHERE (created_at < :createdAt) OR (created_at = :createdAt AND id < :id)
      ORDER BY created_at DESC, id DESC LIMIT 1)`,
    { createdAt, id },
  );

  const toNavItem = (row: RowDataPacket): ReviewNavItem => ({
    id: String(row.id),
    name: row.name,
    content: row.content,
    createdAt: (row.created_at as Date).toISOString(),
  });

  const previousRow = navRows.find((row) => row.direction === "previous");
  const nextRow = navRows.find((row) => row.direction === "next");

  return {
    previous: previousRow ? toNavItem(previousRow) : undefined,
    next: nextRow ? toNavItem(nextRow) : undefined,
  };
}
