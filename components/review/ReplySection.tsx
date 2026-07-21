"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import KnightAvatar, {
  type KnightAvailability,
} from "@/components/lineup/KnightAvatar";
import {
  TierRecordBadges,
  TierRecordEditor,
  isTierRecordsComplete,
  normalizeTierRecords,
} from "@/components/lineup/TierRecords";
import type { TierRecord } from "@/lib/reviews";
import { REPLY_CONTENT_MIN_LENGTH } from "@/components/review/constants";
import { formatDate } from "@/components/review/helpers";
import type { Review } from "@/components/review/types";

export default function ReplySection({
  review,
  knightLineupId,
  knightName,
  knightImage,
  knightAvailability,
  replying,
  deletingReply,
  onSubmitReply,
  onDeleteReply,
}: {
  review: Review;
  knightLineupId: number | null;
  knightName: string;
  knightImage: string;
  knightAvailability?: KnightAvailability | null;
  replying: boolean;
  deletingReply: boolean;
  onSubmitReply: (content: string, tierRecords: TierRecord[]) => void;
  onDeleteReply: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState(review.reply?.content ?? "");
  const [tierRecords, setTierRecords] = useState<TierRecord[]>(
    normalizeTierRecords(review.reply?.tierRecords ?? []),
  );
  const draftLength = draft.trim().length;
  const invalidDraft =
    draftLength > 0 && draftLength < REPLY_CONTENT_MIN_LENGTH;
  const recordsComplete = isTierRecordsComplete(tierRecords);
  const canReply =
    knightLineupId !== null && review.lineupId === String(knightLineupId);

  const replyFormVisible = canReply && (formOpen || editing || !review.reply);

  const startEdit = () => {
    setDraft(review.reply?.content ?? "");
    setTierRecords(normalizeTierRecords(review.reply?.tierRecords ?? []));
    setEditing(true);
  };

  return (
    <div className="relative mt-6 overflow-hidden rounded-3xl border border-gold/20 bg-zinc-950 p-5">
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
            name={review.reply?.knightName ?? knightName}
            size={44}
          />
          <div>
            <p className="text-base font-black text-white">
              {review.reply?.knightName ?? knightName}
            </p>
          </div>
        </div>
        {review.reply && (
          <span className="rounded-full border border-gold/20 bg-black/20 px-3 py-1 text-xs font-black text-gold">
            답변 완료
          </span>
        )}
      </div>

      {/* 답변 존재 + 보기 모드 */}
      {review.reply && !editing && (
        <div className="relative">
          <TierRecordBadges
            records={review.reply.tierRecords}
            className="mb-4 grid gap-2"
          />
          <p className="text-sm leading-7 whitespace-pre-wrap text-zinc-300">
            {review.reply.content}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-xs text-zinc-600">
              {formatDate(review.reply.createdAt)}
            </span>
            {canReply && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={startEdit}
                  className="text-xs font-bold text-zinc-500 transition hover:text-zinc-200"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={onDeleteReply}
                  disabled={deletingReply}
                  className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 transition hover:text-red-300 disabled:opacity-50"
                >
                  {deletingReply && (
                    <Loader2 size={10} className="animate-spin" />
                  )}
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 폼 (신규 or 수정) */}
      {replyFormVisible && (
        <div className="relative grid gap-3">
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
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="고객에게 답변을 남겨주세요."
            className={`resize-none rounded-2xl border bg-black/30 px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50 w-full ${
              invalidDraft ? "border-red-400/50" : "border-white/10"
            }`}
          />
          {invalidDraft && (
            <p className="text-xs font-bold text-red-300">
              답변은 10자 이상 입력해주세요.
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setFormOpen(false);
              }}
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-400 transition hover:border-gold/40 hover:text-white"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => {
                if (draftLength >= REPLY_CONTENT_MIN_LENGTH && recordsComplete)
                  onSubmitReply(draft.trim(), tierRecords);
              }}
              disabled={
                replying ||
                draftLength < REPLY_CONTENT_MIN_LENGTH ||
                !recordsComplete
              }
              className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-5 py-2.5 text-sm font-black text-black transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {replying && <Loader2 size={14} className="animate-spin" />}
              {editing ? "수정 저장" : "답변 등록"}
            </button>
          </div>
        </div>
      )}

      {/* 답변 없고 폼 안 열린 상태 → 대기 안내 */}
      {!review.reply && !replyFormVisible && !editing && (
        <p className="relative text-xs font-bold text-zinc-500">
          기사 답변 대기 중
        </p>
      )}
    </div>
  );
}
