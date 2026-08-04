"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const inputCls =
  "rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50 w-full";

function isSafeReturnPath(value: string): boolean {
  if (!value.startsWith("/")) return false;
  try {
    const url = new URL(value, window.location.origin);
    return (
      url.pathname !== "/login" &&
      url.pathname !== "/signup" &&
      url.pathname !== "/admin"
    );
  } catch {
    return false;
  }
}

function LoginFormInner({ fallbackFrom = "/" }: { fallbackFrom?: string }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? fallbackFrom;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const u = username.trim();
    const pw = password.trim();
    if (!u || !pw) {
      setMessage("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: pw }),
      });
      const data = (await res.json()) as { role?: string; message?: string };
      if (!res.ok) {
        setMessage(data.message ?? "로그인에 실패했습니다.");
        return;
      }
      // role별 기본 도착지. 관리자·고객은 안전한 이전 경로가 있으면 그리로.
      const dest =
        data.role === "admin"
          ? isSafeReturnPath(from)
            ? from
            : "/admin"
          : data.role === "booster"
            ? "/review"
            : isSafeReturnPath(from)
              ? from
              : "/mypage";
      router.push(dest);
      router.refresh();
    } catch {
      setMessage("로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="card-premium mx-auto max-w-xl rounded-[34px] p-6 sm:p-8"
    >
      <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">
        LOGIN
      </p>
      <h1 className="mt-3 text-2xl font-black text-white">로그인</h1>

      <div className="mt-7 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-bold text-zinc-300">아이디</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputCls}
            placeholder="아이디"
            autoFocus
            autoComplete="username"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-bold text-zinc-300">비밀번호</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
            placeholder="비밀번호"
            autoComplete="current-password"
          />
        </label>
      </div>

      {message && (
        <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient px-7 py-4 font-black text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading && <Loader2 size={18} className="animate-spin" />}
        로그인
      </button>

      <p className="mt-5 text-center text-sm text-zinc-500">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="font-bold text-gold hover:underline">
          회원가입
        </Link>
      </p>
    </form>
  );
}

export default function LoginForm({
  fallbackFrom = "/",
}: {
  fallbackFrom?: string;
}) {
  return (
    <Suspense>
      <LoginFormInner fallbackFrom={fallbackFrom} />
    </Suspense>
  );
}
