import Image from "next/image";

// 전 구간 지원 시각화 — 언랭부터 챌린저까지 티어 아이콘 + 한글 라벨(alt 키워드)
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
  return (
    <div className="mx-auto max-w-4xl">
      <ul className="flex flex-wrap items-stretch justify-center gap-2.5 sm:gap-3">
        {tiers.map(([file, label], i) => (
          <li
            key={file}
            className="flex w-[calc((100%-5rem)/6)] flex-col items-center gap-2 rounded-2xl border border-white/8 bg-white/3.5 px-1.5 py-4 transition hover:border-gold/25 sm:w-20"
          >
            <Image
              src={`/images/tier/${file}.png`}
              alt={`${label} 구간 롤 대리·듀오`}
              width={48}
              height={48}
              loading="lazy"
              sizes="48px"
              className="h-10 w-10 object-contain sm:h-12 sm:w-12"
            />
            <span className="text-[11px] font-black text-zinc-400 sm:text-xs">
              {label}
            </span>
            {i === 0 && (
              <span className="text-[9px] font-bold text-gold/70">현재</span>
            )}
            {i === tiers.length - 1 && (
              <span className="text-[9px] font-bold text-gold/70">목표</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
