"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
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

export default function LineupReviews({ reviews }: { reviews: Review[] }) {
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
