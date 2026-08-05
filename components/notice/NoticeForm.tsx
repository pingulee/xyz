"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50";

export type NoticeValues = { title: string; content: string; pinned: boolean };

// 공지 작성/수정 공용 폼. onSubmit은 실패 시 에러 메시지 문자열, 성공 시 null을 반환한다.
export default function NoticeForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: NoticeValues;
  submitLabel: string;
  onSubmit: (values: NoticeValues) => Promise<string | null>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState(initial.content);
  const [pinned, setPinned] = useState(initial.pinned);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 입력해주세요.");
      return;
    }
    setSaving(true);
    setError("");
    const err = await onSubmit({
      title: title.trim(),
      content: content.trim(),
      pinned,
    });
    setSaving(false);
    if (err) setError(err);
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      <label className="grid gap-2 text-sm font-bold text-zinc-300">
        제목
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className={inputCls}
          placeholder="공지 제목"
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-zinc-300">
        내용
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={20000}
          rows={10}
          className={`${inputCls} resize-y leading-7`}
          placeholder="공지 내용을 입력해주세요."
        />
      </label>
      <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-zinc-300">
        <input
          type="checkbox"
          checked={pinned}
          onChange={(e) => setPinned(e.target.checked)}
          className="h-4 w-4 accent-gold"
        />
        상단 고정
      </label>

      {error && (
        <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-sm font-black text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-full border border-white/10 px-6 py-3 text-sm font-bold text-zinc-300 transition hover:border-white/30 hover:text-white disabled:opacity-60"
        >
          취소
        </button>
      </div>
    </form>
  );
}
