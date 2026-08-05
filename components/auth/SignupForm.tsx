"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { NATIONALITIES, POSITIONS } from "@/components/booster/adminBoosterConstants";

const inputCls =
  "rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50 w-full";
const labelCls = "grid gap-2 text-sm font-bold text-zinc-300";

const TIER_OPTIONS = [
  { label: "챌린저", rank: "Challenger", tier: "/images/tier/10-challenger.png" },
  { label: "그랜드마스터", rank: "Grandmaster", tier: "/images/tier/9-grandmaster.png" },
];

type SignupBody = {
  username: string;
  password: string;
  role: "customer" | "booster";
  code?: string;
  name?: string;
  rank?: string;
  tier?: string;
  nationality?: number;
  positions?: string;
  weekdayHours?: string;
  weekendHours?: string;
  services?: string;
  description?: string;
};

export default function SignupForm() {
  const [role, setRole] = useState<"customer" | "booster">("customer");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  // 기사 전용 필드
  const [code, setCode] = useState("");
  const [codeVerified, setCodeVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [name, setName] = useState("");
  const [tier, setTier] = useState("");
  const [nationality, setNationality] = useState("1");
  const [positionSet, setPositionSet] = useState<Set<string>>(new Set());
  const [weekdayHours, setWeekdayHours] = useState("");
  const [weekendHours, setWeekendHours] = useState("");
  const [serviceBoost, setServiceBoost] = useState(false);
  const [serviceDuo, setServiceDuo] = useState(false);
  const [description, setDescription] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const togglePosition = (p: string) =>
    setPositionSet((s) => {
      const n = new Set(s);
      if (n.has(p)) n.delete(p);
      else n.add(p);
      return n;
    });

  // 기사 가입 1단계: 코드부터 인증. 유효하면 프로필 입력 단계로 넘어간다.
  // 최종 소진은 가입 제출 시(consumeCode) 하므로 여기선 유효성만 확인한다.
  const verifyCodeStep = async () => {
    const c = code.trim();
    if (!c) {
      setMessage("가입 코드를 입력해주세요.");
      return;
    }
    setVerifying(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: c }),
      });
      const data = (await res.json()) as { valid?: boolean; message?: string };
      if (res.ok && data.valid) {
        setCodeVerified(true);
        setMessage("");
      } else {
        setMessage(data.message ?? "유효하지 않거나 이미 사용된 가입 코드입니다.");
      }
    } catch {
      setMessage("코드 확인에 실패했습니다.");
    } finally {
      setVerifying(false);
    }
  };

  const resetCode = () => {
    setCodeVerified(false);
    setCode("");
    setMessage("");
  };

  const selectRole = (value: "customer" | "booster") => {
    setRole(value);
    setCodeVerified(false);
    setMessage("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const u = username.trim();
    const pw = password.trim();
    if (!u || !pw) {
      setMessage("아이디와 비밀번호를 입력해주세요.");
      return;
    }
    if (pw.length < 8) {
      setMessage("비밀번호는 8자 이상이어야 합니다.");
      return;
    }
    if (pw !== confirm.trim()) {
      setMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    let body: SignupBody = { username: u, password: pw, role };

    if (role === "booster") {
      if (!codeVerified || !code.trim()) {
        setMessage("가입 코드를 먼저 인증해주세요.");
        return;
      }
      if (
        !name.trim() ||
        !tier ||
        positionSet.size === 0 ||
        !weekdayHours.trim() ||
        !weekendHours.trim() ||
        (!serviceBoost && !serviceDuo) ||
        description.trim().length < 10
      ) {
        setMessage("기사 프로필을 모두 입력해주세요. (소개 10자 이상)");
        return;
      }
      const rank = TIER_OPTIONS.find((t) => t.tier === tier)?.rank ?? "";
      body = {
        ...body,
        code: code.trim(),
        name: name.trim(),
        rank,
        tier,
        nationality: Number(nationality),
        positions: Array.from(positionSet).join(","),
        weekdayHours: weekdayHours.trim(),
        weekendHours: weekendHours.trim(),
        services: [serviceBoost && "대리", serviceDuo && "듀오"]
          .filter(Boolean)
          .join(","),
        description: description.trim(),
      };
    }

    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        setMessage(data.message ?? "회원가입에 실패했습니다.");
        return;
      }
      // 기사는 답글 관리(/review), 일반회원은 마이페이지.
      router.push(role === "booster" ? "/review" : "/mypage");
      router.refresh();
    } catch {
      setMessage("회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const roleBtn = (value: "customer" | "booster", label: string) => (
    <button
      type="button"
      onClick={() => selectRole(value)}
      className={`flex-1 rounded-2xl px-4 py-3 text-sm font-black transition ${
        role === value
          ? "bg-gold-gradient text-black"
          : "border border-white/10 bg-black/30 text-zinc-400 hover:text-white"
      }`}
    >
      {label}
    </button>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="card-premium mx-auto max-w-xl rounded-[34px] p-6 sm:p-8"
    >
      <p className="text-xs font-black uppercase tracking-[0.22em] text-gold">
        SIGN UP
      </p>
      <h1 className="mt-3 text-2xl font-black text-white">회원가입</h1>

      <div className="mt-6 flex gap-2">
        {roleBtn("customer", "일반회원")}
        {roleBtn("booster", "기사")}
      </div>
      {role === "booster" && !codeVerified ? (
        <div className="mt-6 grid gap-4">
          <p className="text-xs text-zinc-500">
            기사는 관리자에게 받은 가입 코드가 필요합니다. 먼저 코드를 인증해주세요.
          </p>
          <label className={labelCls}>
            가입 코드
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  verifyCodeStep();
                }
              }}
              className={inputCls}
              placeholder="관리자에게 받은 코드"
              autoComplete="off"
            />
          </label>
          {message && (
            <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
              {message}
            </p>
          )}
          <button
            type="button"
            onClick={verifyCodeStep}
            disabled={verifying}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient px-7 py-4 font-black text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {verifying && <Loader2 size={18} className="animate-spin" />}
            코드 확인
          </button>
        </div>
      ) : (
      <>
      {role === "booster" && (
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3">
          <span className="text-sm font-bold text-emerald-200">
            가입 코드 인증됨
          </span>
          <button
            type="button"
            onClick={resetCode}
            className="text-xs font-bold text-zinc-400 transition hover:text-white"
          >
            다시 입력
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-4">
        <label className={labelCls}>
          아이디
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={inputCls}
            placeholder="영문 소문자·숫자·밑줄 3~30자"
            autoComplete="username"
          />
        </label>
        <label className={labelCls}>
          비밀번호
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
            placeholder="8자 이상"
            autoComplete="new-password"
          />
        </label>
        <label className={labelCls}>
          비밀번호 확인
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputCls}
            placeholder="비밀번호 다시 입력"
            autoComplete="new-password"
          />
        </label>

        {role === "booster" && (
          <>
            <label className={labelCls}>
              기사 닉네임
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                className={inputCls}
                placeholder="공개될 기사 닉네임"
              />
            </label>
            <label className={labelCls}>
              티어
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className={inputCls}
              >
                <option value="" disabled>
                  선택해주세요
                </option>
                {TIER_OPTIONS.map((opt) => (
                  <option key={opt.tier} value={opt.tier}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className={labelCls}>
              국적
              <select
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                className={inputCls}
              >
                {NATIONALITIES.map((n) => (
                  <option key={n.value} value={n.value}>
                    {n.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-2">
              <span className="text-sm font-bold text-zinc-300">포지션</span>
              <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-2xl border border-white/10 p-3">
                {POSITIONS.map((pos) => (
                  <label
                    key={pos}
                    className="flex cursor-pointer items-center gap-2 text-sm font-bold text-zinc-300"
                  >
                    <input
                      type="checkbox"
                      checked={positionSet.has(pos)}
                      onChange={() => togglePosition(pos)}
                      className="h-4 w-4 accent-gold"
                    />
                    {pos}
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className={labelCls}>
                평일 작업시간
                <input
                  value={weekdayHours}
                  onChange={(e) => setWeekdayHours(e.target.value)}
                  maxLength={30}
                  className={inputCls}
                  placeholder="예: 10:00 ~ 24:00"
                />
              </label>
              <label className={labelCls}>
                주말 작업시간
                <input
                  value={weekendHours}
                  onChange={(e) => setWeekendHours(e.target.value)}
                  maxLength={30}
                  className={inputCls}
                  placeholder="예: ALL"
                />
              </label>
            </div>
            <div className="grid gap-2">
              <span className="text-sm font-bold text-zinc-300">작업 종류</span>
              <div className="flex gap-6 rounded-2xl border border-white/10 p-3">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-zinc-300">
                  <input
                    type="checkbox"
                    checked={serviceBoost}
                    onChange={(e) => setServiceBoost(e.target.checked)}
                    className="h-4 w-4 accent-gold"
                  />
                  대리
                </label>
                <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-zinc-300">
                  <input
                    type="checkbox"
                    checked={serviceDuo}
                    onChange={(e) => setServiceDuo(e.target.checked)}
                    className="h-4 w-4 accent-gold"
                  />
                  듀오
                </label>
              </div>
            </div>
            <label className={labelCls}>
              소개
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={300}
                rows={3}
                className={`${inputCls} resize-none leading-7`}
                placeholder="기사 소개를 입력해주세요. (10자 이상)"
              />
            </label>
          </>
        )}
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
      </>
      )}

      <p className="mt-5 text-center text-sm text-zinc-500">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="font-bold text-gold hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
