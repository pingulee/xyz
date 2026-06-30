"use client";

import Image from "next/image";
import { Loader2, LogOut, Pencil, Pin, Trash2, X } from "lucide-react";
import { ChangeEvent, type FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Notice } from "@/lib/notices";

type NoticeResponse = {
  notice: Notice;
  message?: string;
};

const MAX_IMAGE_SIZE = 1024 * 1024 * 5;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const blankForm = {
  title: "",
  content: "",
  imageUrl: null as string | null,
  pinned: false,
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

export default function AdminNoticeBoard({
  initialNotices = [],
}: {
  initialNotices?: Notice[];
}) {
  const [notices, setNotices] = useState(initialNotices);
  const [form, setForm] = useState(blankForm);
  const [selectedId, setSelectedId] = useState(initialNotices[0]?.id ?? "");
  const [editingId, setEditingId] = useState("");
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

  const selectedNotice = notices.find((n) => n.id === selectedId) ?? notices[0];

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
    const objectUrl = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(objectUrl);
    setImageName(file.name);
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview("");
    setImageName("");
    setForm((f) => ({ ...f, imageUrl: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
  };

  const startEdit = (notice: Notice) => {
    setEditingId(notice.id);
    setForm({ title: notice.title, content: notice.content, imageUrl: notice.image, pinned: notice.pinned });
    setImageFile(null);
    setImagePreview("");
    setImageName(notice.image ? "현재 이미지" : "");
    setImageError("");
    setMessage("");
  };

  const resetForm = () => {
    setEditingId("");
    setForm(blankForm);
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview("");
    setImageName("");
    setImageError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const saveNotice = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    const title = form.title.trim();
    const content = form.content.trim();
    if (!title || !content) { setMessage("제목과 내용을 입력해주세요."); return; }

    setSaving(true);
    try {
      let imageUrl = form.imageUrl;

      if (imageFile) {
        setUploading(true);
        const fd = new FormData();
        fd.append("image", imageFile);
        const uploadRes = await fetch("/api/uploads/notices", { method: "POST", body: fd });
        const uploadData = (await uploadRes.json()) as { imageUrl?: string; message?: string };
        setUploading(false);
        if (!uploadRes.ok) throw new Error(uploadData.message ?? "이미지 업로드에 실패했습니다.");
        imageUrl = uploadData.imageUrl ?? null;
      }

      const response = await fetch("/api/notices", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId || undefined, title, content, image: imageUrl, pinned: form.pinned }),
      });
      const data = (await response.json()) as NoticeResponse;
      if (!response.ok) throw new Error(data.message ?? "공지사항을 저장하지 못했습니다.");

      if (editingId) {
        setNotices((cur) =>
          cur.map((n) => (n.id === editingId ? data.notice : n))
            .sort((a, b) => Number(b.pinned) - Number(a.pinned) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        );
      } else {
        setNotices((cur) => [data.notice, ...cur]);
        setSelectedId(data.notice.id);
      }
      resetForm();
    } catch (caught) {
      setUploading(false);
      setMessage(caught instanceof Error ? caught.message : "공지사항을 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const deleteNotice = async (notice: Notice) => {
    setMessage("");
    setDeletingId(notice.id);
    try {
      const response = await fetch("/api/notices", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notice.id }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(data.message ?? "공지사항을 삭제하지 못했습니다.");
      setNotices((cur) => cur.filter((item) => item.id !== notice.id));
      setSelectedId("");
      resetForm();
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : "공지사항을 삭제하지 못했습니다.");
    } finally {
      setDeletingId("");
    }
  };

  const inputCls = "rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50 w-full";
  const currentImage = imagePreview || form.imageUrl;

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <form onSubmit={saveNotice} className="card-premium rounded-[34px] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">admin only</p>
            <h2 className="mt-3 text-2xl font-black text-white">{editingId ? "공지 수정" : "공지 작성"}</h2>
          </div>
          <button type="button" onClick={() => void logout()} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-400 transition hover:border-gold/40 hover:text-white">
            <LogOut size={16} />로그아웃
          </button>
        </div>

        <div className="mt-7 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-zinc-300">제목</span>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} maxLength={120} className={inputCls} placeholder="공지 제목" />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-zinc-300">내용</span>
            <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} maxLength={3000} rows={8} className="resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50" placeholder="공지 내용을 입력해주세요." />
          </label>

          <div className="grid gap-2">
            <span className="text-sm font-bold text-zinc-300">이미지 (선택)</span>
            {currentImage ? (
              <div className="relative overflow-hidden rounded-2xl bg-zinc-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={currentImage} alt="미리보기" className="w-full object-cover" />
                <button type="button" onClick={removeImage} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white hover:bg-black">
                  <X size={14} />
                </button>
                <p className="px-3 py-2 text-xs text-zinc-500">{imageName}</p>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/3 px-4 py-6 text-sm font-bold text-zinc-400 transition hover:border-gold/40 hover:text-white">
                이미지 선택 (JPG/PNG/WEBP, 5MB 이하)
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImage} />
              </label>
            )}
            {imageError && <p className="text-xs text-red-400">{imageError}</p>}
          </div>

          <label className="flex items-center gap-2 text-sm font-bold text-zinc-300">
            <input type="checkbox" checked={form.pinned} onChange={(e) => setForm((f) => ({ ...f, pinned: e.target.checked }))} className="h-4 w-4 accent-gold" />
            상단 고정
          </label>

          {message && <p className="rounded-2xl border border-gold/15 bg-white/[.035] px-4 py-3 text-sm font-bold text-zinc-300">{message}</p>}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" disabled={saving || uploading} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gold-gradient px-7 py-4 font-black text-black shadow-gold-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60">
              {(saving || uploading) && <Loader2 size={18} className="animate-spin" />}
              {uploading ? "이미지 업로드 중..." : editingId ? "수정 저장" : "공지 등록"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="rounded-full border border-white/10 px-7 py-4 font-bold text-zinc-300 transition hover:border-gold/40 hover:text-white">취소</button>
            )}
          </div>
        </div>
      </form>

      <div className="space-y-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">notice</p>
          <h2 className="mt-2 text-2xl font-black text-white">공지사항 {notices.length}개</h2>
        </div>

        {selectedNotice && (
          <article className="rounded-[30px] border border-gold/15 bg-white/[.035] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                {selectedNotice.pinned && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-3 py-1 text-xs font-black text-gold"><Pin size={13} />고정</span>
                )}
                <h3 className="mt-3 text-2xl font-black text-white">{selectedNotice.title}</h3>
                <time className="mt-2 block text-sm font-bold text-zinc-500" dateTime={selectedNotice.createdAt}>{formatDate(selectedNotice.createdAt)}</time>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => startEdit(selectedNotice)} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-zinc-400 transition hover:border-gold/40 hover:text-white" aria-label="공지 수정"><Pencil size={17} /></button>
                <button type="button" onClick={() => void deleteNotice(selectedNotice)} disabled={deletingId === selectedNotice.id} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-zinc-400 transition hover:border-red-400/40 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60" aria-label="공지 삭제">
                  {deletingId === selectedNotice.id ? <Loader2 size={17} className="animate-spin" /> : <Trash2 size={17} />}
                </button>
              </div>
            </div>
            {selectedNotice.image && (
              <div className="mt-4 overflow-hidden rounded-2xl">
                <Image src={selectedNotice.image} alt="공지 이미지" width={600} height={400} className="w-full object-cover" unoptimized />
              </div>
            )}
            <p className="mt-6 whitespace-pre-wrap leading-8 text-zinc-300">{selectedNotice.content}</p>
          </article>
        )}

        <div className="overflow-hidden rounded-[30px] border border-gold/15 bg-white/[.035]">
          {notices.map((notice) => (
            <button key={notice.id} type="button" onClick={() => setSelectedId(notice.id)} className="grid w-full gap-2 border-b border-white/8 p-4 text-left transition last:border-b-0 hover:bg-white/4">
              <span className="flex flex-wrap items-center gap-2">
                {notice.pinned && <span className="rounded-full bg-gold/10 px-2.5 py-1 text-[11px] font-black text-gold">고정</span>}
                <span className="font-black text-white">{notice.title}</span>
              </span>
              <span className="line-clamp-1 text-sm leading-6 text-zinc-400">{notice.content}</span>
              <time className="text-xs font-bold text-zinc-500" dateTime={notice.createdAt}>{formatDate(notice.createdAt)}</time>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
