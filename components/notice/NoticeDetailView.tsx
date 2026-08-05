"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Pin, Trash2 } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import NoticeForm, { type NoticeValues } from "@/components/notice/NoticeForm";
import { formatNoticeDate } from "@/components/notice/format";
import type { Notice } from "@/lib/notice";

// 공지 상세. 본문은 SSR/ISR HTML로 그대로 나오고, 관리자 편집·삭제 UI만 세션 확인 후 켠다.
export default function NoticeDetailView({
  initialNotice,
}: {
  initialNotice: Notice;
}) {
  const { session } = useSession();
  const isAdmin = session.role === "admin";
  const router = useRouter();
  const [notice, setNotice] = useState<Notice>(initialNotice);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const update = async (values: NoticeValues): Promise<string | null> => {
    const res = await fetch("/api/notice", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: notice.id, ...values }),
    });
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    if (!res.ok) return data.message ?? "수정에 실패했습니다.";
    setNotice({ ...notice, ...values });
    setEditing(false);
    router.refresh();
    return null;
  };

  const remove = async () => {
    if (!confirm("이 공지를 삭제할까요?")) return;
    setDeleting(true);
    const res = await fetch("/api/notice", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: notice.id }),
    });
    if (res.ok) {
      router.push("/notice");
      router.refresh();
    } else {
      setDeleting(false);
      alert("삭제에 실패했습니다.");
    }
  };

  if (editing) {
    return (
      <div className="card-premium rounded-3xl p-6 sm:p-8">
        <p className="mb-4 text-sm font-black text-gold">공지 수정</p>
        <NoticeForm
          initial={{
            title: notice.title,
            content: notice.content,
            pinned: notice.pinned,
          }}
          submitLabel="저장"
          onSubmit={update}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <article className="card-premium rounded-3xl p-6 sm:p-8">
      <header className="border-b border-white/10 pb-5">
        <div className="flex items-start justify-between gap-4">
          <h1 className="flex items-center gap-2 text-2xl font-black text-white">
            {notice.pinned && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-black text-gold">
                <Pin size={12} />고정
              </span>
            )}
            {notice.title}
          </h1>
          {isAdmin && (
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setEditing(true)}
                aria-label="공지 수정"
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 px-4 text-sm font-bold text-zinc-300 transition hover:border-gold/40 hover:text-white"
              >
                <Pencil size={14} />수정
              </button>
              <button
                type="button"
                onClick={remove}
                disabled={deleting}
                aria-label="공지 삭제"
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-red-400/20 px-4 text-sm font-bold text-red-200 transition hover:bg-red-500/10 disabled:opacity-60"
              >
                <Trash2 size={14} />삭제
              </button>
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          {formatNoticeDate(notice.createdAt)}
        </p>
      </header>
      <div className="whitespace-pre-wrap pt-6 leading-8 text-zinc-200">
        {notice.content}
      </div>
    </article>
  );
}
