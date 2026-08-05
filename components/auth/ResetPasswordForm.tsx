"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { isValidPassword, PASSWORD_RULE_TEXT } from "@/lib/authPolicy";

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50";

// 이메일 재설정 링크(token)로 도착하는 새 비밀번호 설정 단계.
// 재설정 요청(이메일 발송)은 /find-account 비밀번호 찾기 탭에서 처리한다.
export default function ResetPasswordForm({ token }: { token: string }) {
  return <SetNewPassword token={token} />;
}

function SetNewPassword({ token }: { token: string }) {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isValidPassword(pw)) {
      setError(PASSWORD_RULE_TEXT);
      return;
    }
    if (pw !== confirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: pw }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (res.ok) setDone(true);
      else setError(data.message ?? "재설정에 실패했습니다.");
    } catch {
      setError("재설정에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="card-premium mx-auto max-w-md rounded-[34px] p-6 sm:p-8"
    >
      <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">RESET</p>
      <h1 className="mt-3 text-2xl font-black text-white">새 비밀번호 설정</h1>

      {done ? (
        <>
          <p className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-200">
            비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.
          </p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-gold-gradient px-7 py-4 font-black text-black transition hover:brightness-110"
          >
            로그인하러 가기
          </button>
        </>
      ) : (
        <div className="mt-6 grid gap-4">
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className={inputCls}
            placeholder="새 비밀번호 (영문·숫자·특수문자 포함 8~64자)"
            autoComplete="new-password"
          />
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputCls}
            placeholder="새 비밀번호 확인"
            autoComplete="new-password"
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
            비밀번호 변경
          </button>
        </div>
      )}
    </form>
  );
}
