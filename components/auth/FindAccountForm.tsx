"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

// 아이디 찾기 · 비밀번호 찾기를 한 카드 안 탭으로 통합한다(대다수 사이트의 계정
// 찾기 UX). 두 탭 모두 "가입 이메일 입력 → 메일 발송" 흐름이라 패널을 공용화한다.
// 실제 비밀번호 재설정(새 비번 입력)은 메일 링크로 도착하는 /reset-password?token=
// 단계에서 처리한다(ResetPasswordForm). 응답은 열거 방지로 존재 여부 무관 동일.

type Tab = "id" | "pw";

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50";

const tabBase =
  "rounded-full px-4 py-2.5 text-sm font-black transition";
const tabActive = "bg-gold-gradient text-black";
const tabInactive = "text-zinc-400 hover:text-white";

function EmailRequestPanel({
  endpoint,
  description,
  submitLabel,
}: {
  endpoint: string;
  description: string;
  submitLabel: string;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (res.ok) setDone(data.message ?? "메일을 확인해주세요.");
      else setError(data.message ?? "요청에 실패했습니다.");
    } catch {
      setError("요청에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6">
      <p className="text-sm text-zinc-500">{description}</p>
      {done ? (
        <p className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
          {done}
        </p>
      ) : (
        <div className="mt-5 grid gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="가입 이메일"
            autoComplete="email"
          />
          {error && (
            <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient px-7 py-4 font-black text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {submitLabel}
          </button>
        </div>
      )}
    </form>
  );
}

export default function FindAccountForm({
  initialTab = "id",
}: {
  initialTab?: Tab;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <div className="card-premium mx-auto max-w-md rounded-[34px] p-6 sm:p-8">
      <p className="text-center text-xs font-black uppercase tracking-[0.22em] text-gold">
        FIND ACCOUNT
      </p>
      <h1 className="mt-3 text-center text-2xl font-black text-white">
        아이디·비밀번호 찾기
      </h1>

      <div
        role="tablist"
        aria-label="계정 찾기"
        className="mt-6 grid grid-cols-2 gap-1 rounded-full bg-black/30 p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "id"}
          onClick={() => setTab("id")}
          className={`${tabBase} ${tab === "id" ? tabActive : tabInactive}`}
        >
          아이디 찾기
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "pw"}
          onClick={() => setTab("pw")}
          className={`${tabBase} ${tab === "pw" ? tabActive : tabInactive}`}
        >
          비밀번호 찾기
        </button>
      </div>

      {tab === "id" ? (
        <EmailRequestPanel
          endpoint="/api/auth/find-username"
          description="가입 시 등록한 이메일로 아이디를 보내드립니다."
          submitLabel="아이디 찾기"
        />
      ) : (
        <EmailRequestPanel
          endpoint="/api/auth/request-reset"
          description="가입 이메일로 비밀번호 재설정 링크를 보내드립니다. (1시간 유효)"
          submitLabel="재설정 링크 보내기"
        />
      )}

      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link href="/login" className="font-bold text-gold hover:underline">
          로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
