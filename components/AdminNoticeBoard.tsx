"use client";

import { Loader2, LogOut, Pencil, Pin, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Notice } from "@/lib/notices";

type NoticeResponse = {
  notice: Notice;
  message?: string;
};

const STORAGE_KEY = "xyz-admin-password";

const blankForm = {
  title: "",
  content: "",
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
  const [password, setPassword] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [form, setForm] = useState(blankForm);
  const [selectedId, setSelectedId] = useState(initialNotices[0]?.id ?? "");
  const [editingId, setEditingId] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [message, setMessage] = useState("");

  const selectedNotice = useMemo(
    () => notices.find((notice) => notice.id === selectedId) ?? notices[0],
    [notices, selectedId],
  );

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      // Restore browser-persisted admin access after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPassword(stored);
      setPasswordInput(stored);
    }
  }, []);

  const login = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextPassword = passwordInput.trim();

    if (!nextPassword) {
      setMessage("관리자 비밀번호를 입력해주세요.");
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, nextPassword);
    setPassword(nextPassword);
    setMessage("");
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setPassword("");
    setPasswordInput("");
    setMessage("");
  };

  const startEdit = (notice: Notice) => {
    setEditingId(notice.id);
    setForm({
      title: notice.title,
      content: notice.content,
      pinned: notice.pinned,
    });
    setMessage("");
  };

  const resetForm = () => {
    setEditingId("");
    setForm(blankForm);
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
      const response = await fetch("/api/notices", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId || undefined,
          title,
          content,
          pinned: form.pinned,
          password,
        }),
      });
      const data = (await response.json()) as NoticeResponse;

      if (!response.ok) {
        throw new Error(data.message ?? "공지사항을 저장하지 못했습니다.");
      }

      if (editingId) {
        setNotices((current) =>
          current
            .map((notice) => (notice.id === editingId ? data.notice : notice))
            .sort(
              (a, b) =>
                Number(b.pinned) - Number(a.pinned) ||
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            ),
        );
      } else {
        setNotices((current) => [data.notice, ...current]);
        setSelectedId(data.notice.id);
      }

      resetForm();
    } catch (caught) {
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
    setMessage("");
    setDeletingId(notice.id);

    try {
      const response = await fetch("/api/notices", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notice.id, password }),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "공지사항을 삭제하지 못했습니다.");
      }

      setNotices((current) => current.filter((item) => item.id !== notice.id));
      setSelectedId("");
      resetForm();
    } catch (caught) {
      setMessage(
        caught instanceof Error
          ? caught.message
          : "공지사항을 삭제하지 못했습니다.",
      );
    } finally {
      setDeletingId("");
    }
  };

  if (!password) {
    return (
      <form
        onSubmit={login}
        className="card-premium mx-auto max-w-xl rounded-[34px] p-6 sm:p-8"
      >
        <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">
          admin
        </p>
        <h2 className="mt-3 text-2xl font-black text-white">관리자 로그인</h2>
        <label className="mt-7 grid gap-2">
          <span className="text-sm font-bold text-zinc-300">비밀번호</span>
          <input
            type="password"
            value={passwordInput}
            onChange={(event) => setPasswordInput(event.target.value)}
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50"
            placeholder="ADMIN_PASSWORD"
          />
        </label>
        {message && (
          <p className="mt-4 rounded-2xl border border-gold/15 bg-white/[.035] px-4 py-3 text-sm font-bold text-zinc-300">
            {message}
          </p>
        )}
        <button
          type="submit"
          className="mt-5 w-full rounded-full bg-gold-gradient px-7 py-4 font-black text-black shadow-gold-sm transition hover:-translate-y-0.5"
        >
          입장
        </button>
      </form>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <form
        onSubmit={saveNotice}
        className="card-premium rounded-[34px] p-6 sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">
              admin only
            </p>
            <h2 className="mt-3 text-2xl font-black text-white">
              {editingId ? "공지 수정" : "공지 작성"}
            </h2>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-400 transition hover:border-gold/40 hover:text-white"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>

        <div className="mt-7 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-zinc-300">제목</span>
            <input
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              maxLength={120}
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50"
              placeholder="공지 제목"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-zinc-300">내용</span>
            <textarea
              value={form.content}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  content: event.target.value,
                }))
              }
              maxLength={3000}
              rows={8}
              className="resize-none rounded-2xl border border-white/10 bg-black/30 px-4 py-3 leading-7 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50"
              placeholder="공지 내용을 입력해주세요."
            />
          </label>

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
            <p className="rounded-2xl border border-gold/15 bg-white/[.035] px-4 py-3 text-sm font-bold text-zinc-300">
              {message}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gold-gradient px-7 py-4 font-black text-black shadow-gold-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && <Loader2 size={18} className="animate-spin" />}
              {editingId ? "수정 저장" : "공지 등록"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-white/10 px-7 py-4 font-bold text-zinc-300 transition hover:border-gold/40 hover:text-white"
              >
                취소
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="space-y-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">
            notice
          </p>
          <h2 className="mt-2 text-2xl font-black text-white">
            공지사항 {notices.length}개
          </h2>
        </div>

        {selectedNotice && (
          <article className="rounded-[30px] border border-gold/15 bg-white/[.035] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                {selectedNotice.pinned && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-3 py-1 text-xs font-black text-gold">
                    <Pin size={13} />
                    고정
                  </span>
                )}
                <h3 className="mt-3 text-2xl font-black text-white">
                  {selectedNotice.title}
                </h3>
                <time
                  className="mt-2 block text-sm font-bold text-zinc-500"
                  dateTime={selectedNotice.createdAt}
                >
                  {formatDate(selectedNotice.createdAt)}
                </time>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(selectedNotice)}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-zinc-400 transition hover:border-gold/40 hover:text-white"
                  aria-label="공지 수정"
                >
                  <Pencil size={17} />
                </button>
                <button
                  type="button"
                  onClick={() => void deleteNotice(selectedNotice)}
                  disabled={deletingId === selectedNotice.id}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-zinc-400 transition hover:border-red-400/40 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label="공지 삭제"
                >
                  {deletingId === selectedNotice.id ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Trash2 size={17} />
                  )}
                </button>
              </div>
            </div>
            <p className="mt-6 whitespace-pre-wrap leading-8 text-zinc-300">
              {selectedNotice.content}
            </p>
          </article>
        )}

        <div className="overflow-hidden rounded-[30px] border border-gold/15 bg-white/[.035]">
          {notices.map((notice) => (
            <button
              key={notice.id}
              type="button"
              onClick={() => setSelectedId(notice.id)}
              className="grid w-full gap-2 border-b border-white/8 p-4 text-left transition last:border-b-0 hover:bg-white/4"
            >
              <span className="flex flex-wrap items-center gap-2">
                {notice.pinned && (
                  <span className="rounded-full bg-gold/10 px-2.5 py-1 text-[11px] font-black text-gold">
                    고정
                  </span>
                )}
                <span className="font-black text-white">{notice.title}</span>
              </span>
              <span className="line-clamp-1 text-sm leading-6 text-zinc-400">
                {notice.content}
              </span>
              <time
                className="text-xs font-bold text-zinc-500"
                dateTime={notice.createdAt}
              >
                {formatDate(notice.createdAt)}
              </time>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
