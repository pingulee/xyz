import { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";

export type Notice = {
  id: string;
  title: string;
  content: string;
  image: string | null;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NoticeNavItem = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

type NoticeRow = RowDataPacket & {
  id: number;
  title: string;
  content: string;
  image_url: string | null;
  pinned: 0 | 1;
  created_at: Date;
  updated_at: Date;
};

export function toNotice(row: NoticeRow): Notice {
  return {
    id: String(row.id),
    title: row.title,
    content: row.content,
    image: row.image_url ?? null,
    pinned: Boolean(row.pinned),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function getNotices(limit = 100) {
  const [rows] = await getPool().execute<NoticeRow[]>(
    `SELECT id, title, content, image_url, pinned, created_at, updated_at
     FROM notices
     ORDER BY pinned DESC, created_at DESC
     LIMIT :limit`,
    { limit },
  );

  return rows.map(toNotice);
}

export async function getNoticeById(id: number): Promise<Notice | null> {
  const [rows] = await getPool().execute<NoticeRow[]>(
    `SELECT id, title, content, image_url, pinned, created_at, updated_at
     FROM notices
     WHERE id = :id
     LIMIT 1`,
    { id },
  );

  return rows[0] ? toNotice(rows[0]) : null;
}

export async function getNoticeNavigation(id: number): Promise<{
  previous?: NoticeNavItem;
  next?: NoticeNavItem;
}> {
  const notices = await getNotices(500);
  const index = notices.findIndex((notice) => notice.id === String(id));

  if (index === -1) return {};

  const toNavItem = (notice: Notice): NoticeNavItem => ({
    id: notice.id,
    title: notice.title,
    content: notice.content,
    createdAt: notice.createdAt,
  });

  return {
    previous: index > 0 ? toNavItem(notices[index - 1]) : undefined,
    next: index < notices.length - 1 ? toNavItem(notices[index + 1]) : undefined,
  };
}
