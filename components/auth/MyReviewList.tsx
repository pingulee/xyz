"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Loader2, Star, Trash2 } from "lucide-react";
import type { Review } from "@/lib/review";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

export default function MyReviewList({ initial }: { initial: Review[] }) {
  const [reviews, setReviews] = useState(initial);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const remove = async (id: number) => {
    if (!confirm("이 후기를 삭제할까요?")) return;
    setDeletingId(id);
    try {
      // 로그인 세션으로 소유권이 확인되므로 비밀번호 없이 삭제된다.
      const res = await fetch("/api/review", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setReviews((cur) => cur.filter((r) => Number(r.id) !== id));
      }
    } finally {
      setDeletingId(null);
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="mt-8 rounded-3xl border border-white/8 bg-white/3 px-6 py-12 text-center text-sm text-zinc-500">
        아직 로그인 상태로 작성한 후기가 없습니다.
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-3xl border border-white/8 bg-white/3.5 p-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex gap-0.5 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < review.rating ? "currentColor" : "none"}
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs font-bold text-zinc-500">
                {review.service} · {formatDate(review.createdAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => remove(Number(review.id))}
              disabled={deletingId === Number(review.id)}
              aria-label="후기 삭제"
              className="inline-flex items-center gap-1.5 rounded-full border border-red-400/25 px-3 py-1.5 text-xs font-bold text-red-200 transition hover:bg-red-400/10 disabled:opacity-50"
            >
              {deletingId === Number(review.id) ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Trash2 size={13} />
              )}
              삭제
            </button>
          </div>
          <p className="mt-3 line-clamp-3 text-sm leading-7 whitespace-pre-wrap text-zinc-300">
            {review.content}
          </p>
          <Link
            href={`/review/${review.id}`}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-zinc-400 transition hover:text-gold"
          >
            후기 상세 보기
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>
      ))}
    </div>
  );
}
