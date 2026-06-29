"use client";

import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Pencil,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type Review = {
  id: string;
  name: string;
  service: string;
  rating: number;
  content: string;
  image?: string;
  createdAt: string;
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
};

const MAX_IMAGE_SIZE = 1024 * 1024 * 2;
const MAX_IMAGE_WIDTH = 1600;
const MAX_IMAGE_HEIGHT = 1600;
const REVIEWS_PER_PAGE = 10;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const blankForm = {
  name: "",
  password: "",
  service: "롤 대리",
  rating: 5,
  content: "",
  image: "",
};

const blankDeleteForm = {
  password: "",
};

const blankEditForm = {
  password: "",
  service: "롤 대리",
  rating: 5,
  content: "",
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

export default function ReviewBoard({
  initialReviews = [],
}: {
  initialReviews?: Review[];
}) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [form, setForm] = useState(blankForm);
  const [deleteForms, setDeleteForms] = useState<Record<string, DeleteForm>>(
    {},
  );
  const [editForms, setEditForms] = useState<Record<string, EditForm>>({});
  const [deleteOpenId, setDeleteOpenId] = useState("");
  const [editOpenId, setEditOpenId] = useState("");
  const [selectedReviewId, setSelectedReviewId] = useState("");
  const [page, setPage] = useState(1);
  const [imageName, setImageName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(initialReviews.length === 0);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [editingId, setEditingId] = useState("");

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

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError("");

    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("JPG, PNG, WEBP 이미지만 첨부할 수 있습니다.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("이미지는 2MB 이하만 첨부할 수 있습니다.");
      return;
    }

    const img = new window.Image();

    img.onload = () => {
      if (img.width > MAX_IMAGE_WIDTH || img.height > MAX_IMAGE_HEIGHT) {
        setError(
          `이미지는 ${MAX_IMAGE_WIDTH}×${MAX_IMAGE_HEIGHT}px 이하만 업로드 가능합니다.`,
        );
        URL.revokeObjectURL(img.src);
        return;
      }

      const reader = new FileReader();

      reader.onload = () => {
        setForm((current) => ({
          ...current,
          image: String(reader.result),
        }));
        setImageName(file.name);

        URL.revokeObjectURL(img.src);
      };

      reader.readAsDataURL(file);
    };

    img.onerror = () => {
      setError("이미지를 읽을 수 없습니다.");
      URL.revokeObjectURL(img.src);
    };

    img.src = URL.createObjectURL(file);
  };

  const removeImage = () => {
    setForm((current) => ({ ...current, image: "" }));
    setImageName("");
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
    setEditOpenId((current) => (current === review.id ? "" : review.id));
    setDeleteOpenId("");
    setEditForms((current) => ({
      ...current,
      [review.id]: current[review.id] ?? {
        password: "",
        service: review.service,
        rating: review.rating,
        content: review.content,
      },
    }));
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
          rating: form.rating,
          content,
          image: form.image || undefined,
        }),
      });
      const data = (await response.json()) as CreateReviewResponse;

      if (!response.ok) {
        throw new Error(data.message ?? "후기를 저장하지 못했습니다.");
      }

      setReviews((current) => [data.review, ...current]);
      setForm(blankForm);
      setImageName("");
      setPage(1);
      setSelectedReviewId(data.review.id);
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
    const deleteForm = deleteForms[reviewId] ?? blankDeleteForm;
    const password = deleteForm.password.trim();

    setError("");

    if (!password) {
      setError("삭제하려면 비밀번호를 입력해주세요.");
      return;
    }

    setDeletingId(reviewId);

    try {
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
    const password = editForm.password.trim();
    const content = editForm.content.trim();

    setError("");

    if (!password || !content) {
      setError("수정하려면 비밀번호와 후기 내용을 입력해주세요.");
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
          image: review.image,
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

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <form
        onSubmit={submitReview}
        className="card-premium rounded-[34px] p-6 sm:p-8"
      >
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">
            write review
          </p>
          <h2 className="mt-3 text-2xl font-black text-white">후기 작성</h2>
        </div>

        <div className="mt-7 grid gap-4">
          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-zinc-300">닉네임</span>
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
              <span className="text-sm font-bold text-zinc-300">비밀번호</span>
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

          <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <label className="grid gap-2">
              <span className="text-sm font-bold text-zinc-300">서비스</span>
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
                <option>롤 대리</option>
                <option>롤 듀오</option>
                <option>롤 계정</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-bold text-zinc-300">평점</span>
              <select
                value={form.rating}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    rating: Number(event.target.value),
                  }))
                }
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-gold/50"
              >
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating}점
                  </option>
                ))}
              </select>
            </label>
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
              rows={6}
              className="resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50"
              placeholder="진행 과정, 상담, 만족했던 점을 남겨주세요."
            />
          </label>

          <div className="grid gap-3">
            <span className="text-sm font-bold text-zinc-300">이미지 첨부</span>
            {form.image ? (
              <div className="relative overflow-hidden rounded-3xl border border-gold/20 bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image}
                  alt="첨부 이미지 미리보기"
                  className="h-32 w-full object-cover sm:h-40"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-black/70 text-white backdrop-blur transition hover:text-gold"
                  aria-label="첨부 이미지 제거"
                >
                  <X size={18} />
                </button>
                <p className="px-4 py-3 text-sm text-zinc-400">{imageName}</p>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-3 rounded-3xl border border-dashed border-gold/25 bg-white/3 px-5 py-8 text-sm font-bold text-zinc-300 transition hover:border-gold/50 hover:text-white">
                <ImagePlus size={20} />
                이미지 선택
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImage}
                  className="sr-only"
                />
              </label>
            )}
          </div>

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
            {submitting && <Loader2 size={18} className="animate-spin" />}
            후기 등록
          </button>
        </div>
      </form>

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
          {selectedReview && (
            <button
              type="button"
              onClick={() => {
                setSelectedReviewId("");
                setDeleteOpenId("");
                setEditOpenId("");
              }}
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:border-gold/40 hover:text-white"
            >
              목록으로
            </button>
          )}
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
              }
            }
            editOpen={editOpenId === selectedReview.id}
            editing={editingId === selectedReview.id}
            onDelete={() => void deleteReview(selectedReview.id)}
            onDeleteOpenChange={() => {
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
            onSelectReview={(reviewId) => {
              setSelectedReviewId(reviewId);
              setDeleteOpenId("");
              setEditOpenId("");
            }}
            previousReview={previousReview}
            review={selectedReview}
            nextReview={nextReview}
          />
        ) : (
          <>
            <div className="overflow-hidden rounded-[30px] border border-gold/15 bg-white/[.035]">
              {paginatedReviews.map((review, i) => (
                <button
                  key={review.id}
                  type="button"
                  onClick={() => setSelectedReviewId(review.id)}
                  className="grid w-full grid-cols-[auto_1fr] gap-4 border-b border-white/8 p-4 text-left transition last:border-b-0 hover:bg-white/4 sm:grid-cols-[4rem_1fr_auto]"
                >
                  <span className="hidden text-center text-sm font-black text-zinc-500 sm:block">
                    {(currentPage - 1) * REVIEWS_PER_PAGE + i + 1}
                  </span>
                  <span className="grid gap-2">
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
                  {review.image && (
                    <span className="relative hidden h-16 w-22 overflow-hidden rounded-2xl bg-black sm:block">
                      <Image
                        src={review.image}
                        alt={`${review.name} 후기 이미지`}
                        fill
                        sizes="88px"
                        className="object-cover"
                        unoptimized
                      />
                    </span>
                  )}
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

function ReviewDetail({
  deleteForm,
  deleteOpen,
  deleting,
  editForm,
  editOpen,
  editing,
  nextReview,
  onDelete,
  onDeleteFormChange,
  onDeleteOpenChange,
  onEdit,
  onEditFormChange,
  onEditOpenChange,
  onSelectReview,
  previousReview,
  review,
}: {
  deleteForm: DeleteForm;
  deleteOpen: boolean;
  deleting: boolean;
  editForm: EditForm;
  editOpen: boolean;
  editing: boolean;
  nextReview?: Review;
  onDelete: () => void;
  onDeleteFormChange: (updates: Partial<DeleteForm>) => void;
  onDeleteOpenChange: () => void;
  onEdit: () => void;
  onEditFormChange: (updates: Partial<EditForm>) => void;
  onEditOpenChange: () => void;
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
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-400 transition hover:border-red-400/40 hover:text-red-200"
            >
              <Trash2 size={16} />
              삭제
            </button>
          </div>
        </div>

        {editOpen ? (
          <div className="mt-6 rounded-3xl border border-gold/20 bg-white/[.035] p-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-zinc-300">서비스</span>
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
              <label className="grid gap-2">
                <span className="text-sm font-bold text-zinc-300">평점</span>
                <select
                  value={editForm.rating}
                  onChange={(event) =>
                    onEditFormChange({ rating: Number(event.target.value) })
                  }
                  className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-gold/50"
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating}점
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="mt-4 grid gap-2">
              <span className="text-sm font-bold text-zinc-300">후기</span>
              <textarea
                value={editForm.content}
                onChange={(event) =>
                  onEditFormChange({ content: event.target.value })
                }
                maxLength={400}
                rows={5}
                className="resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50"
              />
            </label>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                type="password"
                value={editForm.password}
                onChange={(event) =>
                  onEditFormChange({ password: event.target.value })
                }
                className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50"
                placeholder="수정 비밀번호"
              />
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
          </div>
        ) : (
          <>
            {review.image && (
              <div className="mt-6 overflow-hidden rounded-3xl border border-gold/20 bg-black">
                <Image
                  src={review.image}
                  alt={`${review.name} 후기 이미지`}
                  width={1200}
                  height={900}
                  sizes="(max-width: 1024px) 100vw, 56vw"
                  className="mx-auto h-auto max-h-[720px] max-w-full object-contain"
                  unoptimized
                />
              </div>
            )}

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

        {deleteOpen && (
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
