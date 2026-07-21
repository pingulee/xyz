export const site = {
  name: "롤대리.xyz",
  url: "https://롤대리.xyz",
  description:
    "롤 대리, 롤 듀오, 롤 계정 검증된 상위 티어 기사와 체계적인 운영으로 안내하는 리그 오브 레전드 전문 서비스입니다.",
  kakaoUrl: "https://open.kakao.com/o/sKuEg9zi",
  ogImage: "/images/profile.webp",
  logo: "/images/logo.webp",
};

export const navItems = [
  { label: "메인", href: "/" },
  { label: "기사 라인업", href: "/lineup" },
  { label: "가격표", href: "#price" },
  { label: "작업 후기", href: "/reviews" },
  { label: "기사 모집", href: "/recruit" },
];

export const services = [
  {
    title: "롤 대리",
    href: "/boosting",
    eyebrow: "boosting",
    description:
      "현재 티어와 목표 티어를 기준으로 검증된 기사가 안정적으로 진행합니다.",
    image: "/images/slider/01.webp",
  },
  {
    title: "롤 듀오",
    href: "/duo",
    eyebrow: "duo queue",
    description:
      "상위 티어 기사와 함께 플레이하며 승률과 피드백을 동시에 챙깁니다.",
    image: "/images/slider/02.webp",
  },
  {
    title: "롤 계정",
    href: "/account",
    eyebrow: "account",
    description: "원하는 티어, 챔피언, 일정 조건에 맞춘 계정을 구해드립니다.",
    image: "/images/slider/03.webp",
  },
];

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
  challenger: "/images/tier/10-challenger.png",
};

export type PriceRow = { icons: string[]; cells: string[] };

export const boostingPrices = {
  hourly: {
    title: "시간제 대리 랭크",
    rows: [
      {
        icons: [T.iron, T.bronze, T.silver],
        cells: ["아이언 · 브론즈 · 실버", "90% 보장", "12,000원"],
      },
      { icons: [T.gold], cells: ["골드", "85% 보장", "14,000원"] },
      { icons: [T.platinum], cells: ["플래티넘", "80% 보장", "16,000원"] },
      { icons: [T.emerald], cells: ["에메랄드", "75% 보장", "18,000원"] },
      {
        icons: [T.diamond],
        cells: ["다이아몬드 4~3", "70% 보장", "20,000원"],
      },
      { icons: [T.diamond], cells: ["다이아몬드 2~1", "65% 보장", "24,000원"] },
      { icons: [T.diamond], cells: ["듀오 불가", "60% 보장", "26,000원"] },
      { icons: [T.master], cells: ["마스터 0~199 LP", "60% 보장", "26,000원"] },
      { icons: [T.master], cells: ["200 LP 당", "60% 보장", "+2,000원"] },
      { icons: [T.grandmaster], cells: ["그랜드마스터↑", "50%", "상담"] },
    ] as PriceRow[],
    cols: ["구간", "승률 보장", "금액"] as const,
    note: "· 승률 보장 서비스는 10시간 이상 신청 시 적용됩니다.\n· 기사가 캐리했음에 불구하고 발생한 패배는 승리로 인정하여 승률을 산정합니다.",
  },
  score: {
    title: "저티어 승리 보장제 대리 랭크",
    rows: [
      {
        icons: [T.iron, T.bronze, T.silver],
        cells: ["아이언 · 브론즈 · 실버", "5,000원", "1승 단위"],
      },
      { icons: [T.gold], cells: ["골드", "6,000원", "1승 단위"] },
      { icons: [T.platinum], cells: ["플래티넘", "7,000원", "1승 단위"] },
      { icons: [T.emerald], cells: ["에메랄드", "8,000원", "1승 단위"] },
      {
        icons: [T.diamond],
        cells: ["다이아몬드 4~3", "12,000원", "1승 단위"],
      },
      { icons: [T.diamond], cells: ["다이아몬드 2~1", "14,000원", "1승 단위"] },
    ] as PriceRow[],
    cols: ["구간", "금액"] as const,
    note: "· 패배 시 승리를 복구해드립니다. [신청 승 수 + 패배 수 = 총 승 수] (예: 2승 신청 → 2패 → 총 4승 2패로 마무리)",
  },
  lowTierWin: {
    title: "고티어 점수 보장제 대리 랭크",
    rows: [
      { icons: [T.diamond], cells: ["듀오 불가", "180,000원"] },
      { icons: [T.master], cells: ["마스터 0~199 LP", "180,000원"] },
      { icons: [T.master], cells: ["200 LP 단위", "+20,000원"] },
      { icons: [T.grandmaster], cells: ["그랜드마스터 이상", "상담"] },
    ] as PriceRow[],
    cols: ["구간", "금액"] as const,
    note: "· 점수는 10단위 반올림을 적용합니다. (예: 92점 상승, 106점 상승 → 100점으로 계산)\n· 그랜드마스터 이상 구간은 실시간 시세를 반영하여 가격이 결정됩니다.",
  },
};

export const duoPrices = {
  hourly: {
    title: "시간제 듀오 랭크",
    rows: [
      {
        icons: [T.iron, T.bronze, T.silver],
        cells: ["아이언 · 브론즈 · 실버", "90% 보장", "14,000원"],
      },
      { icons: [T.gold], cells: ["골드", "85% 보장", "16,000원"] },
      { icons: [T.platinum], cells: ["플래티넘", "80% 보장", "18,000원"] },
      { icons: [T.emerald], cells: ["에메랄드", "75% 보장", "20,000원"] },
      {
        icons: [T.diamond],
        cells: ["다이아몬드 4~3", "70% 보장", "22,000원"],
      },
      { icons: [T.diamond], cells: ["다이아몬드 2~1", "65% 보장", "24,000원"] },
    ] as PriceRow[],
    cols: ["구간", "승률 보장", "금액"] as const,
    note: "· 승률 보장 서비스는 10시간 이상 신청 시 적용됩니다.\n· 기사가 캐리했음에 불구하고 발생한 패배는 승리로 인정하여 승률을 산정합니다.",
  },
  score: {
    title: "승리 보장제 듀오 랭크",
    rows: [
      {
        icons: [T.iron, T.bronze, T.silver],
        cells: ["아이언 · 브론즈 · 실버", "37,500원"],
      },
      { icons: [T.gold], cells: ["골드", "45,000원"] },
      { icons: [T.platinum], cells: ["플래티넘", "80,000원"] },
      { icons: [T.emerald], cells: ["에메랄드", "52,500원"] },
      {
        icons: [T.diamond],
        cells: ["다이아몬드", "60,000원"],
      },
    ] as PriceRow[],
    cols: ["구간", "승률 보장", "금액"] as const,
    note: "· 점수는 10단위 반올림을 적용합니다. (예: 92점 상승, 106점 상승 → 100점으로 계산)\n· 고객님이 고의로 패배한 경우 승률 보장 서비스가 적용되지 않습니다.",
  },
};
