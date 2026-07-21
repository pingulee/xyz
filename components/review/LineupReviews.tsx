"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Star,
} from "lucide-react";
import KnightAvatar, { type KnightAvailability } from "@/components/lineup/KnightAvatar";
import {
  TierRecordBadges,
  TierRecordEditor,
  isTierRecordsComplete,
  normalizeTierRecords,
} from "@/components/lineup/TierRecords";
import type { Review, ReviewReply, TierRecord } from "@/lib/reviews";

const PER_PAGE = 3;
const REPLY_CONTENT_MIN_LENGTH = 10;

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
    <div className="relative">
      <TierRecordBadges
        records={reply.tierRecords}
        className="mt-3 grid gap-2"
      />
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
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [tierRecords, setTierRecords] = useState<TierRecord[]>(
    normalizeTierRecords(initial?.tierRecords ?? []),
  );
  const contentLength = content.trim().length;
  const invalidContent =
    submitAttempted &&
    contentLength > 0 &&
    contentLength < REPLY_CONTENT_MIN_LENGTH;
  const recordsComplete = isTierRecordsComplete(tierRecords);

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-black text-gold">{knightName}</span>
      </div>
      <TierRecordEditor records={tierRecords} onChange={setTierRecords} />
      {!recordsComplete && (
        <p className="text-xs font-bold text-amber-300/80">
          작업 기록의 티어·챔피언·킬/데스/어시를 모두 입력해야 등록할 수 있습니다.
        </p>
      )}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        maxLength={500}
        placeholder="고객에게 답변을 남겨주세요."
        className={`resize-none rounded-2xl border bg-black/30 px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50 w-full ${
          invalidContent ? "border-red-400/50" : "border-white/10"
        }`}
      />
      {invalidContent && (
        <p className="text-xs font-bold text-red-300">
          답변은 10자 이상 입력해주세요.
        </p>
      )}
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
            setSubmitAttempted(true);
            if (contentLength >= REPLY_CONTENT_MIN_LENGTH && recordsComplete)
              onSubmit(content.trim(), tierRecords);
          }}
          disabled={
            saving ||
            contentLength < REPLY_CONTENT_MIN_LENGTH ||
            !recordsComplete
          }
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
  knightAvailability,
}: {
  review: Review;
  knightLineupId: number | null;
  knightName: string;
  knightImage: string;
  knightAvailability?: KnightAvailability | null;
}) {
  const [replyData, setReplyData] = useState(review.reply);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const canReply =
    knightLineupId !== null && review.lineupId === String(knightLineupId);

  const replyFormVisible = canReply && (formOpen || editing || !replyData);

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

  return (
    <div className="relative mt-4 overflow-hidden rounded-3xl border border-gold/20 bg-zinc-950 p-4 sm:p-5">
      {knightImage && (
        <Image
          src={knightImage}
          alt=""
          fill
          className="pointer-events-none object-cover opacity-20"
          sizes="(max-width: 768px) 100vw, 720px"
          unoptimized
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.88),rgba(0,0,0,0.62)_52%,rgba(0,0,0,0.30))]" />
      <div className="relative mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <KnightAvatar
            availability={knightAvailability}
            image={knightImage}
            name={replyData?.knightName ?? knightName}
            size={44}
          />
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
      {replyFormVisible && (
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

      {/* 답변 없고 폼 안 열린 상태 → 대기 안내 */}
      {!replyData && !replyFormVisible && !editing && (
        <p className="relative text-xs font-bold text-zinc-500">
          기사 답변 대기 중
        </p>
      )}
    </div>
  );
}

export default function LineupReviews({
  reviews,
  knightLineupId = null,
  knightName = "",
  knightImage = "",
  knightAvailability = null,
}: {
  reviews: Review[];
  knightLineupId?: number | null;
  knightName?: string;
  knightImage?: string;
  knightAvailability?: KnightAvailability | null;
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
          className="rounded-3xl border border-white/8 bg-white/3.5 p-5"
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
            knightAvailability={knightAvailability}
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
