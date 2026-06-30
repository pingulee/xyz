"use client";

import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Loader2,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from "lucide-react";
import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type TierRecord = {
  tier: string;
  wins: number;
  losses: number;
};

type ReviewReply = {
  id: string;
  lineupId: string;
  knightName: string;
  content: string;
  tierRecords: TierRecord[];
  createdAt: string;
};

type Review = {
  id: string;
  name: string;
  service: string;
  lineupId?: string;
  lineupName?: string;
  rating: number;
  content: string;
  createdAt: string;
  reply?: ReviewReply;
};

type ReviewsResponse = {
  reviews: Review[];
  message?: string;
};

type CreateReviewResponse = {
  review: Review;
  message?: string;
};

type DeleteForm = {
  password: string;
};

type EditForm = {
  password: string;
  service: string;
  rating: number;
  content: string;
  createdAt: string;
};

const REVIEWS_PER_PAGE = 10;

const blankForm = {
  name: "",
  password: "",
  service: "롤 대리",
  lineupId: "",
  lineupName: "",
  rating: 5,
  content: "",
};

const blankDeleteForm = {
  password: "",
};

const blankEditForm = {
  password: "",
  service: "롤 대리",
  rating: 5,
  content: "",
  createdAt: "",
};

function getPageItems(currentPage: number, totalPages: number) {
  const items: Array<number | "..."> = [];

  for (let page = 1; page <= totalPages; page += 1) {
    const visible =
      page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;

    if (visible) {
      items.push(page);
    } else if (items[items.length - 1] !== "...") {
      items.push("...");
    }
  }

  return items;
}

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
      {Array.from({ length: rating }).map((_, i) => (
        <Star key={i} size={16} fill="currentColor" />
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
            size={28}
            fill={(hovered || value) >= star ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        </button>
      ))}
      <span className="ml-2 self-center text-sm font-black text-zinc-400">
        {hovered || value}점
      </span>
    </div>
  );
}

const SERVICE_LABEL: Record<string, string> = {
  대리: "롤 대리",
  듀오: "롤 듀오",
};

