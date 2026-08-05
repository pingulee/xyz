import { ResultSetHeader, RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { oncePerProcess } from "@/lib/schema-once";

// 공지사항. 관리자만 작성/수정/삭제하고 방문자는 읽기만 한다.
// pinned=1은 목록 상단 고정. 별도 첨부/댓글 없이 제목+본문(plain text)만 다룬다.
export const ensureNoticeSchema = oncePerProcess(async () => {
  await getPool().execute(`
    CREATE TABLE IF NOT EXISTS notice (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      title VARCHAR(200) NOT NULL,
      content MEDIUMTEXT NOT NULL,
      pinned TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_notice_list (pinned, created_at)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
});

export type Notice = {
  id: number;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
};

type NoticeRow = RowDataPacket & {
  id: number;
  title: string;
  content: string;
  pinned: 0 | 1;
  created_at: Date;
  updated_at: Date;
};

function mapNotice(row: NoticeRow): Notice {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    pinned: row.pinned === 1,
    createdAt: (row.created_at as Date).toISOString(),
    updatedAt: (row.updated_at as Date).toISOString(),
  };
}

// 목록. 고정글 먼저, 그다음 최신순. 공지는 수가 적어 페이지네이션 없이 상한만 둔다.
export async function getNoticeList(limit = 100): Promise<Notice[]> {
  await ensureNoticeSchema();
  const [rows] = await getPool().execute<NoticeRow[]>(
    `SELECT id, title, content, pinned, created_at, updated_at
     FROM notice ORDER BY pinned DESC, created_at DESC LIMIT :limit`,
    { limit },
  );
  return rows.map(mapNotice);
}

export async function getNoticeById(id: number): Promise<Notice | null> {
  await ensureNoticeSchema();
  const [rows] = await getPool().execute<NoticeRow[]>(
    `SELECT id, title, content, pinned, created_at, updated_at
     FROM notice WHERE id = :id LIMIT 1`,
    { id },
  );
  return rows[0] ? mapNotice(rows[0]) : null;
}

export async function createNotice(input: {
  title: string;
  content: string;
  pinned: boolean;
}): Promise<number> {
  await ensureNoticeSchema();
  const [res] = await getPool().execute<ResultSetHeader>(
    `INSERT INTO notice (title, content, pinned)
     VALUES (:title, :content, :pinned)`,
    { title: input.title, content: input.content, pinned: input.pinned ? 1 : 0 },
  );
  return res.insertId;
}

export async function updateNotice(
  id: number,
  input: { title: string; content: string; pinned: boolean },
): Promise<boolean> {
  await ensureNoticeSchema();
  const [res] = await getPool().execute<ResultSetHeader>(
    `UPDATE notice SET title = :title, content = :content, pinned = :pinned
     WHERE id = :id`,
    { id, title: input.title, content: input.content, pinned: input.pinned ? 1 : 0 },
  );
  return res.affectedRows > 0;
}

export async function deleteNotice(id: number): Promise<boolean> {
  await ensureNoticeSchema();
  const [res] = await getPool().execute<ResultSetHeader>(
    `DELETE FROM notice WHERE id = :id`,
    { id },
  );
  return res.affectedRows > 0;
}

// 사이트맵 전용 경량 조회(본문 제외). getNoticeList와 달리 id·갱신일만 뽑는다.
export async function getSitemapNoticeEntries(): Promise<
  { id: number; updatedAt: string }[]
> {
  await ensureNoticeSchema();
  const [rows] = await getPool().execute<
    (RowDataPacket & { id: number; updated_at: Date })[]
  >(
    `SELECT id, updated_at FROM notice ORDER BY created_at DESC LIMIT 5000`,
  );
  return rows.map((r) => ({
    id: r.id,
    updatedAt: (r.updated_at as Date).toISOString(),
  }));
}
