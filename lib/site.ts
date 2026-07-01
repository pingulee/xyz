export const site = {
  name: "롤대리.xyz",
  url: "https://롤대리.xyz",
  description:
    "롤 대리, 롤 듀오, 롤 계정 검증된 상위 티어 기사와 체계적인 운영으로 안내하는 리그 오브 레전드 전문 서비스입니다.",
  kakaoUrl: "https://open.kakao.com/o/sKuEg9zi",
};

export const navItems = [
  { label: "메인", href: "/" },
  { label: "공지사항", href: "/notice" },
  { label: "기사 라인업", href: "/lineup" },
  { label: "가격 안내", href: "#price" },
  { label: "후기 작성", href: "/reviews" },
  { label: "기사 모집", href: "/recruit" },
];

export const services = [
  {
    title: "롤 대리",
    href: "/boosting",
    eyebrow: "boosting",
    description:
      "현재 티어와 목표 티어를 기준으로 검증된 기사가 안정적으로 진행합니다.",
    image: "/images/boosting.png",
  },
  {
    title: "롤 듀오",
    href: "/duo",
    eyebrow: "duo queue",
    description:
      "상위 티어 기사와 함께 플레이하며 승률과 피드백을 동시에 챙깁니다.",
    image: "/images/duo.png",
  },
  {
    title: "롤 계정",
    href: "/account",
    eyebrow: "account",
    description: "원하는 티어, 챔피언, 일정 조건에 맞춘 계정을 구해드립니다.",
    image: "/images/account.png",
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
    title: "대리 랭크 시간제",
    badge: "⏱️ 1시간",
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
        cells: ["다이아몬드 4~2", "70% 보장", "20,000원"],
      },
      { icons: [T.diamond], cells: ["다이아몬드 1", "65% 보장", "24,000원"] },
      { icons: [T.master], cells: ["마스터 0~99 LP", "60% 보장", "26,000원"] },
      {
        icons: [T.master],
        cells: ["마스터 100~199 LP", "60% 보장", "28,000원"],
      },
      { icons: [T.master], cells: ["100 LP 당", "60% 보장", "+2,000원"] },
      { icons: [T.grandmaster], cells: ["그랜드마스터↑", "50%", "상담"] },
    ] as PriceRow[],
    cols: ["구간", "승률 보장", "금액"] as const,
    note: "· 1시간 당 가격입니다.\n· 승률 보장 서비스는 10시간 이상 신청 시 적용됩니다.\n· 마스터 티어 이상부터는 기사의 과실이 없는 패배는 승리로 인정하여 승률을 산정합니다. (기사 과실 판단 기준: KDA 5.0 이상)",
  },
  score: {
    title: "고티어 점수 보장제",
    badge: "💯 100점",
    rows: [
      { icons: [T.diamond], cells: ["다이아몬드 1", "140,000원"] },
      { icons: [T.master], cells: ["마스터 0~199 LP", "180,000원"] },
      { icons: [T.master], cells: ["마스터 200~399 LP", "200,000원"] },
      { icons: [T.master], cells: ["마스터 400~599 LP", "220,000원"] },
      { icons: [T.master], cells: ["200 LP 당", "+20,000원"] },
      { icons: [T.grandmaster], cells: ["그랜드마스터↑", "상담"] },
    ] as PriceRow[],
    cols: ["구간", "금액"] as const,
    note: "· 100점 상승 당 가격입니다.\n· 점수는 10단위 반올림을 적용합니다. (예: 92점 상승, 106점 상승 → 100점으로 계산)\n· 그랜드마스터 이상 구간은 실시간 시세를 반영하여 가격이 결정됩니다.",
  },
  normal: {
    title: "일반 게임 · 칼바람",
    badge: "✅ 1판",
    rows: [{ icons: [], cells: ["티어 무관", "5,000원"] }] as PriceRow[],
    cols: ["항목", "금액"] as const,
    note: "",
  },
};
