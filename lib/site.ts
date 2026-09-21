// 도메인은 한글 IDN. robots.txt·sitemap.xml·JSON-LD는 이 문자열을 그대로 출력하고
// (Next가 인코딩해주지 않음) metadataBase만 자동으로 punycode화하므로, 그대로 두면
// canonical(xn--vk1b65hf2a.xyz)과 sitemap<loc>(롤대리.xyz)의 호스트가 어긋난다.
// → 여기서 미리 정규화해 모든 출력 경로의 호스트를 일치시킨다.
const SITE_ORIGIN = new URL("https://롤대리.xyz").origin; // https://xn--vk1b65hf2a.xyz

export const site = {
  name: "롤대리.xyz",
  brand: "XYZ",
  url: SITE_ORIGIN,
  description:
    "롤 대리, 롤 듀오, 롤 계정 전문 XYZ. 상위 티어 검증 기사가 100% 수동으로 진행하고, 기사별 승률·전적·실제 작업 후기를 모두 공개합니다. 구간별 승률 보장, 24시간 카카오톡 상담.",
  kakaoUrl: "https://open.kakao.com/o/ssRGxpLi",
  kakaoId: "xyzteam",
  ogImage: "/images/profile.webp",
  logo: "/images/logo.webp",
};

export const navItems = [
  { label: "메인", href: "/" },
  { label: "공지사항", href: "/notice" },
  { label: "기사 소개", href: "/booster" },
  { label: "가격표", href: "/boosting" },
  { label: "작업 후기", href: "/review" },
  { label: "문의하기", href: "/inquiry" },
];

export const levelingDuration = "보통 3~4일 소요";

export const levelingPrice = { fromLevel: 0, toLevel: 30, price: 80000, currency: "KRW" } as const;

export const services = [
  {
    title: "롤 대리",
    href: "/boosting",
    eyebrow: "boosting",
    description:
      "현재 티어와 목표 티어를 기준으로 검증된 기사가 안정적으로 진행합니다.",
    image: "/images/slider/01-edited.webp?v=20260919-6",
    cardImage: "/images/slider/01-edited.webp?v=20260919-6",
    cardImageAlt: "기존 검정·골드 이미지에 실제 롤 화면과 롤 대리 문구를 적용한 서비스 이미지",
    imageAlt: "기존 검정·골드 이미지에 실제 롤 화면과 롤 대리 문구를 적용한 슬라이드 이미지",
  },
  {
    title: "롤 듀오",
    href: "/duo",
    eyebrow: "duo queue",
    description:
      "상위 티어 기사와 함께 플레이하며 승률과 피드백을 동시에 챙깁니다.",
    image: "/images/slider/02-edited.webp?v=20260919-6",
    cardImage: "/images/slider/02-edited.webp?v=20260919-6",
    cardImageAlt: "기존 검정·골드 이미지에 실제 롤 듀오 화면과 문구를 적용한 서비스 이미지",
    imageAlt: "기존 검정·골드 이미지에 실제 롤 듀오 화면과 문구를 적용한 슬라이드 이미지",
  },
  {
    title: "롤 계정",
    href: "/account",
    eyebrow: "account",
    description: "원하는 티어, 챔피언, 일정 조건에 맞춘 계정을 구해드립니다.",
    image: "/images/slider/03-edited.webp?v=20260919-6",
    cardImage: "/images/slider/03-edited.webp?v=20260919-6",
    cardImageAlt: "기존 검정·골드 이미지에 실제 롤 계정 화면과 문구를 적용한 서비스 이미지",
    imageAlt: "기존 검정·골드 이미지에 실제 롤 계정 화면과 문구를 적용한 슬라이드 이미지",
  },
  {
    title: "롤 육성",
    href: "/leveling",
    eyebrow: "leveling",
    description: `${levelingPrice.fromLevel}→${levelingPrice.toLevel}레벨 ${levelingPrice.price.toLocaleString("ko-KR")}원. 100% 수동 육성으로 ${levelingDuration}됩니다.`,
    image: "/images/slider/04-edited.webp?v=20260919-6",
    imageAlt: "기존 검정·골드 이미지에 실제 롤 화면과 롤 육성 문구를 적용한 슬라이드 이미지",
    cardImage: "/images/slider/04-edited.webp?v=20260919-6",
    cardImageAlt: "기존 검정·골드 이미지에 실제 롤 화면과 롤 육성 문구를 적용한 서비스 이미지",
  },
];

// 제공 서비스와 가격표 메뉴가 같은 페이지 목록을 사용한다.
export const priceMenuItems = services.map(({ title, href }) => ({ label: title, href }));

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

export type CnyPriceRow = { label: string; icons: string[]; cny: number };
export type CnyPriceGroup = { title: string; unit: string; note?: string; rows: CnyPriceRow[] };

export const boostingPrices: CnyPriceGroup[] = [
  {
    title: "판수제 대리 랭크",
    unit: "1판 기준",
    rows: [
      { label: "다이아 이하", icons: [T.diamond], cny: 40 },
      { label: "마스터", icons: [T.master], cny: 70 },
      { label: "그랜드마스터", icons: [T.grandmaster], cny: 100 },
      { label: "챌린저", icons: [T.challenger], cny: 130 },
    ],
  },
  {
    title: "패배 복구 대리 랭크",
    unit: "순승 1승 기준",
    note: "패배한 만큼 추가 승리로 복구합니다. 5승 신청 시: 6승 1패 = 순승 5승",
    rows: [
      { label: "아이언 · 브론즈 · 실버", icons: [T.iron, T.bronze, T.silver], cny: 20 },
      { label: "골드", icons: [T.gold], cny: 25 },
      { label: "플래티넘", icons: [T.platinum], cny: 35 },
      { label: "에메랄드", icons: [T.emerald], cny: 40 },
      { label: "다이아몬드 4", icons: [T.diamond], cny: 50 },
      { label: "다이아몬드 3", icons: [T.diamond], cny: 60 },
      { label: "다이아몬드 2", icons: [T.diamond], cny: 70 },
      { label: "다이아몬드 1", icons: [T.diamond], cny: 80 },
      { label: "듀오 막힘", icons: [T.master], cny: 130 },
    ],
  },
  {
    title: "고티어 점수 보장제 대리 랭크",
    unit: "+100 LP 기준",
    rows: [800, 850, 950, 1000, 1050, 1100, 1150, 1200, 1250, 1300, 1350, 1400, 1450].map((cny, index) => ({
      label: `마스터 ${(index * 100).toLocaleString("ko-KR")}~${(index * 100 + 99).toLocaleString("ko-KR")} LP`,
      icons: [T.master],
      cny,
    })),
  },
];

export const duoPrices = {
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
