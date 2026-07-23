import Image from "next/image";
import { Zap } from "lucide-react";

// 챌린저 기사 하이라이트 — 언랭 → 그랜드마스터 3주 달성 소구
export default function ChallengerHighlight() {
  return (
    <div className="card-premium relative isolate overflow-hidden rounded-4xl p-6 sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/15 blur-3xl"
      />
      <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
        <div className="relative shrink-0">
          <div className="absolute -inset-2 rounded-[30px] bg-gold/20 blur-xl" />
          <div className="relative h-36 w-36 overflow-hidden rounded-[26px] border border-gold/40 bg-void shadow-gold-sm sm:h-40 sm:w-40">
            <Image
              src="/images/gotoc.png"
              alt="XYZ 챌린저 대리 기사"
              fill
              sizes="160px"
              className="object-cover"
            />
          </div>
        </div>

        <div className="text-center sm:text-left">
          <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.24em] text-gold">
            <Zap size={13} aria-hidden="true" /> Challenger Booster
          </p>
          <h3 className="mt-3 text-2xl font-black leading-snug tracking-tight text-balance text-white sm:text-3xl">
            챌린저 기사, <span className="gold-text">단 3주 만에</span>
            <br className="hidden sm:block" /> 언랭 → 그랜드마스터 달성
          </h3>
          <p className="mt-4 max-w-xl text-sm leading-7 text-pretty text-zinc-300 sm:text-base">
            현재 시즌 챌린저 기사가 전담 배정됩니다. 언랭 계정도 단 3주 만에
            그랜드마스터 구간까지 안정적으로 끌어올립니다.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 sm:justify-start">
            {["현시즌 챌린저", "3주 완성", "언랭 → 그랜드마스터"].map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-xs font-bold text-gold-soft"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
