"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const inputCls =
  "rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50 w-full";

export default function SignupForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const u = username.trim();
    const pw = password.trim();
    if (!u || !pw) {
      setMessage("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    if (pw !== confirm.trim()) {
      setMessage("비밀번호가 일치하지 않습니다.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: u, password: pw }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setMessage(data.message ?? "회원가입에 실패했습니다.");
        return;
      }
      // 가입 시 자동 로그인됨 → 마이페이지로.
      router.push("/mypage");
      router.refresh();
    } catch {
      setMessage("회원가입에 실패했습니다.");
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
        SIGN UP
      </p>
      <h1 className="mt-3 text-2xl font-black text-white">회원가입</h1>
      <p className="mt-2 text-sm text-zinc-500">
        아이디는 영문 소문자·숫자·밑줄 3~30자.
      </p>

      <div className="mt-7 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-bold text-zinc-300">아이디</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputCls}
            placeholder="영문 소문자·숫자·밑줄 3~30자"
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
            placeholder="4자 이상"
            autoComplete="new-password"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-bold text-zinc-300">비밀번호 확인</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputCls}
            placeholder="비밀번호 다시 입력"
            autoComplete="new-password"
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
        회원가입
      </button>

      <p className="mt-5 text-center text-sm text-zinc-500">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-bold text-gold hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
