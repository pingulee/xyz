"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import type { Review, ReviewReply, TierRecord } from "@/lib/reviews";

const PER_PAGE = 5;

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

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5 text-gold">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          fill={i < rating ? "currentColor" : "none"}
          strokeWidth={1.5}
        />
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

function TierBadges({ records }: { records: TierRecord[] }) {
  if (records.length === 0) return null;
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {records.map((r, i) => {
        const icon = TIER_ICON_BY_NAME[r.tier];
        const total = r.wins + r.losses;
        const rate = total > 0 ? Math.round((r.wins / total) * 100) : 0;
        return (
          <span
            key={i}
            className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-3 py-2"
          >
            {icon && (
              <Image
                src={icon}
                alt={r.tier}
                width={26}
                height={26}
                className="rounded-full bg-zinc-900"
              />
            )}
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-black text-gold">
                {r.tier}
              </span>
              <span className="block text-xs font-bold text-zinc-400">
                {r.wins}승 {r.losses}패
              </span>
            </span>
            <span className="text-sm font-black text-white">{rate}%</span>
          </span>
        );
      })}
    </div>
  );
}

function ReplyDisplay({
  reply,
  canEdit,
  saving,
  onEdit,
  onDelete,
}: {
  reply: ReviewReply;
  canEdit: boolean;
  saving: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div>
      <TierBadges records={reply.tierRecords} />
      <p className="mt-2 text-sm leading-7 whitespace-pre-wrap text-zinc-300">
        {reply.content}
      </p>
      <div className="mt-2 flex items-center gap-3">
        <span className="text-xs text-zinc-600">
          {formatDate(reply.createdAt)}
        </span>
        {canEdit && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="text-xs font-bold text-zinc-500 transition hover:text-zinc-200"
            >
              수정
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={saving}
              className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 transition hover:text-red-300 disabled:opacity-50"
            >
              {saving && <Loader2 size={10} className="animate-spin" />}삭제
            </button>
          </div>
        )}
      </div>
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
  const add = () =>
    onChange([...records, { tier: "골드", wins: 0, losses: 0 }]);

  const remove = (i: number) => onChange(records.filter((_, idx) => idx !== i));

  const update = (i: number, field: keyof TierRecord, value: string | number) =>
    onChange(
      records.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)),
    );

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
      {records.map((r, i) => (
        <div
          key={i}
          className="grid gap-2 rounded-2xl border border-white/8 bg-white/[.025] p-2 sm:grid-cols-[1fr_auto_auto_auto_auto_auto] sm:items-center"
        >
          <select
            value={r.tier}
            onChange={(e) => update(i, "tier", e.target.value)}
            className={`${inputCls} flex-1`}
          >
            {TIER_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            max={999}
            value={r.wins}
            onChange={(e) =>
              update(i, "wins", Math.max(0, Number(e.target.value) || 0))
            }
            className={`${inputCls} w-16 text-center`}
            placeholder="승"
          />
          <span className="text-xs text-zinc-500 shrink-0">승</span>
          <input
            type="number"
            min={0}
            max={999}
            value={r.losses}
            onChange={(e) =>
              update(i, "losses", Math.max(0, Number(e.target.value) || 0))
            }
            className={`${inputCls} w-16 text-center`}
            placeholder="패"
          />
          <span className="text-xs text-zinc-500 shrink-0">패</span>
          <button
            type="button"
            onClick={() => remove(i)}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 text-zinc-500 transition hover:border-red-400/40 hover:text-red-300"
          >
            <Trash2 size={11} />
          </button>
        </div>
      ))}
    </div>
  );
}

function ReplyForm({
  knightName,
  initial,
  saving,
  onSubmit,
  onCancel,
}: {
  knightName: string;
  initial?: ReviewReply;
  saving: boolean;
  onSubmit: (content: string, tierRecords: TierRecord[]) => void;
  onCancel?: () => void;
}) {
  const [content, setContent] = useState(initial?.content ?? "");
  const [tierRecords, setTierRecords] = useState<TierRecord[]>(
    initial?.tierRecords ?? [],
  );

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-black text-gold">{knightName}</span>
        <span className="text-xs text-zinc-600">기사 (닉네임 자동)</span>
      </div>
      <TierRecordEditor records={tierRecords} onChange={setTierRecords} />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={500}
        placeholder="고객에게 답변을 남겨주세요."
        className="resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50 w-full"
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold text-zinc-400 transition hover:border-gold/40 hover:text-white"
          >
            취소
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            if (content.trim()) onSubmit(content.trim(), tierRecords);
          }}
          disabled={saving || !content.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-4 py-2 text-xs font-black text-black transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving && <Loader2 size={12} className="animate-spin" />}
          {initial ? "수정 저장" : "답변 등록"}
        </button>
      </div>
    </div>
  );
}

