"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import type { LolNickname } from "@/lib/users";

const inputCls =
  "w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50";
const labelCls = "grid gap-2 text-sm font-bold text-zinc-300";
const cardCls = "card-premium rounded-3xl p-6";
const btnCls =
  "inline-flex items-center justify-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-sm font-black text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60";

type Msg = { text: string; ok: boolean } | null;

function Notice({ msg }: { msg: Msg }) {
  if (!msg) return null;
  return (
    <p
      className={`rounded-2xl border px-4 py-3 text-sm font-bold ${
        msg.ok
          ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
          : "border-red-400/20 bg-red-500/10 text-red-200"
      }`}
    >
      {msg.text}
    </p>
  );
}

// 마이페이지 계정 설정: 롤 닉네임 관리 + 이메일 변경 + 비밀번호 변경.
// 모든 변경은 세션 게이트된 /api/account/* 로 나가고, 서버가 재검증한다.
export default function MyAccountSettings({
  initialEmail,
  initialNicknames,
}: {
  initialEmail: string | null;
  initialNicknames: LolNickname[];
}) {
  // ── 닉네임 ──
  const [nicknames, setNicknames] = useState<LolNickname[]>(initialNicknames);
  const [nickInput, setNickInput] = useState("");
  const [nickBusy, setNickBusy] = useState(false);
  const [nickMsg, setNickMsg] = useState<Msg>(null);

  const addNick = async () => {
    const riotId = nickInput.trim();
    if (!riotId) return;
    setNickBusy(true);
    setNickMsg(null);
    try {
      const res = await fetch("/api/account/nicknames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riotId }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        id?: number;
        riotId?: string;
        message?: string;
      };
      if (res.ok && data.id) {
        setNicknames((list) => [...list, { id: data.id!, riotId: data.riotId! }]);
        setNickInput("");
        setNickMsg({ text: "등록되었습니다.", ok: true });
      } else {
        setNickMsg({ text: data.message ?? "등록에 실패했습니다.", ok: false });
      }
    } catch {
      setNickMsg({ text: "등록에 실패했습니다.", ok: false });
    } finally {
      setNickBusy(false);
    }
  };

  const delNick = async (id: number) => {
    const res = await fetch("/api/account/nicknames", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) setNicknames((list) => list.filter((n) => n.id !== id));
  };

  // ── 이메일 ──
  const [email, setEmail] = useState(initialEmail ?? "");
  const [emailInput, setEmailInput] = useState(initialEmail ?? "");
  const [emailPw, setEmailPw] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailMsg, setEmailMsg] = useState<Msg>(null);

  const changeEmail = async () => {
    setEmailBusy(true);
    setEmailMsg(null);
    try {
      const res = await fetch("/api/account/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim(), currentPassword: emailPw }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        email?: string;
        message?: string;
      };
      if (res.ok) {
        setEmail(data.email ?? emailInput.trim());
        setEmailPw("");
        setEmailMsg({ text: "이메일이 변경되었습니다.", ok: true });
      } else {
        setEmailMsg({ text: data.message ?? "변경에 실패했습니다.", ok: false });
      }
    } catch {
      setEmailMsg({ text: "변경에 실패했습니다.", ok: false });
    } finally {
      setEmailBusy(false);
    }
  };

  // ── 비밀번호 ──
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState<Msg>(null);

  const changePassword = async () => {
    if (newPw.length < 8) {
      setPwMsg({ text: "새 비밀번호는 8자 이상이어야 합니다.", ok: false });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ text: "새 비밀번호가 일치하지 않습니다.", ok: false });
      return;
    }
    setPwBusy(true);
    setPwMsg(null);
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (res.ok) {
        setCurPw("");
        setNewPw("");
        setConfirmPw("");
        setPwMsg({ text: "비밀번호가 변경되었습니다.", ok: true });
      } else {
        setPwMsg({ text: data.message ?? "변경에 실패했습니다.", ok: false });
      }
    } catch {
      setPwMsg({ text: "변경에 실패했습니다.", ok: false });
    } finally {
      setPwBusy(false);
    }
  };

  return (
    <div className="mt-6 grid gap-4">
      {/* 롤 닉네임 */}
      <section className={cardCls}>
        <p className="text-sm font-black text-gold">롤 닉네임 (Riot ID)</p>
        {nicknames.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {nicknames.map((n) => (
              <span
                key={n.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-sm font-bold text-gold"
              >
                <Check size={13} />
                {n.riotId}
                <button
                  type="button"
                  onClick={() => delNick(n.id)}
                  aria-label={`${n.riotId} 삭제`}
                  className="text-gold/70 transition hover:text-white"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">등록된 롤 닉네임이 없습니다.</p>
        )}
        <div className="mt-4 flex gap-2">
          <input
            value={nickInput}
            onChange={(e) => setNickInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addNick();
              }
            }}
            maxLength={40}
            className={inputCls}
            placeholder="소환사명#KR1"
            autoComplete="off"
          />
          <button type="button" onClick={addNick} disabled={nickBusy} className={btnCls}>
            {nickBusy && <Loader2 size={15} className="animate-spin" />}
            추가
          </button>
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          추가 시 op.gg로 실존을 확인합니다. 최대 10개.
        </p>
        <div className="mt-2">
          <Notice msg={nickMsg} />
        </div>
      </section>

      {/* 이메일 */}
      <section className={cardCls}>
        <p className="text-sm font-black text-gold">이메일</p>
        <p className="mt-1 text-sm text-zinc-400">
          현재: {email || "미설정"}
        </p>
        <div className="mt-4 grid gap-3">
          <label className={labelCls}>
            새 이메일
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              maxLength={255}
              className={inputCls}
              placeholder="new@email.com"
              autoComplete="email"
            />
          </label>
          <label className={labelCls}>
            현재 비밀번호
            <input
              type="password"
              value={emailPw}
              onChange={(e) => setEmailPw(e.target.value)}
              className={inputCls}
              placeholder="본인 확인용"
              autoComplete="current-password"
            />
          </label>
          <Notice msg={emailMsg} />
          <button
            type="button"
            onClick={changeEmail}
            disabled={emailBusy}
            className={`${btnCls} w-fit`}
          >
            {emailBusy && <Loader2 size={15} className="animate-spin" />}
            이메일 변경
          </button>
        </div>
      </section>

      {/* 비밀번호 */}
      <section className={cardCls}>
        <p className="text-sm font-black text-gold">비밀번호 변경</p>
        <div className="mt-4 grid gap-3">
          <label className={labelCls}>
            현재 비밀번호
            <input
              type="password"
              value={curPw}
              onChange={(e) => setCurPw(e.target.value)}
              className={inputCls}
              autoComplete="current-password"
            />
          </label>
          <label className={labelCls}>
            새 비밀번호
            <input
              type="password"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className={inputCls}
              placeholder="8자 이상"
              autoComplete="new-password"
            />
          </label>
          <label className={labelCls}>
            새 비밀번호 확인
            <input
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className={inputCls}
              autoComplete="new-password"
            />
          </label>
          <Notice msg={pwMsg} />
          <button
            type="button"
            onClick={changePassword}
            disabled={pwBusy}
            className={`${btnCls} w-fit`}
          >
            {pwBusy && <Loader2 size={15} className="animate-spin" />}
            비밀번호 변경
          </button>
        </div>
      </section>
    </div>
  );
}
