import { ResultSetHeader, RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { oncePerProcess } from "@/lib/schema-once";

// 문의하기. 비회원도 등록 가능하되 본인 확인용 임시 비밀번호(password_hash)를 남긴다.
// 회원이 쓰면 user_id로 소유가 잡혀 비번 없이도 열람/삭제 가능. 관리자는 전체 열람 + 답변.
// 본문은 비공개 — 목록은 제목·상태만 노출하고, 상세 본문은 인증(관리자|소유|비번) 후에만.
export const ensureInquirySchema = oncePerProcess(async () => {
  await getPool().execute(`
    CREATE TABLE IF NOT EXISTS inquiry (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      title VARCHAR(200) NOT NULL,
      content MEDIUMTEXT NOT NULL,
      author_name VARCHAR(60) NOT NULL DEFAULT '비회원',
      password_hash VARCHAR(200) NULL,
      user_id BIGINT UNSIGNED NULL,
      answer MEDIUMTEXT NULL,
      answered_at TIMESTAMP NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      INDEX idx_inquiry_created (created_at),
      INDEX idx_inquiry_user (user_id)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
});

// 목록 항목(본문·비번 제외).
export type InquiryListItem = {
  id: number;
  title: string;
  authorName: string;
  answered: boolean;
  createdAt: string;
};

// 상세 요약(페이지 초기 렌더용, 본문 제외). 본문은 인증 후 API로만 내려간다.
export type InquirySummary = InquiryListItem;

// 인증 통과 후 클라이언트로 내려가는 전체(비번 해시 제외).
export type InquiryFull = InquiryListItem & {
  content: string;
  answer: string | null;
  answeredAt: string | null;
};

// 서버 내부 판정용(비번 해시·user_id 포함). 라우트 밖으로 내보내지 않는다.
export type InquiryRecord = InquiryFull & {
  passwordHash: string | null;
  userId: number | null;
};

type InquiryRow = RowDataPacket & {
  id: number;
  title: string;
  content: string;
  author_name: string;
  password_hash: string | null;
  user_id: number | null;
  answer: string | null;
  answered_at: Date | null;
  created_at: Date;
};

function mapRecord(r: InquiryRow): InquiryRecord {
  return {
    id: r.id,
    title: r.title,
    content: r.content,
    authorName: r.author_name,
    answered: r.answer !== null && r.answer !== "",
    answer: r.answer,
    answeredAt: r.answered_at ? (r.answered_at as Date).toISOString() : null,
    createdAt: (r.created_at as Date).toISOString(),
    passwordHash: r.password_hash,
    userId: r.user_id,
  };
}

export async function getInquiryList(limit = 200): Promise<InquiryListItem[]> {
  await ensureInquirySchema();
  const [rows] = await getPool().execute<InquiryRow[]>(
    `SELECT id, title, author_name, answer, created_at
     FROM inquiry ORDER BY created_at DESC LIMIT :limit`,
    { limit },
  );
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    authorName: r.author_name,
    answered: r.answer !== null && r.answer !== "",
    createdAt: (r.created_at as Date).toISOString(),
  }));
}

export async function getInquirySummaryById(
  id: number,
): Promise<InquirySummary | null> {
  await ensureInquirySchema();
  const [rows] = await getPool().execute<InquiryRow[]>(
    `SELECT id, title, author_name, answer, created_at
     FROM inquiry WHERE id = :id LIMIT 1`,
    { id },
  );
  const r = rows[0];
  return r
    ? {
        id: r.id,
        title: r.title,
        authorName: r.author_name,
        answered: r.answer !== null && r.answer !== "",
        createdAt: (r.created_at as Date).toISOString(),
      }
    : null;
}

// 전체 레코드(비번 해시·user_id 포함). 인증 판정을 위해 API에서만 쓴다.
export async function getInquiryRecordById(
  id: number,
): Promise<InquiryRecord | null> {
  await ensureInquirySchema();
  const [rows] = await getPool().execute<InquiryRow[]>(
    `SELECT id, title, content, author_name, password_hash, user_id, answer, answered_at, created_at
     FROM inquiry WHERE id = :id LIMIT 1`,
    { id },
  );
  return rows[0] ? mapRecord(rows[0]) : null;
}

export async function createInquiry(input: {
  title: string;
  content: string;
  authorName: string;
  passwordHash: string | null;
  userId: number | null;
}): Promise<number> {
  await ensureInquirySchema();
  const [res] = await getPool().execute<ResultSetHeader>(
    `INSERT INTO inquiry (title, content, author_name, password_hash, user_id)
     VALUES (:title, :content, :authorName, :passwordHash, :userId)`,
    input,
  );
  return res.insertId;
}

export async function setInquiryAnswer(id: number, answer: string): Promise<boolean> {
  await ensureInquirySchema();
  const [res] = await getPool().execute<ResultSetHeader>(
    `UPDATE inquiry SET answer = :answer, answered_at = NOW() WHERE id = :id`,
    { id, answer },
  );
  return res.affectedRows > 0;
}

export async function deleteInquiry(id: number): Promise<boolean> {
  await ensureInquirySchema();
  const [res] = await getPool().execute<ResultSetHeader>(
    `DELETE FROM inquiry WHERE id = :id`,
    { id },
  );
  return res.affectedRows > 0;
}

// 인증 통과분만 담아 클라이언트로 내보낼 형태(비번 해시·user_id 제거).
export function toFull(rec: InquiryRecord): InquiryFull {
  return {
    id: rec.id,
    title: rec.title,
    content: rec.content,
    authorName: rec.authorName,
    answered: rec.answered,
    answer: rec.answer,
    answeredAt: rec.answeredAt,
    createdAt: rec.createdAt,
  };
}
