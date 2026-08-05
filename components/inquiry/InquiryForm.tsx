"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50";
const labelCls = "grid gap-2 text-sm font-bold text-zinc-300";

// 문의 작성 폼. 비회원은 임시 비밀번호 필수(본인 문의 열람·삭제용), 회원은 비번 없이 소유.
export default function InquiryForm({
  isMember,
  onDone,
  onCancel,
}: {
  isMember: boolean;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 입력해주세요.");
      return;
    }
    if (!isMember && password.trim().length < 4) {
      setError("비밀번호는 4자 이상 입력해주세요.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          name: name.trim(),
          ...(isMember ? {} : { password: password.trim() }),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setError(data.message ?? "등록에 실패했습니다.");
        return;
      }
      onDone();
    } catch {
      setError("등록에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      <label className={labelCls}>
        제목
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          className={inputCls}
          placeholder="문의 제목"
        />
      </label>
      <label className={labelCls}>
        내용
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={20000}
          rows={8}
          className={`${inputCls} resize-y leading-7`}
          placeholder="문의 내용을 입력해주세요."
        />
      </label>
      {isMember ? (
        <p className="text-xs text-zinc-500">
          작성자명은 회원 정보의 사이트 닉네임으로 표시됩니다.
        </p>
      ) : (
        <label className={labelCls}>
          작성자 <span className="font-normal text-zinc-500">(선택)</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            className={inputCls}
            placeholder="미입력 시 '비회원'"
          />
        </label>
      )}
      {!isMember && (
        <label className={labelCls}>
          비밀번호
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            maxLength={128}
            className={inputCls}
            placeholder="문의 확인용 (4자 이상)"
            autoComplete="new-password"
          />
          <span className="text-xs font-normal text-zinc-500">
            비회원은 이 비밀번호로 본인 문의를 열람·삭제합니다. 분실 시 복구 불가.
          </span>
        </label>
      )}

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
          등록
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
