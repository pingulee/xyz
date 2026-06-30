"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Review, ReviewReply, TierRecord } from "@/lib/reviews";

const TIER_OPTIONS = [
  "아이언",
  "브론즈",
  "실버",
  "골드",
  "플래티넘",
  "에메랄드",
  "다이아몬드",
  "마스터",
  "그랜드마스터",
  "챌린저",
];

const TIER_ICON_BY_NAME: Record<string, string> = {
  아이언: "/images/tier/1-iron.png",
  브론즈: "/images/tier/2-bronze.png",
  실버: "/images/tier/3-silver.png",
  골드: "/images/tier/4-gold.png",
  플래티넘: "/images/tier/5-platinum.png",
  에메랄드: "/images/tier/6-emerald.png",
  다이아몬드: "/images/tier/7-diamond.png",
  마스터: "/images/tier/8-master.png",
  그랜드마스터: "/images/tier/9-grandmaster.png",
  챌린저: "/images/tier/10-challenger.png",
};

const inputCls =
  "rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1 text-gold">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={17}
          fill={i < rating ? "currentColor" : "none"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function TierRecordEditor({
  records,
  onChange,
}: {
  records: TierRecord[];
  onChange: (records: TierRecord[]) => void;
}) {
  const add = () => onChange([...records, { tier: "골드", wins: 0, losses: 0 }]);
  const remove = (i: number) => onChange(records.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof TierRecord, value: string | number) =>
    onChange(records.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-zinc-400">작업 기록</span>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-zinc-400 transition hover:border-gold/40 hover:text-white"
        >
          <Plus size={11} /> 추가
        </button>
      </div>
      {records.map((record, i) => (
        <div
          key={i}
          className="grid gap-2 rounded-2xl border border-white/8 bg-white/[.025] p-2 sm:grid-cols-[1fr_auto_auto_auto_auto_auto] sm:items-center"
        >
          <select
            value={record.tier}
            onChange={(event) => update(i, "tier", event.target.value)}
            className={`${inputCls} flex-1`}
          >
            {TIER_OPTIONS.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            max={999}
            value={record.wins}
            onChange={(event) =>
              update(i, "wins", Math.max(0, Number(event.target.value) || 0))
            }
            className={`${inputCls} w-16 text-center`}
            placeholder="승"
          />
          <span className="shrink-0 text-xs text-zinc-500">승</span>
          <input
            type="number"
            min={0}
            max={999}
            value={record.losses}
            onChange={(event) =>
              update(i, "losses", Math.max(0, Number(event.target.value) || 0))
            }
            className={`${inputCls} w-16 text-center`}
            placeholder="패"
          />
          <span className="shrink-0 text-xs text-zinc-500">패</span>
          <button
            type="button"
            onClick={() => remove(i)}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-white/10 text-zinc-500 transition hover:border-red-400/40 hover:text-red-300"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default function ReviewDetailView({
  initialReview,
  knightLineupId,
  knightName,
  knightImage,
}: {
  initialReview: Review;
  knightLineupId: number | null;
  knightName: string;
  knightImage: string;
}) {
  const router = useRouter();
  const [review, setReview] = useState(initialReview);
  const [editingReply, setEditingReply] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(review.reply?.content ?? "");
  const [tierRecords, setTierRecords] = useState<TierRecord[]>(
    review.reply?.tierRecords ?? [],
  );

  const canReply =
    knightLineupId !== null && review.lineupId === String(knightLineupId);
  const isLoggedIn = knightLineupId !== null;
  const displayKnightName =
    review.reply?.knightName || knightName || "기사 답변";

  const openReplyForm = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setDraft(review.reply?.content ?? "");
    setTierRecords(review.reply?.tierRecords ?? []);
    setEditingReply(Boolean(review.reply));
    setFormOpen(true);
  };

  const submitReply = async () => {
    if (!draft.trim()) return;
    setSaving(true);
    try {
      const response = await fetch("/api/reviews/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewId: review.id,
          content: draft.trim(),
          tierRecords,
        }),
      });
      const data = (await response.json()) as {
        reply?: ReviewReply;
        message?: string;
      };
      if (!response.ok || !data.reply) return;
      setReview((current) => ({ ...current, reply: data.reply }));
      setFormOpen(false);
      setEditingReply(false);
    } finally {
      setSaving(false);
    }
  };

  const deleteReply = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/reviews/reply", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: review.id }),
      });
      if (!response.ok) return;
      setReview((current) => ({ ...current, reply: undefined }));
      setFormOpen(false);
      setEditingReply(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <article className="overflow-hidden rounded-[30px] border border-gold/15 bg-white/[.035]">
        <div className="border-b border-white/8 bg-black/20 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">
                review
              </p>
              <h1 className="mt-2 text-2xl font-black text-white">
                {review.name}님의 후기
              </h1>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-black ${
                review.reply
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                  : "border-white/10 bg-white/5 text-zinc-500"
              }`}
            >
              {review.reply ? "답변 완료" : "답변 대기"}
            </span>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_16rem]">
          <div className="grid gap-5">
            <div className="grid gap-3 rounded-3xl border border-white/8 bg-black/15 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-black text-zinc-500">작업 기사</p>
                <p className="mt-1 font-black text-white">
                  {review.lineupName ?? review.reply?.knightName ?? "선택 안 함"}
                </p>
              </div>
              <div>
                <p className="text-xs font-black text-zinc-500">서비스</p>
                <p className="mt-1 font-black text-white">{review.service}</p>
              </div>
            </div>

            <p className="whitespace-pre-wrap text-base leading-8 text-zinc-200">
              {review.content}
            </p>
          </div>

          <aside className="grid content-start gap-3 rounded-3xl border border-white/8 bg-black/15 p-4">
            <div>
              <p className="text-xs font-black text-zinc-500">평점</p>
              <div className="mt-2">
                <Stars rating={review.rating} />
              </div>
            </div>
            <div>
              <p className="text-xs font-black text-zinc-500">작성일</p>
              <time
                dateTime={review.createdAt}
                className="mt-1 block text-sm font-bold text-zinc-300"
              >
                {formatDate(review.createdAt)}
              </time>
            </div>
            <div>
              <p className="text-xs font-black text-zinc-500">조회수</p>
              <p className="mt-1 text-sm font-black text-white">
                {review.viewCount}
              </p>
            </div>
          </aside>
        </div>
      </article>

      <section className="relative overflow-hidden rounded-[30px] border border-gold/20 bg-zinc-950 p-6">
        {knightImage && (
          <Image
            src={knightImage}
            alt=""
            fill
            className="object-cover opacity-18"
            sizes="(max-width: 1024px) 100vw, 960px"
            unoptimized
          />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.90),rgba(0,0,0,0.72)_55%,rgba(0,0,0,0.45))]" />

        <div className="relative grid gap-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-gold/25 bg-black/30">
                {knightImage ? (
                  <Image
                    src={knightImage}
                    alt={displayKnightName}
                    fill
                    className="object-cover"
                    sizes="56px"
                    unoptimized
                  />
                ) : (
                  <span className="grid h-full w-full place-items-center text-lg font-black text-gold">
                    {displayKnightName.slice(0, 1)}
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-gold">
                  knight reply
                </p>
                <h2 className="mt-1 text-xl font-black text-white">
                  {displayKnightName}
                </h2>
              </div>
            </div>

            {canReply && (
              <div className="flex gap-2">
                {review.reply && (
                  <button
                    type="button"
                    onClick={deleteReply}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-full border border-red-400/30 px-4 py-2 text-sm font-bold text-red-200 transition hover:bg-red-400/10 disabled:opacity-50"
                  >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    삭제
                  </button>
                )}
                <button
                  type="button"
                  onClick={openReplyForm}
                  className="rounded-full bg-gold-gradient px-5 py-2 text-sm font-black text-black"
                >
                  {review.reply ? "답변 수정" : "답변 작성"}
                </button>
              </div>
            )}
          </div>

          {review.reply && !formOpen ? (
            <>
              {review.reply.tierRecords.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {review.reply.tierRecords.map((record, index) => {
                    const icon = TIER_ICON_BY_NAME[record.tier];
                    const total = record.wins + record.losses;
                    const rate =
                      total > 0 ? Math.round((record.wins / total) * 100) : 0;
                    return (
                      <div
                        key={`${record.tier}-${index}`}
                        className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/25 px-3 py-2"
                      >
                        {icon && (
                          <Image
                            src={icon}
                            alt={record.tier}
                            width={28}
                            height={28}
                            className="rounded-full bg-zinc-900"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-gold">
                            {record.tier}
                          </p>
                          <p className="text-xs font-bold text-zinc-400">
                            {record.wins}승 {record.losses}패
                          </p>
                        </div>
                        <span className="text-sm font-black text-white">
                          {rate}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="whitespace-pre-wrap text-base leading-8 text-zinc-200">
                {review.reply.content}
              </p>
              <time
                dateTime={review.reply.createdAt}
                className="text-xs font-bold text-zinc-500"
              >
                {formatDate(review.reply.createdAt)}
              </time>
            </>
          ) : formOpen && canReply ? (
            <div className="grid gap-4">
              <TierRecordEditor records={tierRecords} onChange={setTierRecords} />
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                rows={5}
                maxLength={500}
                placeholder="고객에게 답변을 남겨주세요."
                className="resize-none rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormOpen(false);
                    setEditingReply(false);
                  }}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-400 transition hover:border-gold/40 hover:text-white"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={submitReply}
                  disabled={saving || !draft.trim()}
                  className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-5 py-2.5 text-sm font-black text-black transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {editingReply ? "수정 저장" : "답변 등록"}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-white/8 bg-black/25 px-4 py-8 text-center text-sm font-bold text-zinc-500">
              아직 기사 답변이 없습니다.
            </div>
          )}

          {!canReply && !review.reply && (
            <button
              type="button"
              onClick={openReplyForm}
              className="justify-self-start text-xs font-bold text-zinc-500 transition hover:text-gold"
            >
              {isLoggedIn ? "이 기사의 후기에만 답변 가능합니다" : "기사님만 답변 가능 - 로그인하기"}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
