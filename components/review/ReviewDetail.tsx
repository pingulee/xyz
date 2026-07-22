"use client";

import { Copy, Loader2, Pencil, Trash2 } from "lucide-react";
import { type BoosterAvailability } from "@/components/lineup/BoosterAvatar";
import type { TierRecord } from "@/lib/reviews";
import { REVIEW_CONTENT_MAX_LENGTH } from "@/components/review/constants";
import { formatDate } from "@/components/review/helpers";
import type { DeleteForm, EditForm, Review } from "@/components/review/types";
import Stars from "@/components/review/Stars";
import StarRating from "@/components/review/StarRating";
import ReplySection from "@/components/review/ReplySection";
import ReviewNavButton from "@/components/review/ReviewNavButton";

export default function ReviewDetail({
  deleteForm,
  deleteOpen,
  deleting,
  editForm,
  editOpen,
  editVerified,
  editing,
  error,
  isAdmin,
  boosterLineupId,
  boosterName,
  boosterImage,
  boosterAvailability,
  replying,
  deletingReply,
  onSubmitReply,
  onDeleteReply,
  nextReview,
  onDelete,
  onDeleteFormChange,
  onDeleteOpenChange,
  onEdit,
  onEditFormChange,
  onEditOpenChange,
  onVerifyPassword,
  onDuplicate,
  onBackToList,
  onSelectReview,
  previousReview,
  review,
}: {
  deleteForm: DeleteForm;
  deleteOpen: boolean;
  deleting: boolean;
  editForm: EditForm;
  editOpen: boolean;
  editVerified: boolean;
  editing: boolean;
  error?: string;
  isAdmin: boolean;
  boosterLineupId: number | null;
  boosterName: string;
  boosterImage: string;
  boosterAvailability?: BoosterAvailability | null;
  replying: boolean;
  deletingReply: boolean;
  onSubmitReply: (content: string, tierRecords: TierRecord[]) => void;
  onDeleteReply: () => void;
  nextReview?: Review;
  onDelete: () => void;
  onDeleteFormChange: (updates: Partial<DeleteForm>) => void;
  onDeleteOpenChange: () => void;
  onEdit: () => void;
  onEditFormChange: (updates: Partial<EditForm>) => void;
  onEditOpenChange: () => void;
  onVerifyPassword: () => void;
  onDuplicate?: () => void;
  onBackToList: () => void;
  onSelectReview: (reviewId: string) => void;
  previousReview?: Review;
  review: Review;
}) {
  return (
    <article className="overflow-hidden rounded-[30px] border border-gold/15 bg-white/3.5">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Stars rating={review.rating} />
            <h3 className="mt-3 text-2xl font-black text-white">
              {review.name}
            </h3>
          </div>

          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            {onDuplicate && (
              <button
                type="button"
                onClick={onDuplicate}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-400 transition hover:border-gold/40 hover:text-white"
              >
                <Copy size={16} />
                복제
              </button>
            )}
            <button
              type="button"
              onClick={onEditOpenChange}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-400 transition hover:border-gold/40 hover:text-white"
            >
              <Pencil size={16} />
              편집
            </button>
            <button
              type="button"
              onClick={onDeleteOpenChange}
              disabled={deleting}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-400 transition hover:border-red-400/40 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
              삭제
            </button>
          </div>
        </div>

        {editOpen ? (
          <div className="mt-6 rounded-3xl border border-gold/20 bg-white/3.5 p-4">
            {!isAdmin && !editVerified ? (
              <div className="grid gap-3">
                <p className="text-sm font-bold text-zinc-300">
                  작성 시 입력한 비밀번호를 확인해주세요.
                </p>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input
                    type="password"
                    value={editForm.password}
                    onChange={(event) =>
                      onEditFormChange({ password: event.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        onVerifyPassword();
                      }
                    }}
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50"
                    placeholder="비밀번호"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={onVerifyPassword}
                    disabled={editing}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gold-gradient px-5 py-3 font-black text-black transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {editing && <Loader2 size={17} className="animate-spin" />}
                    확인
                  </button>
                </div>
              </div>
            ) : (
              <>
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-zinc-300">
                    서비스
                  </span>
                  <select
                    value={editForm.service}
                    onChange={(event) =>
                      onEditFormChange({ service: event.target.value })
                    }
                    className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-gold/50"
                  >
                    <option>롤 대리</option>
                    <option>롤 듀오</option>
                    <option>롤 계정</option>
                  </select>
                </label>
                <div className="grid gap-2">
                  <span className="text-sm font-bold text-zinc-300">평점</span>
                  <StarRating
                    value={editForm.rating}
                    onChange={(rating) => onEditFormChange({ rating })}
                  />
                </div>
                <label className="mt-4 grid gap-2">
                  <span className="text-sm font-bold text-zinc-300">후기</span>
                  <textarea
                    value={editForm.content}
                    onChange={(event) =>
                      onEditFormChange({ content: event.target.value })
                    }
                    maxLength={REVIEW_CONTENT_MAX_LENGTH}
                    rows={3}
                    className="resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50"
                  />
                </label>
                {isAdmin && (
                  <label className="mt-4 grid gap-2">
                    <span className="text-sm font-bold text-zinc-300">
                      날짜 수정
                    </span>
                    <input
                      type="datetime-local"
                      value={editForm.createdAt}
                      onChange={(event) =>
                        onEditFormChange({ createdAt: event.target.value })
                      }
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-gold/50"
                    />
                  </label>
                )}
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={onEdit}
                    disabled={editing}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gold-gradient px-5 py-3 font-black text-black transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {editing && <Loader2 size={17} className="animate-spin" />}
                    수정 저장
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <p className="mt-6 whitespace-pre-wrap leading-8 text-zinc-300">
              {review.content}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">
              <span className="rounded-full bg-gold/10 px-3 py-1 text-gold">
                {review.service}
              </span>
              <time dateTime={review.createdAt} className="whitespace-nowrap">
                {formatDate(review.createdAt)}
              </time>
            </div>
          </>
        )}

        {!editOpen && (
          <ReplySection
            review={review}
            boosterLineupId={boosterLineupId}
            boosterName={boosterName}
            boosterImage={boosterImage}
            boosterAvailability={boosterAvailability}
            replying={replying}
            deletingReply={deletingReply}
            onSubmitReply={onSubmitReply}
            onDeleteReply={onDeleteReply}
          />
        )}

        {!isAdmin && deleteOpen && (
          <div className="mt-6 rounded-3xl border border-red-400/20 bg-red-500/8 p-4">
            <p className="text-sm font-bold text-zinc-300">
              작성 시 입력한 비밀번호를 입력하면 삭제됩니다.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                type="password"
                value={deleteForm.password}
                onChange={(event) =>
                  onDeleteFormChange({ password: event.target.value })
                }
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-300/50"
                placeholder="삭제 비밀번호"
              />
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-400 px-5 py-3 font-black text-black transition hover:bg-red-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting && <Loader2 size={17} className="animate-spin" />}
                삭제
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
            {error}
          </p>
        )}

        {(previousReview || nextReview) && (
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <ReviewNavButton
              label="이전글"
              onClick={
                previousReview
                  ? () => onSelectReview(previousReview.id)
                  : undefined
              }
              review={previousReview}
            />
            <ReviewNavButton
              label="다음글"
              onClick={
                nextReview ? () => onSelectReview(nextReview.id) : undefined
              }
              review={nextReview}
            />
          </div>
        )}

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onBackToList}
            className="rounded-full border border-white/10 px-6 py-3 text-sm font-bold text-zinc-300 transition hover:border-gold/40 hover:text-white"
          >
            목록으로
          </button>
        </div>
      </div>
    </article>
  );
}
