import Image from "next/image";

// 전 구간 지원 시각화 — 언랭 → 챌린저 상승 진행 레일. 하위는 흐리게, 목표(챌린저)로 갈수록 밝게.
const tiers: [string, string][] = [
  ["0-unrank", "언랭"],
  ["1-iron", "아이언"],
  ["2-bronze", "브론즈"],
  ["3-silver", "실버"],
  ["4-gold", "골드"],
  ["5-platinum", "플래티넘"],
  ["6-emerald", "에메랄드"],
  ["7-diamond", "다이아몬드"],
  ["8-master", "마스터"],
  ["9-grandmaster", "그랜드마스터"],
  ["10-challenger", "챌린저"],
];

export default function TierBand() {
  const last = tiers.length - 1;

  return (
    <div className="relative mx-auto max-w-5xl">
      {/* 상승 레일 — 아이콘 중심 높이에 흐림→골드 그라데이션 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-[2.15rem] h-1 rounded-full bg-linear-to-r from-white/8 via-gold/35 to-gold shadow-gold-sm"
      />

      <ul className="relative flex snap-x gap-3 overflow-x-auto pb-3 scrollbar-none sm:gap-4 lg:justify-between lg:overflow-visible">
        {tiers.map(([file, label], i) => {
          const isGoal = i === last;
          // 하위 티어는 흐리게, 목표로 갈수록 선명 (0.55 → 1)
          const opacity = 0.55 + (0.45 * i) / last;
          return (
            <li
              key={file}
              className="flex shrink-0 snap-center flex-col items-center gap-2.5"
            >
              <span
                className={`grid h-18 w-18 place-items-center rounded-2xl border transition ${
                  isGoal
                    ? "border-gold/60 bg-gold/12 shadow-gold-sm ring-1 ring-gold/30"
                    : "border-white/10 bg-white/3 hover:border-gold/30"
                }`}
                style={isGoal ? undefined : { opacity }}
              >
                <Image
                  src={`/images/tier/${file}.png`}
                  alt={`${label} 구간 롤 대리·듀오`}
                  width={52}
                  height={52}
                  loading="lazy"
                  sizes="52px"
                  className="h-11 w-11 object-contain"
                />
              </span>
              <span
                className={`text-[11px] font-black sm:text-xs ${
                  isGoal ? "gold-text" : "text-zinc-400"
                }`}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
