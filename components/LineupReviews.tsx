"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Star } from "lucide-react";
import type { Review } from "@/lib/reviews";

const PER_PAGE = 5;

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-gold">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={14} fill={i < rating ? "currentColor" : "none"} strokeWidth={1.5} />
      ))}
    </div>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

function ReplyBlock({
  review,
  knightLineupId,
}: {
  review: Review;
  knightLineupId: number | null;
}) {
  const [draft, setDraft] = useState(review.reply?.content ?? "");
  const [replyData, setReplyData] = useState(review.reply);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const canReply = knightLineupId !== null && review.lineupId === String(knightLineupId);

  if (!replyData && !canReply) return null;

  const submitReply = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/reviews/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: review.id, content: draft.trim() }),
      });
      const data = (await res.json()) as { reply?: Review["reply"]; message?: string };
      if (!res.ok) return;
      setReplyData(data.reply);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const deleteReply = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/reviews/reply", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: review.id }),
      });
      if (!res.ok) return;
      setReplyData(undefined);
      setDraft("");
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-gold/15 bg-white/3 p-4">
      <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-gold">기사 답변</p>
      {replyData && !editing ? (
        <div>
          <p className="text-sm leading-7 whitespace-pre-wrap text-zinc-300">{replyData.content}</p>
          {canReply && (
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={() => { setDraft(replyData.content); setEditing(true); }}
                className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-zinc-400 transition hover:border-gold/40 hover:text-white">수정</button>
              <button type="button" onClick={() => void deleteReply()} disabled={saving}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-zinc-400 transition hover:border-red-400/40 hover:text-red-200 disabled:opacity-60">
                {saving && <Loader2 size={10} className="animate-spin" />}삭제</button>
            </div>
          )}
        </div>
      ) : canReply ? (
        <div className="grid gap-2">
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3} maxLength={500}
            placeholder="답변을 남겨주세요."
            className="resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50 w-full" />
          <div className="flex justify-end gap-2">
            {editing && <button type="button" onClick={() => setEditing(false)}
              className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-zinc-400 transition hover:border-gold/40 hover:text-white">취소</button>}
            <button type="button" onClick={() => void submitReply()} disabled={saving || !draft.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-4 py-2 text-xs font-black text-black transition disabled:cursor-not-allowed disabled:opacity-60">
              {saving && <Loader2 size={12} className="animate-spin" />}
              {editing ? "수정 저장" : "답변 등록"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function LineupReviews({
  reviews,
  knightLineupId = null,
}: {
  reviews: Review[];
  knightLineupId?: number | null;
}) {
  const [page, setPage] = useState(1);

  if (reviews.length === 0) {
    return (
      <div className="rounded-3xl border border-white/8 bg-white/[.03] px-6 py-10 text-center text-sm text-zinc-500">
        아직 이 기사의 후기가 없습니다.
      </div>
    );
  }

  const totalPages = Math.ceil(reviews.length / PER_PAGE);
  const currentPage = Math.min(page, totalPages);
  const slice = reviews.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <div className="grid gap-4">
      {slice.map((review) => (
        <div
          key={review.id}
          className="rounded-3xl border border-white/8 bg-white/[.035] p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <Stars rating={review.rating} />
              <p className="mt-2 font-black text-white">{review.name}</p>
            </div>
            <div className="text-right">
              <span className="rounded-full bg-gold/10 px-2.5 py-1 text-xs font-black text-gold">
                {review.service}
              </span>
              <p className="mt-1.5 text-xs text-zinc-500">{formatDate(review.createdAt)}</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-7 whitespace-pre-wrap text-zinc-300">
            {review.content}
          </p>
          <ReplyBlock review={review} knightLineupId={knightLineupId} />
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-zinc-400 transition hover:border-gold/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>

          {pages.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`grid h-9 w-9 place-items-center rounded-full text-sm font-black transition ${
                p === currentPage
                  ? "bg-gold text-black"
                  : "border border-white/10 text-zinc-300 hover:border-gold/40 hover:text-white"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-zinc-400 transition hover:border-gold/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
