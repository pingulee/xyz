import Image from "next/image";
import { ChevronRight } from "lucide-react";

// 전 구간 지원 시각화 — 뒤에 언랭 → 챌린저 진행 레일, 앞에 챌린저 기사(투명 PNG) 크게.
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
    <div className="flex flex-col items-center gap-2">
      <span
        className={`grid h-16 w-16 place-items-center rounded-2xl border sm:h-20 sm:w-20 ${
          goal
            ? "border-gold/60 bg-gold/12 shadow-gold-sm ring-1 ring-gold/30"
            : "border-white/10 bg-white/3 opacity-80"
        }`}
      >
        <Image
          src={`/images/tier/${file}.png`}
          alt={`${label} 구간 롤 대리·듀오`}
          width={56}
          height={56}
          loading="lazy"
          sizes="56px"
          className="h-10 w-10 object-contain sm:h-12 sm:w-12"
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

export default function TierBand() {
  return (
    <div>
      <div className="relative mx-auto flex max-w-3xl items-center justify-center">
        {/* 뒤: 언랭 → 챌린저 진행 레일 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-1/2 z-0 flex -translate-y-1/2 items-center sm:inset-x-12"
        >
          <span className="h-1 flex-1 rounded-full bg-linear-to-r from-white/15 via-gold/40 to-gold" />
          <ChevronRight
            size={22}
            strokeWidth={3}
            className="-ml-1 text-gold"
          />
        </div>

        {/* 뒤: 양 끝 티어 노드 */}
        <div className="absolute left-0 top-1/2 z-0 -translate-y-1/2">
          <TierNode file="0-unrank" label="언랭" />
        </div>
        <div className="absolute right-0 top-1/2 z-0 -translate-y-1/2">
          <TierNode file="10-challenger" label="챌린저" goal />
        </div>

        {/* 앞: 챌린저 기사 (투명 배경) */}
        <div className="relative z-10 h-60 w-60 sm:h-80 sm:w-80">
          <div
            aria-hidden="true"
            className="absolute inset-6 rounded-full bg-gold/20 blur-3xl"
          />
          <Image
            src="/images/gotoc.png"
            alt="XYZ 챌린저 대리 기사"
            fill
            sizes="(max-width: 639px) 240px, 320px"
            className="relative object-contain drop-shadow-[0_10px_40px_rgba(222,176,67,0.35)]"
          />
        </div>
      </div>

      <p className="mt-6 text-center text-sm leading-7 text-pretty text-zinc-300 sm:text-base">
        현재 시즌 챌린저 기사가 전담 배정되어{" "}
        <b className="gold-text font-black">단 3주 만에 언랭 → 그랜드마스터</b>
        까지 안정적으로 끌어올립니다.
      </p>
    </div>
  );
}
