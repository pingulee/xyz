import Image from "next/image";

// 전 구간 지원 시각화 — 뒤에 언랭 → 챌린저 진행 레일, 앞에 챌린저 기사(투명 PNG) 크게.
function TierNode({
  file,
  label,
  boxClass,
  labelClass,
}: {
  file: string;
  label: string;
  boxClass: string;
  labelClass: string;
}) {
  return (
    <div className="relative h-16 w-16 sm:h-20 sm:w-20">
      <span
        className={`grid h-full w-full place-items-center rounded-2xl border ${boxClass}`}
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
      {/* 라벨은 박스 폭에 영향 없이 중앙 정렬 (긴 라벨 오버플로 허용) */}
      <span
        className={`absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap text-xs font-black sm:text-sm ${labelClass}`}
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
        {/* 뒤: 언랭 모서리 → 그랜드마스터 모서리 진행 화살표 (박스 전폭 inset) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-16 top-1/2 z-0 flex -translate-y-1/2 items-center sm:inset-x-20"
        >
          <span className="h-1 flex-1 rounded-l-full bg-linear-to-r from-white/15 via-gold/50 to-gold" />
          {/* 솔리드 삼각형 화살촉 */}
          <span className="h-0 w-0 border-y-[7px] border-l-[12px] border-y-transparent border-l-gold" />
        </div>

        {/* 뒤: 양 끝 티어 노드 (라벨 색 = 아이콘 색) */}
        <div className="absolute left-0 top-1/2 z-0 -translate-y-1/2">
          <TierNode
            file="0-unrank"
            label="언랭"
            boxClass="border-white/10 bg-white/3 opacity-80"
            labelClass="text-zinc-400"
          />
        </div>
        <div className="absolute right-0 top-1/2 z-0 -translate-y-1/2">
          <TierNode
            file="9-grandmaster"
            label="그랜드마스터"
            boxClass="border-red-500/50 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.25)] ring-1 ring-red-500/25"
            labelClass="text-red-400"
          />
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

      <p className="mt-6 text-center text-base font-black tracking-tight text-balance text-white sm:text-lg">
        언랭부터 그랜드마스터까지{" "}
        <span className="gold-text">단 3주</span> 소요!
      </p>
    </div>
  );
}
