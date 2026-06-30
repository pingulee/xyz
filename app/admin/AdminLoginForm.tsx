"use client";

import { Loader2 } from "lucide-react";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AdminLoginFormInner() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const inputCls =
    "rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50 w-full";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pw = password.trim();
    if (!pw) {
      setMessage("비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setMessage(data.message ?? "로그인에 실패했습니다.");
        return;
      }

      router.push(from && from.startsWith("/") ? from : "/");
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
        admin
      </p>
      <h2 className="mt-3 text-2xl font-black text-white">관리자 로그인</h2>
      <p className="mt-2 text-sm text-zinc-500">롤대리.xyz 관리자 페이지입니다.</p>

      <label className="mt-7 grid gap-2">
        <span className="text-sm font-bold text-zinc-300">비밀번호</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
          placeholder="관리자 비밀번호"
          autoFocus
        />
      </label>

      {message && (
        <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient px-7 py-4 font-black text-black shadow-gold-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading && <Loader2 size={18} className="animate-spin" />}
        입장
      </button>
    </form>
  );
}

export default function AdminLoginForm() {
  return (
    <Suspense>
      <AdminLoginFormInner />
    </Suspense>
  );
}
