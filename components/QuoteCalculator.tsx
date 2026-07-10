"use client";

import { useState } from "react";
import Image from "next/image";
import { Calculator, MessageCircle, Minus, Plus } from "lucide-react";
import { site } from "@/lib/site";

const T = {
  iron: "/images/tier/1-iron.png",
  bronze: "/images/tier/2-bronze.png",
  silver: "/images/tier/3-silver.png",
  gold: "/images/tier/4-gold.png",
  platinum: "/images/tier/5-platinum.png",
  emerald: "/images/tier/6-emerald.png",
  diamond: "/images/tier/7-diamond.png",
  master: "/images/tier/8-master.png",
  grandmaster: "/images/tier/9-grandmaster.png",
};

type Bracket = {
  label: string;
  icons: string[];
  /** null이면 상담 후 안내 */
  price: number | null;
  guarantee?: string;
};

type Mode = {
  key: string;
  label: string;
  /** 수량 입력 라벨 (예: 신청 시간) */
  qtyLabel: string;
  /** 수량 단위 (예: 시간) */
  unit: string;
  /** 단가가 적용되는 수량 (시간제·승리제 1, 점수제 100) */
  per: number;
  step: number;
  min: number;
  max: number;
  defaultQty: number;
  brackets: Bracket[];
  note: string;
};

const BOOST_MODES: Mode[] = [
  {
    key: "hourly",
    label: "시간제",
    qtyLabel: "신청 시간",
    unit: "시간",
    per: 1,
    step: 1,
    min: 1,
    max: 200,
    defaultQty: 10,
    brackets: [
      { label: "아이언 · 브론즈 · 실버", icons: [T.iron, T.bronze, T.silver], price: 12000, guarantee: "90%" },
      { label: "골드", icons: [T.gold], price: 14000, guarantee: "85%" },
      { label: "플래티넘", icons: [T.platinum], price: 16000, guarantee: "80%" },
      { label: "에메랄드", icons: [T.emerald], price: 18000, guarantee: "75%" },
      { label: "다이아몬드 4~3", icons: [T.diamond], price: 20000, guarantee: "70%" },
      { label: "다이아몬드 2~1", icons: [T.diamond], price: 24000, guarantee: "65%" },
      { label: "듀오 불가", icons: [T.diamond], price: 26000, guarantee: "60%" },
      { label: "마스터 0~99 LP", icons: [T.master], price: 26000, guarantee: "60%" },
      { label: "그랜드마스터 이상", icons: [T.grandmaster], price: null },
    ],
    note: "· 승률 보장 서비스는 10시간 이상 신청 시 적용됩니다.\n· 마스터 200 LP 당 +2,000원이 가산됩니다.\n· 기사가 캐리했음에 불구하고 발생한 패배는 승리로 인정하여 승률을 산정합니다.",
  },
  {
    key: "win",
    label: "승리 보장제",
    qtyLabel: "신청 승 수",
    unit: "승",
    per: 1,
    step: 1,
    min: 1,
    max: 200,
    defaultQty: 5,
    brackets: [
      { label: "아이언 · 브론즈 · 실버", icons: [T.iron, T.bronze, T.silver], price: 5000 },
      { label: "골드", icons: [T.gold], price: 6000 },
      { label: "플래티넘", icons: [T.platinum], price: 7000 },
      { label: "에메랄드", icons: [T.emerald], price: 8000 },
      { label: "다이아몬드 4~3", icons: [T.diamond], price: 12000 },
      { label: "다이아몬드 2~1", icons: [T.diamond], price: 14000 },
    ],
    note: "· 패배 시 승리를 복구해드립니다. [신청 승 수 + 패배 수 = 총 승 수] (예: 2승 신청 → 2패 → 총 4승 2패로 마무리)",
  },
  {
    key: "score",
    label: "점수 보장제",
    qtyLabel: "상승 점수",
    unit: "점",
    per: 100,
    step: 10,
    min: 10,
    max: 2000,
    defaultQty: 100,
    brackets: [
      { label: "듀오 불가", icons: [T.diamond], price: 180000 },
      { label: "마스터 0~199 LP", icons: [T.master], price: 180000 },
      { label: "그랜드마스터 이상", icons: [T.grandmaster], price: null },
    ],
    note: "· 점수는 10단위 반올림을 적용합니다. (예: 92점 상승, 106점 상승 → 100점으로 계산)\n· 마스터 200 LP 단위 +20,000원이 가산됩니다.\n· 그랜드마스터 이상 구간은 실시간 시세를 반영하여 가격이 결정됩니다.",
  },
];

