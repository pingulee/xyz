"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Trash2 } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { formatNoticeDate } from "@/components/notice/format";
import type { InquiryFull, InquirySummary } from "@/lib/inquiry";

type Status = "loading" | "locked" | "open" | "notfound";

// 문의 상세. 본문은 인증(관리자|소유|비번) 후 API로만 받아온다. 세션 소유·관리자는
// 마운트 시 자동 열람, 비회원 작성 건은 비밀번호 입력 후 열람한다.
export default function InquiryDetailView({
  summary,
}: {
  summary: InquirySummary;
}) {
  const { session, loading: sessionLoading } = useSession();
  const isAdmin = session.role === "admin";
  const router = useRouter();

  const [status, setStatus] = useState<Status>("loading");
  const [inquiry, setInquiry] = useState<InquiryFull | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState("");

  type AttemptResult =
    | { kind: "open"; inquiry: InquiryFull }
    | { kind: "locked"; error?: string }
    | { kind: "notfound" };

  // 열람 시도. setState를 직접 하지 않고 결과만 반환한다(effect 안 동기 setState 회피).
  const attempt = async (pw: string): Promise<AttemptResult> => {
    const res = await fetch(`/api/inquiry/${summary.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pw ? { password: pw } : {}),
    });
    if (res.status === 404) return { kind: "notfound" };
    if (res.status === 403) {
      return { kind: "locked", error: pw ? "비밀번호가 일치하지 않습니다." : undefined };
    }
    const data = (await res.json().catch(() => ({}))) as { inquiry?: InquiryFull };
    if (res.ok && data.inquiry) return { kind: "open", inquiry: data.inquiry };
    return { kind: "locked" };
  };

  const apply = (r: AttemptResult) => {
    if (r.kind === "open") {
      setInquiry(r.inquiry);
      setAnswer(r.inquiry.answer ?? "");
      setStatus("open");
    } else if (r.kind === "notfound") {
      setStatus("notfound");
    } else {
      setStatus("locked");
      if (r.error) setError(r.error);
    }
  };

  // 세션 확정 후 1회 자동 열람 시도(관리자/소유면 통과, 아니면 잠금 화면).
  // await 이후에만 setState하므로 effect 내 동기 setState가 아니다.
  useEffect(() => {
    if (sessionLoading) return;
    let alive = true;
    attempt("").then((r) => {
      if (alive) apply(r);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoading]);

  const unlock = async () => {
    if (!password.trim()) return;
    setBusy(true);
    setError("");
    apply(await attempt(password.trim()));
    setBusy(false);
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setBusy(true);
    const res = await fetch(`/api/inquiry/${summary.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answer: answer.trim() }),
    });
    setBusy(false);
    if (res.ok && inquiry) {
      setInquiry({ ...inquiry, answer: answer.trim(), answered: true });
    } else {
      setError("답변 저장에 실패했습니다.");
    }
  };

  const remove = async () => {
    if (!confirm("이 문의를 삭제할까요?")) return;
    setBusy(true);
    const res = await fetch(`/api/inquiry/${summary.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(password.trim() ? { password: password.trim() } : {}),
    });
    setBusy(false);
    if (res.ok) {
      router.push("/inquiry");
      router.refresh();
    } else {
      setError("삭제 권한이 없습니다.");
    }
  };

  // ── 잠금(비밀번호 입력) ──
  if (status === "locked") {
    return (
      <div className="card-premium rounded-3xl p-6 sm:p-8">
        <p className="flex items-center gap-2 text-lg font-black text-white">
          <Lock size={16} className="text-gold" />
          {summary.title}
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          비공개 문의입니다. 작성 시 입력한 비밀번호를 입력해주세요.
        </p>
        <div className="mt-5 flex gap-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                unlock();
              }
            }}
            className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-gold/50"
            placeholder="비밀번호"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={unlock}
            disabled={busy}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-gold-gradient px-6 py-3 text-sm font-black text-black transition hover:brightness-110 disabled:opacity-60"
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            열람
          </button>
        </div>
        {error && <p className="mt-3 text-sm font-bold text-red-300">{error}</p>}
      </div>
    );
  }

  if (status === "notfound") {
    return (
      <p className="card-premium rounded-3xl p-8 text-center text-sm text-zinc-400">
        문의를 찾을 수 없습니다.
      </p>
    );
  }

  if (status === "loading" || !inquiry) {
    return (
      <p className="card-premium rounded-3xl p-8 text-center text-sm text-zinc-500">
        <Loader2 size={18} className="mx-auto animate-spin" />
      </p>
    );
  }

  // ── 열람 ──
  return (
    <article className="card-premium rounded-3xl p-6 sm:p-8">
      <header className="border-b border-white/10 pb-5">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-black text-white">{inquiry.title}</h1>
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            aria-label="문의 삭제"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-red-400/20 px-4 text-sm font-bold text-red-200 transition hover:bg-red-500/10 disabled:opacity-60"
          >
            <Trash2 size={14} />삭제
          </button>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          {inquiry.authorName} · {formatNoticeDate(inquiry.createdAt)}
        </p>
      </header>

      <div className="whitespace-pre-wrap pt-6 leading-8 text-zinc-200">
        {inquiry.content}
      </div>

      {/* 답변 */}
      {inquiry.answer && (
        <div className="mt-8 rounded-3xl border border-gold/20 bg-gold/5 p-6">
          <p className="text-sm font-black text-gold">답변</p>
          <div className="mt-3 whitespace-pre-wrap leading-8 text-zinc-200">
            {inquiry.answer}
          </div>
        </div>
      )}

      {/* 관리자 답변 작성/수정 */}
      {isAdmin && (
        <div className="mt-8">
          <p className="mb-2 text-sm font-black text-gold">
            {inquiry.answer ? "답변 수정" : "답변 작성"}
          </p>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            maxLength={20000}
            className="w-full resize-y rounded-2xl border border-white/10 bg-black/30 px-4 py-3 leading-7 text-white outline-none transition focus:border-gold/50"
            placeholder="답변 내용을 입력해주세요."
          />
          <button
            type="button"
            onClick={submitAnswer}
            disabled={busy}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-sm font-black text-black transition hover:brightness-110 disabled:opacity-60"
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            {inquiry.answer ? "답변 수정" : "답변 등록"}
          </button>
        </div>
      )}

      {error && <p className="mt-4 text-sm font-bold text-red-300">{error}</p>}
    </article>
  );
}
