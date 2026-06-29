import { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";

export type Notice = {
  id: string;
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

export function toNotice(row: NoticeRow): Notice {
  return {
    id: String(row.id),
    title: row.title,
    content: row.content,
    pinned: Boolean(row.pinned),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function getNotices(limit = 100) {
  const [rows] = await getPool().execute<NoticeRow[]>(
    `SELECT id, title, content, pinned, created_at, updated_at
     FROM notices
     ORDER BY pinned DESC, created_at DESC
     LIMIT :limit`,
    { limit },
  );

  return rows.map(toNotice);
}