const DUO_MODES: Mode[] = [
  {
    key: "hourly",
    label: "시간제",
    qtyLabel: "신청 시간",
    unit: "시간",
    per: 1,
    step: 1,
    min: 1,
    max: 200,
    defaultQty: 10,
    brackets: [
      { label: "아이언 · 브론즈 · 실버", icons: [T.iron, T.bronze, T.silver], price: 14000, guarantee: "90%" },
      { label: "골드", icons: [T.gold], price: 16000, guarantee: "85%" },
      { label: "플래티넘", icons: [T.platinum], price: 18000, guarantee: "80%" },
      { label: "에메랄드", icons: [T.emerald], price: 20000, guarantee: "75%" },
      { label: "다이아몬드 4~3", icons: [T.diamond], price: 22000, guarantee: "70%" },
      { label: "다이아몬드 2~1", icons: [T.diamond], price: 24000, guarantee: "65%" },
    ],
    note: "· 승률 보장 서비스는 10시간 이상 신청 시 적용됩니다.\n· 기사가 캐리했음에 불구하고 발생한 패배는 승리로 인정하여 승률을 산정합니다.",
  },
  {
    key: "win",
    label: "승리 보장제",
    qtyLabel: "신청 승 수",
    unit: "승",
    per: 1,
    step: 1,
    min: 1,
    max: 200,
    defaultQty: 5,
    brackets: [
      { label: "아이언 · 브론즈 · 실버", icons: [T.iron, T.bronze, T.silver], price: 37500 },
      { label: "골드", icons: [T.gold], price: 45000 },
      { label: "플래티넘", icons: [T.platinum], price: 80000 },
      { label: "에메랄드", icons: [T.emerald], price: 52500 },
      { label: "다이아몬드", icons: [T.diamond], price: 60000 },
    ],
    note: "· 고객님이 고의로 패배한 경우 승률 보장 서비스가 적용되지 않습니다.",
  },
];

const SERVICES = [
  { key: "boost", label: "롤 대리", modes: BOOST_MODES },
  { key: "duo", label: "롤 듀오", modes: DUO_MODES },
] as const;

