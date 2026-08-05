"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50";

// 아이디 찾기. 이메일 입력 → 서버가 가입 이메일이면 아이디를 메일로 보낸다.
// 응답은 존재 여부와 무관하게 동일(열거 방지).
export default function FindUsernameForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/find-username", {
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
    <form
      onSubmit={submit}
      className="card-premium mx-auto max-w-md rounded-[34px] p-6 sm:p-8"
    >
      <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">FIND ID</p>
      <h1 className="mt-3 text-2xl font-black text-white">아이디 찾기</h1>
      <p className="mt-2 text-sm text-zinc-500">
        가입 시 등록한 이메일로 아이디를 보내드립니다.
      </p>

      {done ? (
        <p className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
          {done}
        </p>
      ) : (
        <div className="mt-6 grid gap-4">
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
            아이디 찾기
          </button>
        </div>
      )}

      <div className="mt-5 flex justify-between text-sm text-zinc-500">
        <Link href="/login" className="font-bold text-gold hover:underline">
          로그인
        </Link>
        <Link href="/reset-password" className="font-bold text-gold hover:underline">
          비밀번호 찾기
        </Link>
      </div>
    </form>
  );
}
