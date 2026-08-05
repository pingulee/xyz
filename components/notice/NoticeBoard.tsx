"use client";

import { useState } from "react";
import Link from "next/link";
import { Pin, Plus } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import NoticeForm, { type NoticeValues } from "@/components/notice/NoticeForm";
import { formatNoticeDate } from "@/components/notice/format";
import type { Notice } from "@/lib/notice";

// 공지 목록. 관리자면 상단에 글쓰기 폼이 켜진다(세션은 useSession으로 클라이언트 확인).
export default function NoticeBoard({
  initialNotices,
}: {
  initialNotices: Notice[];
}) {
  const { session } = useSession();
  const isAdmin = session.role === "admin";
  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [writing, setWriting] = useState(false);

  const refresh = async () => {
    const res = await fetch("/api/notice", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { notices: Notice[] };
      setNotices(data.notices);
    }
  };

  const create = async (values: NoticeValues): Promise<string | null> => {
    const res = await fetch("/api/notice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    if (!res.ok) return data.message ?? "공지 등록에 실패했습니다.";
    setWriting(false);
    await refresh();
    return null;
  };

  return (
    <div className="mt-10">
      {isAdmin && (
        <div className="mb-6">
          {writing ? (
            <div className="card-premium rounded-3xl p-6">
              <p className="mb-4 text-sm font-black text-gold">새 공지 작성</p>
              <NoticeForm
                initial={{ title: "", content: "", pinned: false }}
                submitLabel="등록"
                onSubmit={create}
                onCancel={() => setWriting(false)}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setWriting(true)}
              className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-sm font-black text-black transition hover:brightness-110"
            >
              <Plus size={16} />공지 작성
            </button>
          )}
        </div>
      )}

      {notices.length === 0 ? (
        <p className="rounded-3xl border border-white/10 bg-black/20 px-6 py-16 text-center text-sm text-zinc-500">
          등록된 공지사항이 없습니다.
        </p>
      ) : (
        <ul className="grid gap-3">
          {notices.map((notice) => (
            <li key={notice.id}>
              <Link
                href={`/notice/${notice.id}`}
                className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-black/20 px-6 py-5 transition hover:border-gold/40 hover:bg-black/30"
              >
                <span className="flex min-w-0 items-center gap-2">
                  {notice.pinned && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-black text-gold">
                      <Pin size={12} />고정
                    </span>
                  )}
                  <span className="truncate font-bold text-white">
                    {notice.title}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-zinc-500">
                  {formatNoticeDate(notice.createdAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
