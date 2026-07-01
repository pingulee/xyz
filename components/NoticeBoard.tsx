"use client";

import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Notice } from "@/lib/notices";

const NOTICES_PER_PAGE = 10;
const MAX_IMAGE_SIZE = 1024 * 1024 * 5;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const blankForm = {
  title: "",
  content: "",
  imageUrl: null as string | null,
  pinned: false,
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
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

export default function NoticeBoard({
  initialNotices = [],
  isAdmin = false,
}: {
  initialNotices?: Notice[];
  isAdmin?: boolean;
}) {
  const [notices, setNotices] = useState(initialNotices);
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageName, setImageName] = useState("");
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const totalPages = Math.max(1, Math.ceil(notices.length / NOTICES_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedNotices = useMemo(() => {
    const start = (currentPage - 1) * NOTICES_PER_PAGE;
    return notices.slice(start, start + NOTICES_PER_PAGE);
  }, [currentPage, notices]);
  const pageItems = useMemo(
    () => getPageItems(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const goToPage = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  const openNotice = (noticeId: string) => {
    router.push(`/notice/${noticeId}`);
  };

  const resetImageState = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview("");
    setImageName("");
    setImageError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openWrite = () => {
    setEditingId("");
    setForm(blankForm);
    resetImageState();
    setMessage("");
    setModalOpen(true);
  };

  const openEdit = (notice: Notice) => {
    setEditingId(notice.id);
    setForm({
      title: notice.title,
      content: notice.content,
      imageUrl: notice.image,
      pinned: notice.pinned,
    });
    resetImageState();
    setImageName(notice.image ? "현재 이미지" : "");
    setMessage("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setMessage("");
  };

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImageError("");
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("JPG, PNG, WEBP 이미지만 첨부할 수 있습니다.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("이미지는 5MB 이하만 첨부할 수 있습니다.");
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageName(file.name);
  };

  const removeImage = () => {
    resetImageState();
    setForm((current) => ({ ...current, imageUrl: null }));
  };

  const saveNotice = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    const title = form.title.trim();
    const content = form.content.trim();
    if (!title || !content) {
      setMessage("제목과 내용을 입력해주세요.");
      return;
    }

    setSaving(true);
    try {
      let imageUrl = form.imageUrl;

      if (imageFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("image", imageFile);
        const uploadRes = await fetch("/api/uploads/notices", {
          method: "POST",
          body: fd,
        });
        const uploadData = (await uploadRes.json()) as {
          imageUrl?: string;
          message?: string;
        };
        setUploading(false);
        if (!uploadRes.ok) {
          throw new Error(
            uploadData.message ?? "이미지 업로드에 실패했습니다.",
          );
        }
        imageUrl = uploadData.imageUrl ?? null;
      }

      const response = await fetch("/api/notice", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId || undefined,
          title,
          content,
          image: imageUrl,
          pinned: form.pinned,
        }),
      });
      const data = (await response.json()) as {
        notice?: Notice;
        message?: string;
      };
      if (!response.ok || !data.notice) {
        throw new Error(data.message ?? "공지사항을 저장하지 못했습니다.");
      }

      setNotices((current) =>
        editingId
          ? current.map((notice) =>
              notice.id === editingId ? data.notice! : notice,
            )
          : [data.notice!, ...current],
      );
      setPage(1);
      closeModal();
    } catch (caught) {
      setUploading(false);
      setMessage(
        caught instanceof Error
          ? caught.message
          : "공지사항을 저장하지 못했습니다.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteNotice = async (notice: Notice) => {
    if (!confirm(`"${notice.title}" 공지를 삭제하시겠습니까?`)) return;
    setDeletingId(notice.id);
    try {
      const response = await fetch("/api/notice", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notice.id }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(data.message ?? "공지사항을 삭제하지 못했습니다.");
      }
      setNotices((current) => current.filter((item) => item.id !== notice.id));
    } finally {
      setDeletingId("");
    }
  };

  const currentImage = imagePreview || form.imageUrl;
  const inputCls =
    "rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50";

  return (
    <div className="grid gap-8">
      {modalOpen && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="max-h-[90dvh] w-full max-w-xl overflow-y-auto rounded-[34px] border border-gold/20 bg-[#111] p-6 shadow-2xl sm:p-8">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">
                  notice
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  {editingId ? "공지 수정" : "공지 등록"}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-zinc-400 transition hover:border-gold/40 hover:text-white"
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={saveNotice} className="grid gap-4">
              <label className="grid gap-2 text-sm font-bold text-zinc-300">
                제목
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  maxLength={120}
                  className={inputCls}
                  placeholder="공지 제목"
                />
              </label>

              <label className="grid gap-2 text-sm font-bold text-zinc-300">
                내용
                <textarea
                  value={form.content}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      content: event.target.value,
                    }))
                  }
                  maxLength={3000}
                  rows={5}
                  className={`${inputCls} resize-none leading-7`}
                  placeholder="공지 내용"
                />
              </label>

              <div className="grid gap-2">
                <span className="text-sm font-bold text-zinc-300">
                  이미지
                </span>
                {currentImage ? (
                  <div className="relative overflow-hidden rounded-2xl bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentImage}
                      alt="미리보기"
                      className="max-h-64 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white hover:bg-black"
                      aria-label="이미지 제거"
                    >
                      <X size={15} />
                    </button>
                    {imageName && (
                      <p className="px-3 py-2 text-xs text-zinc-500">
                        {imageName}
                      </p>
                    )}
                  </div>
                ) : (
                  <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/3 px-4 py-5 text-sm font-bold text-zinc-400 transition hover:border-gold/40 hover:text-white">
                    이미지 선택
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleImage}
                    />
                  </label>
                )}
                {imageError && (
                  <p className="text-xs text-red-400">{imageError}</p>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm font-bold text-zinc-300">
                <input
                  type="checkbox"
                  checked={form.pinned}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      pinned: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-gold"
                />
                상단 고정
              </label>

              {message && (
                <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={saving || uploading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-gradient px-7 py-4 font-black text-black shadow-gold-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {(saving || uploading) && (
                  <Loader2 size={18} className="animate-spin" />
                )}
                {uploading
                  ? "이미지 업로드 중..."
                  : editingId
                    ? "수정 저장"
                    : "공지 등록"}
              </button>
            </form>
          </div>
        </div>
      )}

      {notices.length === 0 ? (
        <div className="rounded-[30px] border border-gold/15 bg-white/[.035] p-8 text-center text-zinc-400">
          등록된 공지사항이 없습니다.
        </div>
      ) : (
        <div className="overflow-hidden rounded-[30px] border border-gold/15 bg-white/[.035]">
          <div
            className={`hidden gap-4 border-b border-white/8 bg-black/20 px-5 py-3 text-xs font-black text-zinc-500 lg:grid ${
              isAdmin
                ? "grid-cols-[3.25rem_minmax(0,1.35fr)_minmax(0,1.5fr)_8rem_6rem_5.5rem]"
                : "grid-cols-[3.25rem_minmax(0,1.4fr)_minmax(0,1.6fr)_8rem_6rem]"
            }`}
          >
            <span>번호</span>
            <span>제목</span>
            <span>내용</span>
            <span>작성일</span>
            <span>상태</span>
            {isAdmin && <span>관리</span>}
          </div>

          {paginatedNotices.map((notice, i) => {
            const displayNumber =
              notices.length - ((currentPage - 1) * NOTICES_PER_PAGE + i);

            return (
              <button
                key={notice.id}
                type="button"
                onClick={() => openNotice(notice.id)}
                className={`group grid w-full cursor-pointer gap-4 border-b border-white/8 px-5 py-5 text-left transition last:border-b-0 hover:bg-white/[.055] lg:items-center ${
                  isAdmin
                    ? "lg:grid-cols-[3.25rem_minmax(0,1.35fr)_minmax(0,1.5fr)_8rem_6rem_5.5rem]"
                    : "lg:grid-cols-[3.25rem_minmax(0,1.4fr)_minmax(0,1.6fr)_8rem_6rem]"
                }`}
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
                      {formatDate(notice.createdAt)}
                    </span>
                  </span>

                  <span className="block truncate text-sm font-bold leading-6 text-white transition group-hover:text-gold">
                    {notice.title}
                  </span>
                  <span className="truncate text-xs font-bold text-zinc-500 lg:hidden">
                    {notice.content}
                  </span>
                </span>

                <span className="hidden truncate text-sm font-bold text-zinc-400 lg:block">
                  {notice.content}
                </span>

                <span className="hidden whitespace-nowrap text-xs font-bold leading-5 text-zinc-400 lg:block">
                  <time dateTime={notice.createdAt}>
                    {formatDate(notice.createdAt)}
                  </time>
                </span>

                <span
                  className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-[11px] font-black ${
                    notice.pinned
                      ? "border-gold/20 bg-gold/10 text-gold"
                      : "border-white/10 bg-white/5 text-zinc-500"
                  }`}
                >
                  {notice.pinned ? "고정" : "일반"}
                </span>

                {isAdmin && (
                  <span className="flex gap-2">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation();
                        openEdit(notice);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          openEdit(notice);
                        }
                      }}
                      className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-zinc-400 transition hover:border-gold/40 hover:text-white"
                      aria-label="공지 수정"
                    >
                      <Pencil size={16} />
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation();
                        void deleteNotice(notice);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          event.stopPropagation();
                          void deleteNotice(notice);
                        }
                      }}
                      className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-zinc-400 transition hover:border-red-400/40 hover:text-red-200"
                      aria-label="공지 삭제"
                    >
                      {deletingId === notice.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {isAdmin && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={openWrite}
            className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-5 py-3 text-sm font-black text-black shadow-gold-sm transition hover:-translate-y-0.5"
          >
            <Plus size={16} />
            공지 등록
          </button>
        </div>
      )}

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
    </div>
  );
}
