"use client";

import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function KnightLoginForm() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const inputCls =
    "rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50 w-full";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const n = name.trim();
    const pw = password.trim();
    if (!n || !pw) {
      setMessage("닉네임과 비밀번호를 입력해주세요.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/knight/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, password: pw }),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        setMessage(data.message ?? "로그인에 실패했습니다.");
        return;
      }

      router.push("/reviews");
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
      <h2 className="mt-3 text-2xl font-black text-white">로그인</h2>

      <div className="mt-7 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-bold text-zinc-300">닉네임</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder="기사 닉네임"
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
    </form>
  );
}
