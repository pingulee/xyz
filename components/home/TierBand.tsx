import Image from "next/image";
import { ChevronRight } from "lucide-react";

// 전 구간 지원 시각화 — 챌린저 기사(gotoc) 앞세워 언랭 → 챌린저 화살표 진행.
function TierNode({
  file,
  label,
  goal,
}: {
  file: string;
  label: string;
  goal?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <span
        className={`grid h-20 w-20 place-items-center rounded-2xl border sm:h-24 sm:w-24 ${
          goal
            ? "border-gold/60 bg-gold/12 shadow-gold-sm ring-1 ring-gold/30"
            : "border-white/10 bg-white/3 opacity-75"
        }`}
      >
        <Image
          src={`/images/tier/${file}.png`}
          alt={`${label} 구간 롤 대리·듀오`}
          width={64}
          height={64}
          loading="lazy"
          sizes="64px"
          className="h-12 w-12 object-contain sm:h-14 sm:w-14"
        />
      </span>
      <span
        className={`text-xs font-black sm:text-sm ${
          goal ? "gold-text" : "text-zinc-400"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

function ProgressArrow() {
  return (
    <div
      aria-hidden="true"
      className="mb-6 flex items-center text-gold sm:mb-7"
    >
      <span className="h-1 w-10 rounded-full bg-linear-to-r from-white/15 to-gold sm:w-20" />
      <ChevronRight size={22} className="-ml-1" strokeWidth={3} />
    </div>
  );
}

export default function TierBand() {
  return (
    <div className="card-premium relative isolate overflow-hidden rounded-4xl p-6 sm:p-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold/15 blur-3xl"
      />

      <div className="relative flex flex-col items-center justify-center gap-8 lg:flex-row lg:gap-12">
        {/* 챌린저 기사 */}
        <figure className="relative shrink-0 text-center">
          <div
            aria-hidden="true"
            className="absolute -inset-2 rounded-[30px] bg-gold/20 blur-xl"
          />
          <div className="relative h-36 w-36 overflow-hidden rounded-[26px] border border-gold/40 bg-void shadow-gold-sm sm:h-40 sm:w-40">
            <Image
              src="/images/gotoc.png"
              alt="XYZ 챌린저 대리 기사"
              fill
              sizes="160px"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-3 text-[11px] font-black uppercase tracking-[0.2em] text-gold">
            챌린저 기사
          </figcaption>
        </figure>

        {/* 언랭 → 챌린저 */}
        <div className="flex items-end gap-3 sm:gap-5">
          <TierNode file="0-unrank" label="언랭" />
          <ProgressArrow />
          <TierNode file="10-challenger" label="챌린저" goal />
        </div>
      </div>

      <p className="relative mt-8 text-center text-sm leading-7 text-pretty text-zinc-300 sm:text-base">
        현재 시즌 챌린저 기사가 전담 배정되어{" "}
        <b className="gold-text font-black">단 3주 만에 언랭 → 그랜드마스터</b>
        까지 안정적으로 끌어올립니다.
      </p>
    </div>
  );
}