export default function ReviewBoard({
  initialReviews = [],
  isAdmin = false,
  lineups = [],
  knightLineupId = null,
}: {
  initialReviews?: Review[];
  isAdmin?: boolean;
  lineups?: Array<{ id: string; name: string; services: string[] }>;
  knightLineupId?: number | null;
}) {
  const knightName = knightLineupId
    ? (lineups.find((l) => l.id === String(knightLineupId))?.name ?? "")
    : "";
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
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
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(initialReviews.length === 0);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [replyingId, setReplyingId] = useState("");
  const [deletingReplyId, setDeletingReplyId] = useState("");
  const mousedownOnOverlay = useRef(false);

  const totalPages = Math.max(1, Math.ceil(reviews.length / REVIEWS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const selectedReview = reviews.find(
    (review) => review.id === selectedReviewId,
  );
  const selectedReviewIndex = reviews.findIndex(
    (review) => review.id === selectedReviewId,
  );
  const previousReview =
    selectedReviewIndex > 0 ? reviews[selectedReviewIndex - 1] : undefined;
  const nextReview =
    selectedReviewIndex >= 0 && selectedReviewIndex < reviews.length - 1
      ? reviews[selectedReviewIndex + 1]
      : undefined;
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * REVIEWS_PER_PAGE;
    return reviews.slice(start, start + REVIEWS_PER_PAGE);
  }, [currentPage, reviews]);
  const pageItems = useMemo(
    () => getPageItems(currentPage, totalPages),
    [currentPage, totalPages],
  );

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

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const response = await fetch("/api/reviews", { cache: "no-store" });
        const data = (await response.json()) as ReviewsResponse;

        if (!response.ok) {
          throw new Error(data.message ?? "후기를 불러오지 못했습니다.");
        }

        setReviews(data.reviews);
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "후기를 불러오지 못했습니다.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadReviews();
  }, []);

  const goToPage = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
    setSelectedReviewId("");
    setDeleteOpenId("");
    setEditOpenId("");
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
      const response = await fetch("/api/reviews/verify-password", {
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

    const name = form.name.trim();
    const password = form.password.trim();
    const content = form.content.trim();

    if (!name || !password || !content) {
      setError("닉네임, 비밀번호, 후기를 모두 입력해주세요.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          password,
          service: form.service,
          lineupId: form.lineupId || undefined,
          lineupName: form.lineupId
            ? lineups.find((lineup) => lineup.id === form.lineupId)?.name
            : undefined,
          rating: form.rating,
          content,
        }),
      });
      const data = (await response.json()) as CreateReviewResponse;

      if (!response.ok) {
        throw new Error(data.message ?? "후기를 저장하지 못했습니다.");
      }

      setReviews((current) => [data.review, ...current]);
      setForm(blankForm);
      setPage(1);
      setSelectedReviewId(data.review.id);
      setWriteOpen(false);
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

      const response = await fetch("/api/reviews", {
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

      setReviews((current) =>
        current.filter((review) => review.id !== reviewId),
      );
      setSelectedReviewId("");
      setDeleteOpenId("");
      setDeleteForms((current) => {
        const next = { ...current };
        delete next[reviewId];
        return next;
      });
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

    setEditingId(review.id);

    try {
      const response = await fetch("/api/reviews", {
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

      setReviews((current) =>
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

  const submitReply = async (reviewId: string, content: string, tierRecords: TierRecord[]) => {
    setError("");
    setReplyingId(reviewId);
    try {
      const response = await fetch("/api/reviews/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, content, tierRecords }),
      });
      const data = (await response.json()) as { reply?: ReviewReply; message?: string };
      if (!response.ok) throw new Error(data.message ?? "답변을 저장하지 못했습니다.");
      setReviews((cur) =>
        cur.map((r) => (r.id === reviewId ? { ...r, reply: data.reply } : r)),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "답변을 저장하지 못했습니다.");
    } finally {
      setReplyingId("");
    }
  };

  const deleteReply = async (reviewId: string) => {
    setError("");
    setDeletingReplyId(reviewId);
    try {
      const response = await fetch("/api/reviews/reply", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(data.message ?? "답변을 삭제하지 못했습니다.");
      setReviews((cur) =>
        cur.map((r) => (r.id === reviewId ? { ...r, reply: undefined } : r)),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "답변을 삭제하지 못했습니다.");
    } finally {
      setDeletingReplyId("");
    }
  };

  const duplicateReview = async (review: Review) => {
    setError("");
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: review.name,
          password: "admin_duplicate",
          service: review.service,
          rating: review.rating,
          content: review.content,
        }),
      });
      const data = (await response.json()) as CreateReviewResponse;
      if (!response.ok) throw new Error(data.message ?? "복제하지 못했습니다.");
      setReviews((current) => [data.review, ...current]);
      setPage(1);
      setSelectedReviewId(data.review.id);
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
            if (e.target === e.currentTarget && mousedownOnOverlay.current)
              setWriteOpen(false);
          }}
        >
          <div className="w-full max-w-xl rounded-[34px] border border-gold/20 bg-[#111] p-6 shadow-2xl sm:p-8 max-h-[90dvh] overflow-y-auto sm:max-h-[95dvh]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">
                  write review
                </p>
                <h2 className="mt-3 text-2xl font-black text-white">
                  후기 작성
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setWriteOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-zinc-400 transition hover:border-gold/40 hover:text-white"
                aria-label="후기 작성 닫기"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitReview}>
              <div className="grid gap-4">
                <div className="grid gap-4">
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-zinc-300">
                      닉네임
                    </span>
                    <input
                      value={form.name}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          name: event.target.value,
                        }))
                      }
                      maxLength={20}
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50"
                      placeholder="예: 다이아 목표"
                    />
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
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50"
                      placeholder="후기 삭제 시 필요"
                    />
                  </label>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-zinc-300">
                      작업 기사
                    </span>
                    <select
                      value={form.lineupId}
                      onChange={(event) => {
                        const id = event.target.value;
                        const selected = lineups.find((l) => l.id === id);
                        const availableServices = selected
                          ? selected.services.map((s) => SERVICE_LABEL[s]).filter(Boolean)
                          : ["롤 대리", "롤 듀오"];
                        setForm((current) => ({
                          ...current,
                          lineupId: id,
                          service: availableServices.includes(current.service)
                            ? current.service
                            : (availableServices[0] ?? "롤 대리"),
                        }));
                      }}
                      className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-gold/50"
                    >
                      <option value="">기사 선택 안 함</option>
                      {lineups.map((lineup) => (
                        <option key={lineup.id} value={lineup.id}>
                          {lineup.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-bold text-zinc-300">
                      서비스
                    </span>
                    {(() => {
                      const selected = lineups.find((l) => l.id === form.lineupId);
                      const opts = selected
                        ? selected.services.map((s) => SERVICE_LABEL[s]).filter(Boolean)
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
                          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-gold/50"
                        >
                          {opts.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      );
                    })()}
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
                  <span className="text-sm font-bold text-zinc-300">후기</span>
                  <textarea
                    value={form.content}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        content: event.target.value,
                      }))
                    }
                    maxLength={400}
                    rows={4}
                    className="resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50"
                    placeholder="진행 과정, 상담, 만족했던 점을 남겨주세요."
                  />
                </label>

                {error && (
                  <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-gradient px-7 py-4 font-black text-black shadow-gold-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting && (
                    <Loader2 size={18} className="animate-spin" />
                  )}
                  후기 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">
              reviews
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              전체 후기 {reviews.length}개
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setWriteOpen(true)}
            className="cursor-pointer rounded-full bg-gold-gradient px-5 py-3 text-sm font-black text-black shadow-gold-sm transition"
          >
            후기 작성
          </button>
        </div>

        {loading ? (
          <div className="flex min-h-60 items-center justify-center rounded-[30px] border border-gold/15 bg-white/[.035] text-zinc-400">
            <Loader2 size={22} className="mr-2 animate-spin text-gold" />
            후기를 불러오는 중
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-[30px] border border-gold/15 bg-white/[.035] p-8 text-center text-zinc-400">
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
            knightLineupId={knightLineupId}
            knightName={knightName}
            replying={replyingId === selectedReview.id}
            deletingReply={deletingReplyId === selectedReview.id}
            onSubmitReply={(content, tierRecords) => void submitReply(selectedReview.id, content, tierRecords)}
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
              setSelectedReviewId(reviewId);
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
            <div className="overflow-hidden rounded-[30px] border border-gold/15 bg-white/[.035]">
              {paginatedReviews.map((review, i) => (
                <button
                  key={review.id}
                  type="button"
                  onClick={() => setSelectedReviewId(review.id)}
                  className="grid w-full grid-cols-[1fr_auto] gap-4 border-b border-white/8 p-4 text-left transition last:border-b-0 hover:bg-white/4 sm:grid-cols-[4rem_1fr_auto]"
                >
                  <span className="hidden text-center text-sm font-black text-zinc-500 sm:block">
                    {(currentPage - 1) * REVIEWS_PER_PAGE + i + 1}
                  </span>

                  <span className="col-span-1 grid gap-2">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-black text-white">
                        {review.name}
                      </span>
                      <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-black text-gold">
                        {review.service}
                      </span>
                    </span>

                    <span className="line-clamp-1 text-sm leading-6 text-zinc-400">
                      {review.content}
                    </span>

                    <span className="flex items-center gap-3">
                      <Stars rating={review.rating} />
                      <time
                        className="text-xs font-bold text-zinc-500"
                        dateTime={review.createdAt}
                      >
                        {formatDate(review.createdAt)}
                      </time>
                    </span>
                  </span>

                </button>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:border-gold/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  이전
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
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:border-gold/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  다음
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const TIER_OPTIONS_RB = [
  "아이언", "브론즈", "실버", "골드", "플래티넘",
  "에메랄드", "다이아몬드", "마스터", "그랜드마스터", "챌린저",
];

const inputClsRB =
  "rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50";

function TierRecordEditorRB({
  records,
  onChange,
}: {
  records: TierRecord[];
  onChange: (r: TierRecord[]) => void;
}) {
  const add = () => onChange([...records, { tier: "골드", wins: 0, losses: 0 }]);
  const remove = (i: number) => onChange(records.filter((_, idx) => idx !== i));
  const update = (i: number, field: keyof TierRecord, val: string | number) =>
    onChange(records.map((r, idx) => idx === i ? { ...r, [field]: val } : r));

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-zinc-400">작업 기록</span>
        <button type="button" onClick={add}
          className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-zinc-400 transition hover:border-gold/40 hover:text-white">
          <Plus size={11} /> 추가
        </button>
      </div>
      {records.map((r, i) => (
        <div key={i} className="flex items-center gap-2">
          <select value={r.tier} onChange={(e) => update(i, "tier", e.target.value)}
            className={`${inputClsRB} flex-1`}>
            {TIER_OPTIONS_RB.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="number" min={0} max={999} value={r.wins}
            onChange={(e) => update(i, "wins", Math.max(0, Number(e.target.value) || 0))}
            className={`${inputClsRB} w-14 text-center`} placeholder="승" />
          <span className="text-xs text-zinc-500 shrink-0">승</span>
          <input type="number" min={0} max={999} value={r.losses}
            onChange={(e) => update(i, "losses", Math.max(0, Number(e.target.value) || 0))}
            className={`${inputClsRB} w-14 text-center`} placeholder="패" />
          <span className="text-xs text-zinc-500 shrink-0">패</span>
          <button type="button" onClick={() => remove(i)}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 text-zinc-500 transition hover:border-red-400/40 hover:text-red-300">
            <Trash2 size={11} />
          </button>
        </div>
      ))}
    </div>
  );
}

function ReplySection({
  review,
  knightLineupId,
  knightName,
  replying,
  deletingReply,
  onSubmitReply,
  onDeleteReply,
}: {
  review: Review;
  knightLineupId: number | null;
  knightName: string;
  replying: boolean;
  deletingReply: boolean;
  onSubmitReply: (content: string, tierRecords: TierRecord[]) => void;
  onDeleteReply: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(review.reply?.content ?? "");
  const [tierRecords, setTierRecords] = useState<TierRecord[]>(review.reply?.tierRecords ?? []);
  const canReply = knightLineupId !== null && review.lineupId === String(knightLineupId);

  if (!review.reply && !canReply) return null;

  const startEdit = () => {
    setDraft(review.reply?.content ?? "");
    setTierRecords(review.reply?.tierRecords ?? []);
    setEditing(true);
  };

  return (
    <div className="mt-4 rounded-3xl border border-gold/15 bg-white/3 p-4">
      <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-gold">기사 답변</p>
      {review.reply && !editing ? (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black text-gold">{review.reply.knightName}</span>
            <span className="text-xs text-zinc-600">기사</span>
          </div>
          {review.reply.tierRecords.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {review.reply.tierRecords.map((r, i) => (
                <span key={i} className="rounded-full border border-gold/20 bg-gold/8 px-2.5 py-0.5 text-xs font-black text-gold">
                  {r.tier} {r.wins}승 {r.losses}패
                </span>
              ))}
            </div>
          )}
          <p className="text-sm leading-7 whitespace-pre-wrap text-zinc-300">{review.reply.content}</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-xs text-zinc-600">{formatDate(review.reply.createdAt)}</span>
            {canReply && (
              <div className="flex gap-2">
                <button type="button" onClick={startEdit}
                  className="text-xs font-bold text-zinc-500 transition hover:text-zinc-200">수정</button>
                <button type="button" onClick={onDeleteReply} disabled={deletingReply}
                  className="inline-flex items-center gap-1 text-xs font-bold text-zinc-500 transition hover:text-red-300 disabled:opacity-50">
                  {deletingReply && <Loader2 size={10} className="animate-spin" />}삭제
                </button>
              </div>
            )}
          </div>
        </div>
      ) : canReply ? (
        <div className="grid gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-gold">{knightName}</span>
            <span className="text-xs text-zinc-600">기사 (닉네임 자동)</span>
          </div>
          <TierRecordEditorRB records={tierRecords} onChange={setTierRecords} />
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)}
            rows={3} maxLength={500} placeholder="고객에게 답변을 남겨주세요."
            className="resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50 w-full" />
          <div className="flex justify-end gap-2">
            {editing && (
              <button type="button" onClick={() => setEditing(false)}
                className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-400 transition hover:border-gold/40 hover:text-white">취소</button>
            )}
            <button type="button"
              onClick={() => { if (draft.trim()) onSubmitReply(draft.trim(), tierRecords); }}
              disabled={replying || !draft.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-5 py-2.5 text-sm font-black text-black transition disabled:cursor-not-allowed disabled:opacity-60">
              {replying && <Loader2 size={14} className="animate-spin" />}
              {editing ? "수정 저장" : "답변 등록"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ReviewDetail({
  deleteForm,
  deleteOpen,
  deleting,
  editForm,
  editOpen,
  editVerified,
  editing,
  error,
  isAdmin,
  knightLineupId,
  knightName,
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
  knightLineupId: number | null;
  knightName: string;
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
    <article className="overflow-hidden rounded-[30px] border border-gold/15 bg-white/[.035]">
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
          <div className="mt-6 rounded-3xl border border-gold/20 bg-white/[.035] p-4">
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
                    maxLength={400}
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
              <time dateTime={review.createdAt}>
                {formatDate(review.createdAt)}
              </time>
            </div>
          </>
        )}

        {!editOpen && (
          <ReplySection
            review={review}
            knightLineupId={knightLineupId}
            knightName={knightName}
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

function ReviewNavButton({
  label,
  onClick,
  review,
}: {
  label: string;
  onClick?: () => void;
  review?: Review;
}) {
  if (!review) {
    return (
      <div className="rounded-3xl border border-white/8 bg-black/20 p-4 opacity-45">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
          {label}
        </p>
        <p className="mt-2 text-sm font-bold text-zinc-500">
          이동할 글이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="grid gap-2 rounded-3xl border border-white/10 bg-white/[.035] p-4 text-left transition hover:border-gold/35 hover:bg-white/5.5"
    >
      <span className="text-xs font-black uppercase tracking-[0.2em] text-gold">
        {label}
      </span>
      <span className="flex flex-wrap items-center gap-2">
        <span className="font-black text-white">{review.name}</span>
        <span className="rounded-full bg-gold/10 px-2.5 py-1 text-[11px] font-black text-gold">
          {review.service}
        </span>
      </span>
      <span className="line-clamp-2 text-sm leading-6 text-zinc-400">
        {review.content}
      </span>
    </button>
  );
}
