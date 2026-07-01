"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Star, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import KnightAvatar, {
  type KnightAvailability,
} from "@/components/KnightAvatar";
import type {
  Review,
  ReviewNavItem,
  ReviewReply,
  TierRecord,
} from "@/lib/reviews";

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
const REVIEW_CONTENT_MAX_LENGTH = 100;

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
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

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="text-gold transition-transform hover:scale-110"
          aria-label={`${star}점`}
        >
          <Star
            size={26}
            fill={(hovered || value) >= star ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}

function PostNav({
  previousReview,
  nextReview,
}: {
  previousReview?: ReviewNavItem;
  nextReview?: ReviewNavItem;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-3">
      <NavLink label="이전글" review={previousReview} align="left" />
      <Link
        href="/reviews"
        className="grid min-h-11 place-items-center rounded-full border border-white/10 px-3 py-2 text-center text-sm font-black text-zinc-300 transition hover:border-gold/40 hover:text-white sm:px-6 sm:py-3"
      >
        목록
      </Link>
      <NavLink label="다음글" review={nextReview} align="right" />
    </div>
  );
}

function NavLink({
  label,
  review,
  align,
}: {
  label: string;
  review?: ReviewNavItem;
  align: "left" | "right";
}) {
  if (!review) {
    return (
      <div
        className={`grid min-h-11 place-items-center rounded-full border border-white/8 bg-black/15 px-3 py-2 opacity-50 sm:block sm:min-h-0 sm:rounded-3xl sm:p-4 ${align === "right" ? "sm:text-right" : ""}`}
      >
        <p className="text-xs font-black text-zinc-500">{label}</p>
        <p className="mt-1 hidden text-sm font-bold text-zinc-500 sm:block">
          이동할 글이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <Link
      href={`/reviews/${review.id}`}
      className={`grid min-h-11 place-items-center rounded-full border border-white/8 bg-white/[.035] px-3 py-2 transition hover:border-gold/30 hover:bg-white/[.055] sm:block sm:min-h-0 sm:rounded-3xl sm:p-4 ${align === "right" ? "sm:text-right" : ""}`}
    >
      <p className="text-xs font-black text-gold">{label}</p>
      <p className="mt-1 hidden text-sm font-black text-white sm:line-clamp-1">
        {review.name}
      </p>
      <p className="mt-1 hidden text-xs text-zinc-500 sm:line-clamp-1">
        {review.content}
      </p>
    </Link>
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
  knightAvailability,
  previousReview,
  nextReview,
}: {
  initialReview: Review;
  knightLineupId: number | null;
  knightName: string;
  knightImage: string;
  knightAvailability?: KnightAvailability | null;
  previousReview?: ReviewNavItem;
  nextReview?: ReviewNavItem;
}) {
  const router = useRouter();
  const [review, setReview] = useState(initialReview);
  const [reviewEditOpen, setReviewEditOpen] = useState(false);
  const [reviewDeleteOpen, setReviewDeleteOpen] = useState(false);
  const [reviewPassword, setReviewPassword] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [editService, setEditService] = useState(review.service);
  const [editRating, setEditRating] = useState(review.rating);
  const [editContent, setEditContent] = useState(review.content);
  const [editingReply, setEditingReply] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(review.reply?.content ?? "");
  const [tierRecords, setTierRecords] = useState<TierRecord[]>(
    review.reply?.tierRecords ?? [],
  );
  const viewTrackedRef = useRef(false);

  const canReply =
    knightLineupId !== null && review.lineupId === String(knightLineupId);
  const isLoggedIn = knightLineupId !== null;
  const displayKnightName =
    review.reply?.knightName || knightName || "기사 답변";
  const canModifyReview = !review.reply;

  useEffect(() => {
    if (viewTrackedRef.current) return;
    viewTrackedRef.current = true;

    const trackView = async () => {
      try {
        const response = await fetch("/api/reviews", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: initialReview.id }),
        });
        const data = (await response.json()) as {
          review?: Review;
        };
        if (response.ok && data.review) {
          setReview(data.review);
        }
      } catch {
        // View count failures should not block reading the review.
      }
    };

    void trackView();
  }, [initialReview.id]);

  const openReviewEdit = () => {
    setReviewError("");
    setReviewDeleteOpen(false);
    setEditService(review.service);
    setEditRating(review.rating);
    setEditContent(review.content);
    setReviewPassword("");
    setReviewEditOpen((current) => !current);
  };

  const updateReview = async () => {
    const password = reviewPassword.trim();
    const content = editContent.trim();
    if (!password || !content) {
      setReviewError("수정하려면 비밀번호와 후기 내용을 입력해주세요.");
      return;
    }
    setReviewSaving(true);
    setReviewError("");
    try {
      const response = await fetch("/api/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: review.id,
          password,
          service: editService,
          rating: editRating,
          content,
        }),
      });
      const data = (await response.json()) as {
        review?: Review;
        message?: string;
      };
      if (!response.ok || !data.review) {
        throw new Error(data.message ?? "후기를 수정하지 못했습니다.");
      }
      setReview(data.review);
      setReviewEditOpen(false);
      setReviewPassword("");
    } catch (caught) {
      setReviewError(
        caught instanceof Error
          ? caught.message
          : "후기를 수정하지 못했습니다.",
      );
    } finally {
      setReviewSaving(false);
    }
  };

  const deleteReview = async () => {
    const password = reviewPassword.trim();
    if (!password) {
      setReviewError("삭제하려면 비밀번호를 입력해주세요.");
      return;
    }
    setReviewSaving(true);
    setReviewError("");
    try {
      const response = await fetch("/api/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: review.id, password }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(data.message ?? "후기를 삭제하지 못했습니다.");
      }
      router.push("/reviews");
    } catch (caught) {
      setReviewError(
        caught instanceof Error
          ? caught.message
          : "후기를 삭제하지 못했습니다.",
      );
    } finally {
      setReviewSaving(false);
    }
  };

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
      <article className="overflow-hidden rounded-[18px] border border-white/10 bg-white/[.035]">
        <div className="border-b border-white/8 bg-black/25 px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold text-zinc-500">
                <span>{review.service}</span>
                <span>/</span>
                <span>
                  {review.lineupName ??
                    review.reply?.knightName ??
                    "기사 선택 안 함"}
                </span>
              </div>
              <h1 className="text-2xl font-black text-white">
                {review.name}님의 후기
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-bold text-zinc-500">
                <span>작성자 {review.name}</span>
                <time dateTime={review.createdAt} className="whitespace-nowrap">
                  {formatDate(review.createdAt)}
                </time>
                <span>조회 {review.viewCount}</span>
                <span className="flex items-center gap-2">
                  평점 <Stars rating={review.rating} />
                </span>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-black ${
                  review.reply
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                    : "border-white/10 bg-white/5 text-zinc-500"
                }`}
              >
                {review.reply ? "답변 완료" : "답변 대기"}
              </span>
              {canModifyReview && (
                <>
                  <button
                    type="button"
                    onClick={openReviewEdit}
                    className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-zinc-400 transition hover:border-gold/40 hover:text-white"
                  >
                    수정
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReviewError("");
                      setReviewEditOpen(false);
                      setReviewPassword("");
                      setReviewDeleteOpen((current) => !current);
                    }}
                    className="rounded-full border border-red-400/25 px-3 py-1 text-xs font-bold text-red-200 transition hover:bg-red-400/10"
                  >
                    삭제
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6">
          {reviewEditOpen && canModifyReview && (
            <div className="grid gap-4 rounded-3xl border border-gold/20 bg-black/20 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-zinc-300">
                    서비스
                  </span>
                  <select
                    value={editService}
                    onChange={(event) => setEditService(event.target.value)}
                    className={inputCls}
                  >
                    <option>롤 대리</option>
                    <option>롤 듀오</option>
                    <option>롤 계정</option>
                  </select>
                </label>
                <label className="grid gap-2">
                  <span className="text-sm font-bold text-zinc-300">
                    비밀번호
                  </span>
                  <input
                    type="password"
                    value={reviewPassword}
                    onChange={(event) => setReviewPassword(event.target.value)}
                    className={inputCls}
                    placeholder="작성 시 입력한 비밀번호"
                  />
                </label>
              </div>
              <div className="grid gap-2">
                <span className="text-sm font-bold text-zinc-300">평점</span>
                <StarRating value={editRating} onChange={setEditRating} />
              </div>
              <textarea
                value={editContent}
                onChange={(event) => setEditContent(event.target.value)}
                rows={5}
                maxLength={REVIEW_CONTENT_MAX_LENGTH}
                className="resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 leading-7 text-white outline-none transition focus:border-gold/50"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReviewEditOpen(false)}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-400 transition hover:border-gold/40 hover:text-white"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={updateReview}
                  disabled={reviewSaving}
                  className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-5 py-2.5 text-sm font-black text-black disabled:opacity-60"
                >
                  {reviewSaving && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  수정 저장
                </button>
              </div>
            </div>
          )}

          {reviewDeleteOpen && canModifyReview && (
            <div className="grid gap-3 rounded-3xl border border-red-400/20 bg-red-500/8 p-4">
              <p className="text-sm font-bold text-zinc-300">
                삭제하려면 작성 시 입력한 비밀번호를 입력해주세요.
              </p>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                  type="password"
                  value={reviewPassword}
                  onChange={(event) => setReviewPassword(event.target.value)}
                  className={inputCls}
                  placeholder="삭제 비밀번호"
                />
                <button
                  type="button"
                  onClick={deleteReview}
                  disabled={reviewSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-400 px-5 py-3 font-black text-black transition hover:bg-red-300 disabled:opacity-60"
                >
                  {reviewSaving && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  삭제
                </button>
              </div>
            </div>
          )}

          {reviewError && (
            <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
              {reviewError}
            </p>
          )}

          <div className="min-h-60 border-y border-white/8 py-8">
            <p className="whitespace-pre-wrap text-base leading-8 text-zinc-200">
              {review.content}
            </p>
          </div>
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
              <KnightAvatar
                availability={knightAvailability}
                image={knightImage}
                name={displayKnightName}
                size={56}
              />
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-gold">
                  knight reply
                </p>
                <h2 className="mt-1 text-xl font-black text-white">
                  {displayKnightName}
                </h2>
              </div>
            </div>

            {canReply && !formOpen && (
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
              <TierRecordEditor
                records={tierRecords}
                onChange={setTierRecords}
              />
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

          {!formOpen && !canReply && !review.reply && (
            <button
              type="button"
              onClick={openReplyForm}
              className="justify-self-start text-xs font-bold text-zinc-500 transition hover:text-gold"
            >
              {isLoggedIn
                ? "이 기사의 후기에만 답변 가능합니다"
                : "기사님만 답변 가능 - 로그인하기"}
            </button>
          )}
        </div>
      </section>

      <PostNav previousReview={previousReview} nextReview={nextReview} />
    </div>
  );
}