function ReplyBlock({
  review,
  knightLineupId,
  knightName,
  knightImage,
}: {
  review: Review;
  knightLineupId: number | null;
  knightName: string;
  knightImage: string;
}) {
  const [replyData, setReplyData] = useState(review.reply);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const router = useRouter();
  const canReply =
    knightLineupId !== null && review.lineupId === String(knightLineupId);
  const isLoggedIn = knightLineupId !== null;

  const submitReply = async (content: string, tierRecords: TierRecord[]) => {
    setSaving(true);
    try {
      const res = await fetch("/api/reviews/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: review.id, content, tierRecords }),
      });
      const data = (await res.json()) as {
        reply?: ReviewReply;
        message?: string;
      };
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
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleReplyButtonClick = () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setFormOpen(true);
  };

  return (
    <div className="relative mt-4 overflow-hidden rounded-3xl border border-gold/20 bg-zinc-950 p-5">
      {knightImage && (
        <Image
          src={knightImage}
          alt=""
          fill
          className="object-cover opacity-20"
          sizes="(max-width: 768px) 100vw, 720px"
          unoptimized
        />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.88),rgba(0,0,0,0.62)_52%,rgba(0,0,0,0.30))]" />
      <div className="relative mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {knightImage ? (
            <Image
              src={knightImage}
              alt={replyData?.knightName ?? knightName}
              width={44}
              height={44}
              className="h-11 w-11 rounded-2xl border border-gold/25 object-cover"
              unoptimized
            />
          ) : (
            <div className="grid h-11 w-11 place-items-center rounded-2xl border border-gold/20 bg-gold/10 text-sm font-black text-gold">
              {(replyData?.knightName ?? knightName).slice(0, 1)}
            </div>
          )}
          <div>
            <p className="text-base font-black text-white">
              {replyData?.knightName ?? knightName}
            </p>
          </div>
        </div>
        {replyData && (
          <span className="rounded-full border border-gold/20 bg-black/20 px-3 py-1 text-xs font-black text-gold">
            답변 완료
          </span>
        )}
      </div>

      {/* 답변 존재 + 보기 모드 */}
      {replyData && !editing && (
        <ReplyDisplay
          reply={replyData}
          canEdit={canReply}
          saving={saving}
          onEdit={() => setEditing(true)}
          onDelete={() => void deleteReply()}
        />
      )}

      {/* 폼 (신규 or 수정) */}
      {canReply && (formOpen || editing) && (
        <div className="relative">
          <ReplyForm
            knightName={knightName}
            initial={editing ? replyData : undefined}
            saving={saving}
            onSubmit={(content, tierRecords) =>
              void submitReply(content, tierRecords)
            }
            onCancel={() => {
              setEditing(false);
              setFormOpen(false);
            }}
          />
        </div>
      )}

      {/* 답변 없고 폼 안 열린 상태 → 버튼 */}
      {!replyData && !formOpen && !editing && (
        <button
          type="button"
          onClick={handleReplyButtonClick}
          className="relative text-xs font-bold text-zinc-400 transition hover:text-gold"
        >
          {canReply
            ? "답변 작성"
            : isLoggedIn
              ? "이 기사의 후기에만 답변 가능합니다"
              : "기사님만 답변 가능 — 로그인하기"}
        </button>
      )}
    </div>
  );
}

export default function LineupReviews({
  reviews,
  knightLineupId = null,
  knightName = "",
  knightImage = "",
}: {
  reviews: Review[];
  knightLineupId?: number | null;
  knightName?: string;
  knightImage?: string;
}) {
  const [page, setPage] = useState(1);

  if (reviews.length === 0) {
    return (
      <div className="rounded-3xl border border-white/8 bg-white/3 px-6 py-10 text-center text-sm text-zinc-500">
        아직 이 기사의 후기가 없습니다.
      </div>
    );
  }

  const totalPages = Math.ceil(reviews.length / PER_PAGE);
  const currentPage = Math.min(page, totalPages);
  const slice = reviews.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE,
  );

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
              <p className="mt-1.5 text-xs text-zinc-500">
                {formatDate(review.createdAt)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-7 whitespace-pre-wrap text-zinc-300">
            {review.content}
          </p>
          <ReplyBlock
            review={review}
            knightLineupId={knightLineupId}
            knightName={knightName}
            knightImage={knightImage}
          />
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
