"use client";

import { ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { TierRecord } from "@/lib/review";
import {
  REVIEW_PAGE_SIZE,
  REVIEW_NAME_MAX_LENGTH,
  REVIEW_PASSWORD_MIN_LENGTH,
  REVIEW_CONTENT_MIN_LENGTH,
  REVIEW_CONTENT_MAX_LENGTH,
  blankForm,
  blankDeleteForm,
  blankEditForm,
  SERVICE_LABEL,
} from "@/components/review/constants";
import { getPageItems, formatDate, PAGE_BLOCK } from "@/components/review/helpers";
import type {
  Review,
  ReviewReply,
  CreateReviewResponse,
  DeleteForm,
  EditForm,
} from "@/components/review/types";
import Stars from "@/components/review/Stars";
import StarRating from "@/components/review/StarRating";
import ReviewDetail from "@/components/review/ReviewDetail";

export default function ReviewBoard({
  initialReviewList = [],
  total = 0,
  serverPage = 1,
  isAdmin = false,
  boosterList = [],
  boosterId = null,
}: {
  initialReviewList?: Review[];
  total?: number;
  serverPage?: number;
  isAdmin?: boolean;
  boosterList?: Array<{
    id: string;
    name: string;
    services: string[];
    image?: string | null;
    active: boolean;
    weekdayHours: string;
    weekendHours: string;
  }>;
  boosterId?: number | null;
}) {
  const boosterName = boosterId
    ? (boosterList.find((l) => l.id === String(boosterId))?.name ?? "")
    : "";
  const [reviewList, setReviewList] = useState<Review[]>(initialReviewList);
  const [form, setForm] = useState(blankForm);
  const [deleteForms, setDeleteForms] = useState<Record<string, DeleteForm>>(
    {},
  );
  const [editForms, setEditForms] = useState<Record<string, EditForm>>({});
  const [deleteOpenId, setDeleteOpenId] = useState("");
  const [editOpenId, setEditOpenId] = useState("");
  const [editVerifiedIds, setEditVerifiedIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedReviewId, setSelectedReviewId] = useState("");
  const [writeOpen, setWriteOpen] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [error, setError] = useState("");
  const loading = false;
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [replyingId, setReplyingId] = useState("");
  const [deletingReplyId, setDeletingReplyId] = useState("");
  const mousedownOnOverlay = useRef(false);
  const router = useRouter();
  const boosterById = useMemo(
    () =>
      Object.fromEntries(
        boosterList.map((booster) => [booster.id, booster]),
      ) as Record<string, (typeof boosterList)[number]>,
    [boosterList],
  );

  const visibleReviewList = reviewList;
  const totalPages = Math.max(
    1,
    Math.ceil(Math.max(total, visibleReviewList.length) / REVIEW_PAGE_SIZE),
  );
  const currentPage = Math.min(serverPage, totalPages);
  const selectedReview = reviewList.find(
    (review) => review.id === selectedReviewId,
  );
  const selectedReviewIndex = visibleReviewList.findIndex(
    (review) => review.id === selectedReviewId,
  );
  const previousReview =
    selectedReviewIndex > 0
      ? visibleReviewList[selectedReviewIndex - 1]
      : undefined;
  const nextReview =
    selectedReviewIndex >= 0 && selectedReviewIndex < visibleReviewList.length - 1
      ? visibleReviewList[selectedReviewIndex + 1]
      : undefined;
  // 서버에서 현재 페이지 분량만 내려옴
  const paginatedReviewList = visibleReviewList;
  const pageItems = useMemo(
    () => getPageItems(currentPage, totalPages),
    [currentPage, totalPages],
  );
  const canSubmitReview = Boolean(
    form.name.trim() &&
      form.password.trim().length >= REVIEW_PASSWORD_MIN_LENGTH &&
      form.boosterId &&
      form.service &&
      form.content.trim().length >= REVIEW_CONTENT_MIN_LENGTH,
  );
  const missingReviewName = submitAttempted && !form.name.trim();
  const missingReviewPassword = submitAttempted && !form.password.trim();
  const invalidReviewPassword =
    form.password.trim().length > 0 &&
    form.password.trim().length < REVIEW_PASSWORD_MIN_LENGTH;
  const missingReviewBooster = submitAttempted && !form.boosterId;
  const missingService = submitAttempted && !form.service;
  const missingReviewContent = submitAttempted && !form.content.trim();
  const invalidReviewContent =
    form.content.trim().length > 0 &&
    form.content.trim().length < REVIEW_CONTENT_MIN_LENGTH;

  const openReview = (reviewId: string) => {
    router.push(`/review/${reviewId}`);
  };

  useEffect(() => {
    if (writeOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [writeOpen]);

  const goToPage = (nextPage: number) => {
    const target = Math.min(Math.max(nextPage, 1), totalPages);
    setSelectedReviewId("");
    setDeleteOpenId("");
    setEditOpenId("");
    router.push(target === 1 ? "/review" : `/review?page=${target}`);
  };

  const updateDeleteForm = (reviewId: string, updates: Partial<DeleteForm>) => {
    setDeleteForms((current) => ({
      ...current,
      [reviewId]: {
        ...(current[reviewId] ?? blankDeleteForm),
        ...updates,
      },
    }));
  };

  const updateEditForm = (reviewId: string, updates: Partial<EditForm>) => {
    setEditForms((current) => ({
      ...current,
      [reviewId]: {
        ...(current[reviewId] ?? blankEditForm),
        ...updates,
      },
    }));
  };

  const openEditForm = (review: Review) => {
    if (editOpenId === review.id) {
      setEditOpenId("");
      setEditVerifiedIds((s) => {
        const n = new Set(s);
        n.delete(review.id);
        return n;
      });
      return;
    }
    setDeleteOpenId("");
    setEditOpenId(review.id);
    setEditForms((current) => ({
      ...current,
      [review.id]: {
        password: "",
        service: review.service,
        rating: review.rating,
        content: review.content,
        createdAt: review.createdAt.slice(0, 16),
      },
    }));
    setEditVerifiedIds((s) => {
      const n = new Set(s);
      n.delete(review.id);
      return n;
    });
  };

  const verifyEditPassword = async (review: Review) => {
    const editForm = editForms[review.id] ?? blankEditForm;
    const password = editForm.password.trim();
    setError("");
    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    setEditingId(review.id);
    try {
      const response = await fetch("/api/review/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: review.id, password }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };
      if (!response.ok || !data.ok) {
        setError(data.message ?? "비밀번호가 일치하지 않습니다.");
        return;
      }
      setEditVerifiedIds((s) => new Set(s).add(review.id));
    } catch {
      setError("비밀번호 확인에 실패했습니다.");
    } finally {
      setEditingId("");
    }
  };

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitAttempted(true);

    const name = form.name.trim();
    const password = form.password.trim();
    const content = form.content.trim();

    if (!name || !password || !content) {
      setError("닉네임, 비밀번호, 후기를 모두 입력해주세요.");
      return;
    }

    if (!form.boosterId) {
      setError("작업 기사를 선택해주세요.");
      return;
    }

    if (!form.service) {
      setError("서비스를 선택해주세요.");
      return;
    }

    if (password.length < REVIEW_PASSWORD_MIN_LENGTH) {
      setError(`비밀번호는 ${REVIEW_PASSWORD_MIN_LENGTH}자 이상 입력해주세요.`);
      return;
    }

    if (name.length > REVIEW_NAME_MAX_LENGTH) {
      setError(`닉네임은 ${REVIEW_NAME_MAX_LENGTH}자 이하로 입력해주세요.`);
      return;
    }

    if (content.length < REVIEW_CONTENT_MIN_LENGTH) {
      setError(`후기는 ${REVIEW_CONTENT_MIN_LENGTH}자 이상 입력해주세요.`);
      return;
    }

    if (content.length > REVIEW_CONTENT_MAX_LENGTH) {
      setError(`후기는 ${REVIEW_CONTENT_MAX_LENGTH}자 이하로 입력해주세요.`);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          password,
          service: form.service,
          boosterId: form.boosterId || undefined,
          rating: form.rating,
          content,
        }),
      });
      const data = (await response.json()) as CreateReviewResponse;

      if (!response.ok) {
        throw new Error(data.message ?? "후기를 저장하지 못했습니다.");
      }

      setReviewList((current) => [data.review, ...current]);
      setForm(blankForm);
      setSubmitAttempted(false);
      setWriteOpen(false);
      router.push(`/review/${data.review.id}`);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "후기를 저장하지 못했습니다.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async (reviewId: string) => {
    setError("");
    setDeletingId(reviewId);

    try {
      const deleteForm = deleteForms[reviewId] ?? blankDeleteForm;
      const password = isAdmin ? "" : deleteForm.password.trim();

      if (!isAdmin && !password) {
        setError("삭제하려면 비밀번호를 입력해주세요.");
        setDeletingId("");
        return;
      }

      const response = await fetch("/api/review", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: reviewId,
          password,
        }),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "후기를 삭제하지 못했습니다.");
      }

      setReviewList((current) =>
        current.filter((review) => review.id !== reviewId),
      );
      setSelectedReviewId("");
      setDeleteOpenId("");
      setDeleteForms((current) => {
        const next = { ...current };
        delete next[reviewId];
        return next;
      });
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "후기를 삭제하지 못했습니다.",
      );
    } finally {
      setDeletingId("");
    }
  };

  const editReview = async (review: Review) => {
    const editForm = editForms[review.id] ?? blankEditForm;
    const password = isAdmin ? "" : editForm.password.trim();
    const content = editForm.content.trim();

    setError("");

    if (!isAdmin && !password) {
      setError("수정하려면 비밀번호와 후기 내용을 입력해주세요.");
      return;
    }

    if (!content) {
      setError("후기 내용을 입력해주세요.");
      return;
    }

    if (content.length > REVIEW_CONTENT_MAX_LENGTH) {
      setError(`후기는 ${REVIEW_CONTENT_MAX_LENGTH}자 이하로 입력해주세요.`);
      return;
    }

    setEditingId(review.id);

    try {
      const response = await fetch("/api/review", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: review.id,
          password,
          service: editForm.service,
          rating: editForm.rating,
          content,
          ...(isAdmin && editForm.createdAt
            ? { createdAt: editForm.createdAt }
            : {}),
        }),
      });
      const data = (await response.json()) as CreateReviewResponse;

      if (!response.ok) {
        throw new Error(data.message ?? "후기를 수정하지 못했습니다.");
      }

      setReviewList((current) =>
        current.map((item) => (item.id === review.id ? data.review : item)),
      );
      setEditOpenId("");
      setEditForms((current) => {
        const next = { ...current };
        delete next[review.id];
        return next;
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "후기를 수정하지 못했습니다.",
      );
    } finally {
      setEditingId("");
    }
  };

  const submitReply = async (
    reviewId: string,
    content: string,
    tierRecords: TierRecord[],
  ) => {
    setError("");
    setReplyingId(reviewId);
    try {
      const response = await fetch("/api/review/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, content, tierRecords }),
      });
      const data = (await response.json()) as {
        reply?: ReviewReply;
        message?: string;
      };
      if (!response.ok)
        throw new Error(data.message ?? "답변을 저장하지 못했습니다.");
      setReviewList((cur) =>
        cur.map((r) => (r.id === reviewId ? { ...r, reply: data.reply } : r)),
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "답변을 저장하지 못했습니다.",
      );
    } finally {
      setReplyingId("");
    }
  };

  const deleteReply = async (reviewId: string) => {
    setError("");
    setDeletingReplyId(reviewId);
    try {
      const response = await fetch("/api/review/reply", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok)
        throw new Error(data.message ?? "답변을 삭제하지 못했습니다.");
      setReviewList((cur) =>
        cur.map((r) => (r.id === reviewId ? { ...r, reply: undefined } : r)),
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "답변을 삭제하지 못했습니다.",
      );
    } finally {
      setDeletingReplyId("");
    }
  };

  const duplicateReview = async (review: Review) => {
    setError("");
    try {
      if (!review.boosterId) {
        throw new Error("작업 기사 정보가 없어 복제할 수 없습니다.");
      }
      const response = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: review.name,
          password: "admin_duplicate",
          service: review.service,
          boosterId: review.boosterId,
          rating: review.rating,
          content: review.content,
        }),
      });
      const data = (await response.json()) as CreateReviewResponse;
      if (!response.ok) throw new Error(data.message ?? "복제하지 못했습니다.");
      setReviewList((current) => [data.review, ...current]);
      router.push(`/review/${data.review.id}`);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "복제하지 못했습니다.",
      );
    }
  };

  return (
    <div className="grid gap-8">
      {writeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            mousedownOnOverlay.current = e.target === e.currentTarget;
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && mousedownOnOverlay.current) {
              setSubmitAttempted(false);
              setWriteOpen(false);
            }
          }}
        >
          <div className="w-full max-w-xl rounded-[34px] border border-gold/20 bg-[#111] p-6 shadow-2xl sm:p-8 max-h-[90dvh] overflow-y-auto sm:max-h-[95dvh]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">
                  work review
                </p>
                <h2 className="mt-3 text-2xl font-black text-white">
                  후기 등록
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSubmitAttempted(false);
                  setWriteOpen(false);
                }}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-zinc-400 transition hover:border-gold/40 hover:text-white"
                aria-label="후기 등록 닫기"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitReview}>
              <div className="grid gap-4">
                <div className="grid gap-4">
                  <label className="grid gap-2">
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-zinc-300">
                        닉네임
                      </span>
                      <span className="text-xs font-bold text-zinc-600">
                        {form.name.length}/{REVIEW_NAME_MAX_LENGTH}
                      </span>
                    </span>
                    <input
                      value={form.name}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      maxLength={REVIEW_NAME_MAX_LENGTH}
                      className={`rounded-2xl border bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50 ${
                        missingReviewName ? "border-red-400/50" : "border-white/10"
                      }`}
                      placeholder="예: 다이아 목표"
                    />
                    {missingReviewName && (
                      <p className="text-xs font-bold text-red-300">
                        닉네임을 입력해주세요.
                      </p>
                    )}
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-zinc-300">
                      비밀번호
                    </span>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          password: event.target.value,
                        }))
                      }
                      maxLength={40}
                      className={`rounded-2xl border bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50 ${
                        missingReviewPassword || invalidReviewPassword
                          ? "border-red-400/50"
                          : "border-white/10"
                      }`}
                      placeholder="후기 삭제 시 필요"
                    />
                    {missingReviewPassword && (
                      <p className="text-xs font-bold text-red-300">
                        비밀번호를 입력해주세요.
                      </p>
                    )}
                    {invalidReviewPassword && (
                      <p className="text-xs font-bold text-red-300">
                        비밀번호는 {REVIEW_PASSWORD_MIN_LENGTH}자 이상 입력해주세요.
                      </p>
                    )}
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-zinc-300">
                      작업 기사
                    </span>
                    <select
                      value={form.boosterId}
                      onChange={(event) => {
                        const id = event.target.value;
                        const selected = boosterList.find((l) => l.id === id);
                        const availableServices = selected
                          ? selected.services
                              .map((s) => SERVICE_LABEL[s])
                              .filter(Boolean)
                          : ["롤 대리", "롤 듀오"];
                        setForm((current) => ({
                          ...current,
                          boosterId: id,
                          service: availableServices.includes(current.service)
                            ? current.service
                            : "",
                        }));
                      }}
                      className={`rounded-2xl border bg-black/30 px-4 py-3 text-white outline-none transition focus:border-gold/50 ${
                        missingReviewBooster
                          ? "border-red-400/50"
                          : "border-white/10"
                      }`}
                      required
                    >
                      <option value="" disabled>
                        선택해주세요
                      </option>
                      {boosterList.map((booster) => (
                        <option key={booster.id} value={booster.id}>
                          {booster.name}
                        </option>
                      ))}
                    </select>
                    {missingReviewBooster && (
                      <p className="text-xs font-bold text-red-300">
                        작업 기사를 선택해주세요.
                      </p>
                    )}
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-zinc-300">
                      서비스
                    </span>
                    {(() => {
                      const selected = boosterList.find(
                        (l) => l.id === form.boosterId,
                      );
                      const opts = selected
                        ? selected.services
                            .map((s) => SERVICE_LABEL[s])
                            .filter(Boolean)
                        : ["롤 대리", "롤 듀오"];
                      return (
                        <select
                          value={form.service}
                          onChange={(event) =>
                            setForm((current) => ({
                              ...current,
                              service: event.target.value,
                            }))
                          }
                          className={`rounded-2xl border bg-black/30 px-4 py-3 text-white outline-none transition focus:border-gold/50 ${
                            missingService
                              ? "border-red-400/50"
                              : "border-white/10"
                          }`}
                        >
                          <option value="" disabled>
                            선택해주세요
                          </option>
                          {opts.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      );
                    })()}
                    {missingService && (
                      <p className="text-xs font-bold text-red-300">
                        서비스를 선택해주세요.
                      </p>
                    )}
                  </label>
                </div>

                <div className="grid gap-2">
                  <span className="text-sm font-bold text-zinc-300">평점</span>
                  <StarRating
                    value={form.rating}
                    onChange={(rating) =>
                      setForm((current) => ({ ...current, rating }))
                    }
                  />
                </div>

                <label className="grid gap-2">
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-zinc-300">
                      후기
                    </span>
                    <span className="text-xs font-bold text-zinc-600">
                      {form.content.length}/{REVIEW_CONTENT_MAX_LENGTH}
                    </span>
                  </span>
                  <textarea
                    value={form.content}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        content: event.target.value,
                      }))
                    }
                    maxLength={REVIEW_CONTENT_MAX_LENGTH}
                    rows={4}
                    className={`resize-none rounded-2xl border bg-black/30 px-4 py-3 leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50 ${
                      missingReviewContent || invalidReviewContent
                        ? "border-red-400/50"
                        : "border-white/10"
                    }`}
                    placeholder="진행 과정, 상담, 만족했던 점을 남겨주세요."
                  />
                  {missingReviewContent && (
                    <p className="text-xs font-bold text-red-300">
                      후기를 입력해주세요.
                    </p>
                  )}
                  {invalidReviewContent && (
                    <p className="text-xs font-bold text-red-300">
                      후기는 {REVIEW_CONTENT_MIN_LENGTH}자 이상 입력해주세요.
                    </p>
                  )}
                </label>

                {error && (
                  <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 font-black transition disabled:cursor-not-allowed ${
                    canSubmitReview
                      ? "bg-gold-gradient text-black hover:brightness-110 disabled:opacity-60"
                      : "border border-white/10 bg-zinc-700/45 text-zinc-400"
                  }`}
                >
                  {submitting && <Loader2 size={18} className="animate-spin" />}
                  후기 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl space-y-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">
            review
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            전체 후기 {visibleReviewList.length}개
          </h2>
        </div>

        {loading ? (
          <div className="flex min-h-60 items-center justify-center rounded-[30px] border border-gold/15 bg-white/3.5 text-zinc-400">
            <Loader2 size={22} className="mr-2 animate-spin text-gold" />
            후기를 불러오는 중
          </div>
        ) : reviewList.length === 0 ? (
          <div className="rounded-[30px] border border-gold/15 bg-white/3.5 p-8 text-center text-zinc-400">
            아직 등록된 후기가 없습니다.
          </div>
        ) : selectedReview ? (
          <ReviewDetail
            deleteForm={deleteForms[selectedReview.id] ?? blankDeleteForm}
            deleteOpen={deleteOpenId === selectedReview.id}
            deleting={deletingId === selectedReview.id}
            editForm={
              editForms[selectedReview.id] ?? {
                ...blankEditForm,
                service: selectedReview.service,
                rating: selectedReview.rating,
                content: selectedReview.content,
                createdAt: selectedReview.createdAt.slice(0, 16),
              }
            }
            editOpen={editOpenId === selectedReview.id}
            editVerified={editVerifiedIds.has(selectedReview.id)}
            editing={editingId === selectedReview.id}
            isAdmin={isAdmin}
            boosterId={boosterId}
            boosterName={boosterName}
            replying={replyingId === selectedReview.id}
            deletingReply={deletingReplyId === selectedReview.id}
            boosterAvailability={
              boosterById[
                selectedReview.reply?.boosterId ?? selectedReview.boosterId ?? ""
              ] ?? null
            }
            boosterImage={
              boosterById[
                selectedReview.reply?.boosterId ?? selectedReview.boosterId ?? ""
              ]?.image ?? ""
            }
            onSubmitReply={(content, tierRecords) =>
              void submitReply(selectedReview.id, content, tierRecords)
            }
            onDeleteReply={() => void deleteReply(selectedReview.id)}
            onDelete={() => void deleteReview(selectedReview.id)}
            onDeleteOpenChange={() => {
              if (isAdmin) {
                void deleteReview(selectedReview.id);
                return;
              }
              setEditOpenId("");
              setDeleteOpenId((current) =>
                current === selectedReview.id ? "" : selectedReview.id,
              );
            }}
            onDeleteFormChange={(updates) =>
              updateDeleteForm(selectedReview.id, updates)
            }
            onEdit={() => void editReview(selectedReview)}
            onEditFormChange={(updates) =>
              updateEditForm(selectedReview.id, updates)
            }
            onEditOpenChange={() => openEditForm(selectedReview)}
            onDuplicate={
              isAdmin ? () => void duplicateReview(selectedReview) : undefined
            }
            onVerifyPassword={() => void verifyEditPassword(selectedReview)}
            onBackToList={() => {
              setSelectedReviewId("");
              setDeleteOpenId("");
              setEditOpenId("");
            }}
            onSelectReview={(reviewId) => {
              openReview(reviewId);
              setDeleteOpenId("");
              setEditOpenId("");
            }}
            previousReview={previousReview}
            review={selectedReview}
            nextReview={nextReview}
            error={error}
          />
        ) : (
          <>
            <div className="overflow-hidden rounded-[30px] border border-gold/15 bg-white/3.5">
              <div className="hidden grid-cols-[3.25rem_minmax(0,1.45fr)_6rem_7rem_5.5rem_10rem_7rem_5rem] gap-4 border-b border-white/8 bg-black/20 px-5 py-3 text-xs font-black text-zinc-500 lg:grid">
                <span>번호</span>
                <span>내용</span>
                <span>작성자</span>
                <span>작업 기사</span>
                <span>평점</span>
                <span>작성일</span>
                <span>답변 상태</span>
                <span>조회수</span>
              </div>
              {paginatedReviewList.map((review, i) => {
                const reviewBoosterName =
                  review.boosterName ?? review.reply?.boosterName ?? "";
                // 전체 후기 수 기준 전역 번호: 최신 글 = 최대 번호, 가장 오래된 글 = 1
                const displayNumber =
                  Math.max(total, visibleReviewList.length) -
                  ((currentPage - 1) * REVIEW_PAGE_SIZE + i);

                return (
                  <button
                    key={review.id}
                    type="button"
                    onClick={() => openReview(review.id)}
                    className="group grid w-full cursor-pointer gap-4 border-b border-white/8 px-5 py-5 text-left transition last:border-b-0 hover:bg-white/5.5 lg:grid-cols-[3.25rem_minmax(0,1.45fr)_6rem_7rem_5.5rem_10rem_7rem_5rem] lg:items-center"
                  >
                    <span className="hidden text-sm font-black text-zinc-500 transition group-hover:text-gold lg:block">
                      {displayNumber}
                    </span>

                    <span className="grid min-w-0 gap-2">
                      <span className="flex items-start justify-between gap-3 lg:hidden">
                        <span className="shrink-0 text-sm font-black text-zinc-500">
                          {displayNumber}
                        </span>
                        <span className="whitespace-nowrap text-xs font-bold text-zinc-500">
                          {formatDate(review.createdAt)}
                        </span>
                      </span>

                      <span className="block truncate text-sm font-bold leading-6 text-white transition group-hover:text-gold">
                        {review.content}
                      </span>
                      <span className="truncate text-xs font-bold text-zinc-500 lg:hidden">
                        작성자 {review.name} · 작업 기사{" "}
                        {reviewBoosterName || "선택 안 함"}
                      </span>
                    </span>

                    <span className="hidden truncate text-sm font-black text-zinc-300 lg:block">
                      {review.name}
                    </span>

                    <span className="hidden truncate text-sm font-bold text-zinc-400 lg:block">
                      {reviewBoosterName || "선택 안 함"}
                    </span>

                    <span className="hidden lg:block">
                      <Stars rating={review.rating} />
                    </span>

                    <span className="hidden whitespace-nowrap text-xs font-bold leading-5 text-zinc-400 lg:block">
                      <time dateTime={review.createdAt}>
                        {formatDate(review.createdAt)}
                      </time>
                    </span>

                    <span className="flex flex-wrap items-center gap-3 lg:block">
                      <span className="lg:hidden">
                        <Stars rating={review.rating} />
                      </span>
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black ${
                          review.reply
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                            : "border-white/10 bg-white/5 text-zinc-500"
                        }`}
                      >
                        {review.reply ? "답변 완료" : "답변 대기"}
                      </span>
                    </span>

                    <span className="hidden text-sm font-black text-zinc-400 lg:block">
                      {review.viewCount ?? 0}
                    </span>

                    <span className="flex items-center justify-between gap-3 text-xs font-bold text-zinc-500 lg:hidden">
                      <span>조회수 {review.viewCount ?? 0}</span>
                      <span>작성자 {review.name}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - PAGE_BLOCK)}
                  disabled={Math.ceil(currentPage / PAGE_BLOCK) <= 1}
                  aria-label="이전 10페이지"
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-2 text-sm font-bold text-zinc-300 transition hover:border-gold/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>

                {pageItems.map((item, i) =>
                  item === "..." ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="px-2 text-sm font-black text-zinc-600"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={item}
                      type="button"
                      onClick={() => goToPage(item)}
                      className={`grid h-10 w-10 place-items-center rounded-full text-sm font-black transition ${
                        item === currentPage
                          ? "bg-gold text-black"
                          : "border border-white/10 text-zinc-300 hover:border-gold/40 hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  onClick={() => goToPage(currentPage + PAGE_BLOCK)}
                  disabled={
                    Math.ceil(currentPage / PAGE_BLOCK) >=
                    Math.ceil(totalPages / PAGE_BLOCK)
                  }
                  aria-label="다음 10페이지"
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-2 text-sm font-bold text-zinc-300 transition hover:border-gold/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}

        {!selectedReview && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setSubmitAttempted(false);
                setWriteOpen(true);
              }}
              className="cursor-pointer rounded-full bg-gold-gradient px-5 py-3 text-sm font-black text-black transition hover:brightness-110"
            >
              후기 등록
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