function formatWon(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

export default function QuoteCalculator() {
  const [serviceKey, setServiceKey] = useState<"boost" | "duo">("boost");
  const [modeKey, setModeKey] = useState("hourly");
  const [bracketIdx, setBracketIdx] = useState(0);
  const [qty, setQty] = useState(10);

  const service = SERVICES.find((s) => s.key === serviceKey) ?? SERVICES[0];
  const mode = service.modes.find((m) => m.key === modeKey) ?? service.modes[0];
  const bracket = mode.brackets[bracketIdx] ?? mode.brackets[0];

  const selectMode = (nextService: "boost" | "duo", nextModeKey: string) => {
    const svc = SERVICES.find((s) => s.key === nextService) ?? SERVICES[0];
    const next = svc.modes.find((m) => m.key === nextModeKey) ?? svc.modes[0];
    setServiceKey(nextService);
    setModeKey(next.key);
    setBracketIdx(0);
    setQty(next.defaultQty);
  };

  const clampQty = (value: number) =>
    Math.min(mode.max, Math.max(mode.min, value));

  // 점수 보장제는 10단위 반올림 후 계산
  const effectiveQty =
    mode.step > 1 ? Math.max(mode.step, Math.round(qty / mode.step) * mode.step) : qty;
  const amount =
    bracket.price !== null
      ? Math.round((bracket.price * effectiveQty) / mode.per)
      : null;
  const guaranteePending =
    mode.key === "hourly" && bracket.guarantee && qty < 10;

  const pillCls = (active: boolean) =>
    `rounded-full px-5 py-2.5 text-sm font-black transition ${
      active
        ? "bg-gold-gradient text-black"
        : "border border-white/10 text-zinc-400 hover:border-gold/40 hover:text-white"
    }`;

  return (
    <div className="card-premium rounded-4xl p-6 md:p-8">
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-7">
          {/* 서비스 */}
          <div>
            <p className="text-xs font-black text-zinc-500">서비스</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SERVICES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => selectMode(s.key, modeKey)}
                  className={pillCls(s.key === serviceKey)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 방식 */}
          <div>
            <p className="text-xs font-black text-zinc-500">진행 방식</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {service.modes.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => selectMode(serviceKey, m.key)}
                  className={pillCls(m.key === mode.key)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* 구간 */}
          <div>
            <p className="text-xs font-black text-zinc-500">구간</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {mode.brackets.map((b, i) => (
                <button
                  key={b.label}
                  type="button"
                  onClick={() => setBracketIdx(i)}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                    i === bracketIdx
                      ? "border-gold/60 bg-gold/10"
                      : "border-white/8 bg-white/3 hover:border-gold/25"
                  }`}
                >
                  <span className="flex shrink-0 items-center -space-x-2.5">
                    {b.icons.map((src, iconIdx) => (
                      <Image
                        key={iconIdx}
                        src={src}
                        alt=""
                        width={28}
                        height={28}
                        className="rounded-full"
                        style={{ zIndex: b.icons.length - iconIdx }}
                      />
                    ))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-white">
                      {b.label}
                    </span>
                    {b.guarantee && (
                      <span className="block text-xs text-zinc-500">
                        승률 {b.guarantee} 보장
                      </span>
                    )}
                  </span>
                  <span className="shrink-0 text-right">
                    {b.price !== null ? (
                      <>
                        <span className="block text-sm font-black text-gold">
                          {formatWon(b.price)}
                        </span>
                        <span className="block text-[11px] text-zinc-500">
                          {mode.per === 1 ? `1${mode.unit}` : `${mode.per}${mode.unit}`}{" "}
                          단위
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-zinc-500">상담</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 수량 */}
          <div>
            <p className="text-xs font-black text-zinc-500">{mode.qtyLabel}</p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQty((q) => clampQty(q - mode.step))}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 text-zinc-300 transition hover:border-gold/40 hover:text-white"
                aria-label="감소"
              >
                <Minus size={15} />
              </button>
              <div className="relative w-32">
                <input
                  type="number"
                  value={qty}
                  min={mode.min}
                  max={mode.max}
                  step={mode.step}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setQty(Number.isFinite(value) ? clampQty(value) : mode.min);
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 pr-12 text-center font-black text-white outline-none transition focus:border-gold/50"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500">
                  {mode.unit}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setQty((q) => clampQty(q + mode.step))}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/10 text-zinc-300 transition hover:border-gold/40 hover:text-white"
                aria-label="증가"
              >
                <Plus size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* 예상 견적 */}
        <div className="rounded-3xl border border-gold/25 bg-black/30 p-6">
          <div className="flex items-center gap-2 text-sm font-black text-gold">
            <Calculator size={16} />
            예상 견적
          </div>

          <div className="mt-5 grid gap-1.5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-zinc-500">서비스</span>
              <span className="font-bold text-zinc-200">
                {service.label} · {mode.label}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-zinc-500">구간</span>
              <span className="font-bold text-zinc-200">{bracket.label}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-zinc-500">{mode.qtyLabel}</span>
              <span className="font-bold text-zinc-200">
                {effectiveQty.toLocaleString("ko-KR")}
                {mode.unit}
              </span>
            </div>
            {bracket.guarantee && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-zinc-500">승률 보장</span>
                <span className="font-bold text-zinc-200">
                  {guaranteePending ? "10시간 이상 신청 시" : `${bracket.guarantee} 보장`}
                </span>
              </div>
            )}
          </div>

          <div className="mt-5 border-t border-white/8 pt-5">
            {amount !== null ? (
              <>
                <p className="text-xs text-zinc-500">
                  {formatWon(bracket.price ?? 0)} ×{" "}
                  {mode.per === 1
                    ? `${effectiveQty.toLocaleString("ko-KR")}${mode.unit}`
                    : `${effectiveQty.toLocaleString("ko-KR")}${mode.unit} ÷ ${mode.per}`}
                </p>
                <p className="mt-1 text-3xl font-black text-white">
                  {formatWon(amount)}
                </p>
              </>
            ) : (
              <p className="text-2xl font-black text-white">상담 후 안내</p>
            )}
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              실제 견적은 계정 상태와 요청 사항에 따라 달라질 수 있으며, 상담 후
              확정됩니다.
            </p>
          </div>

          <a
            href={site.kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient px-6 py-3.5 text-sm font-black text-black transition hover:brightness-110"
          >
            <MessageCircle size={15} />이 견적으로 상담하기
          </a>

          <p className="mt-4 whitespace-pre-line text-[11px] leading-5 text-zinc-600">
            {mode.note}
          </p>
        </div>
      </div>
    </div>
  );
}
