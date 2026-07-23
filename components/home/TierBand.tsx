import Image from "next/image";

// 전 구간 지원 시각화 — 티어 아이콘 + 한글 라벨(alt 키워드)
const tiers: [string, string][] = [
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
    <ul className="grid grid-cols-5 gap-3 sm:gap-4 lg:grid-cols-10">
      {tiers.map(([file, label]) => (
        <li
          key={file}
          className="flex flex-col items-center gap-2 rounded-2xl border border-white/8 bg-white/3.5 px-2 py-4 transition hover:border-gold/25"
        >
          <Image
            src={`/images/tier/${file}.png`}
            alt={`${label} 롤 대리·듀오 구간`}
            width={48}
            height={48}
            loading="lazy"
            sizes="48px"
            className="h-11 w-11 object-contain sm:h-12 sm:w-12"
          />
          <span className="text-[11px] font-black text-zinc-400 sm:text-xs">
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}
