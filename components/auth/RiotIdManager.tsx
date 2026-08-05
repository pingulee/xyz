"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";

const inputCls =
  "flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50";

// 롤 닉네임(Riot ID) 입력 + "확인" 버튼. op.gg로 실존 확인된 것만 칩으로 추가된다.
// value(nicknames)는 부모가 소유하고, 추가/삭제를 onChange로 올린다.
export default function RiotIdManager({
  nicknames,
  onChange,
  max = 10,
}: {
  nicknames: string[];
  onChange: (list: string[]) => void;
  max?: number;
}) {
  const [input, setInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  const verify = async () => {
    const rid = input.trim();
    if (!rid) {
      setError("Riot ID를 입력해주세요.");
      return;
    }
    if (nicknames.includes(rid)) {
      setError("이미 추가된 Riot ID입니다.");
      return;
    }
    if (nicknames.length >= max) {
      setError(`최대 ${max}개까지 등록할 수 있습니다.`);
      return;
    }
    setVerifying(true);
    setError("");
    try {
      const res = await fetch("/api/riot/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riotId: rid }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        valid?: boolean;
        message?: string;
      };
      if (res.ok && data.valid) {
        onChange([...nicknames, rid]);
        setInput("");
      } else {
        setError(data.message ?? "확인에 실패했습니다.");
      }
    } catch {
      setError("확인에 실패했습니다.");
    } finally {
      setVerifying(false);
    }
  };

  const remove = (rid: string) =>
    onChange(nicknames.filter((n) => n !== rid));

  return (
    <div className="grid gap-2">
      <span className="text-sm font-bold text-zinc-300">롤 닉네임 (Riot ID)</span>

      {nicknames.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {nicknames.map((rid) => (
            <span
              key={rid}
              className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 text-sm font-bold text-gold"
            >
              <Check size={13} />
              {rid}
              <button
                type="button"
                onClick={() => remove(rid)}
                aria-label={`${rid} 삭제`}
                className="text-gold/70 transition hover:text-white"
              >
                <X size={14} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              verify();
            }
          }}
          maxLength={40}
          className={inputCls}
          placeholder="소환사명#KR1"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={verify}
          disabled={verifying}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-gold/40 px-5 py-3 text-sm font-black text-gold transition hover:bg-gold/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {verifying && <Loader2 size={15} className="animate-spin" />}
          확인
        </button>
      </div>
      <p className="text-xs text-zinc-500">
        확인 버튼을 눌러 실존하는 Riot ID만 등록됩니다. (op.gg 조회)
      </p>
      {error && <p className="text-xs font-bold text-red-300">{error}</p>}
    </div>
  );
}
