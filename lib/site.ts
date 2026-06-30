export const site = {
  name: "롤대리.xyz",
  url: "https://롤대리.xyz",
  description:
    "롤 대리, 롤 듀오, 롤 계정 검증된 상위 티어 기사와 체계적인 운영으로 안내하는 리그 오브 레전드 전문 서비스입니다.",
  kakaoUrl: "https://open.kakao.com/o/sKuEg9zi",
};

export const navItems = [
  { label: "메인", href: "/" },
  { label: "공지사항", href: "/notices" },
  { label: "기사 라인업", href: "/lineup" },
  { label: "가격 안내", href: "/price" },
  { label: "작업 후기", href: "/reviews" },
  { label: "기사 모집", href: "/recruit" },
];

export const services = [
  {
    title: "롤 대리",
    href: "/price/boosting",
    eyebrow: "boosting",
    description:
      "현재 티어와 목표 티어를 기준으로 검증된 기사가 안정적으로 진행합니다.",
    image: "/images/boosting.png",
  },
  {
    title: "롤 듀오",
    href: "/price/duo",
    eyebrow: "duo queue",
    description:
      "상위 티어 기사와 함께 플레이하며 승률과 피드백을 동시에 챙깁니다.",
    image: "/images/duo.png",
  },
  {
    title: "롤 계정",
    href: "/price/account",
    eyebrow: "account",
    description:
      "원하는 티어, 챔피언, 일정 조건에 맞춘 계정 상담을 진행합니다.",
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
  master: "/images/tier/10-challenger.png",
  grandmaster: "/images/tier/10-challenger.png",
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
      { icons: [T.master], cells: ["마스터 0~99 LP", "55% 보장", "26,000원"] },
      {
        icons: [T.master],
        cells: ["마스터 100~199 LP", "55% 보장", "28,000원"],
      },
      { icons: [T.master], cells: ["100 LP 당", "55% 보장", "+2,000원"] },
      { icons: [T.grandmaster], cells: ["그랜드마스터↑", "50%", "상담"] },
    ] as PriceRow[],
    cols: ["구간", "승률 보장", "금액"] as const,
    note: "· 1시간 당 가격입니다.\n· 승률 보장 서비스는 10시간 이상 신청 시 적용됩니다.\n· 마스터 티어 이상부터는 기사의 과실이 없는 패배는 승리로 인정하여 승률을 산정합니다. (기사 과실 판단 기준: KDA 5.0 이상)",
  },
  score: {
    title: "고티어 점수 보장제",
    badge: "✅ 100점",
    rows: [
      { icons: [T.diamond], cells: ["다이아몬드 1", "140,000원"] },
      { icons: [T.master], cells: ["마스터 0~199 LP", "180,000원"] },
      { icons: [T.master], cells: ["마스터 200~399 LP", "200,000원"] },
      { icons: [T.master], cells: ["마스터 400~599 LP", "220,000원"] },
      { icons: [T.master], cells: ["200 LP 당", "+20,000원"] },
      { icons: [T.grandmaster], cells: ["그랜드마스터↑", "상담"] },
    ] as PriceRow[],
    cols: ["구간", "금액"] as const,
    note: "· 100점 상승 당 가격입니다.\n· 점수는 10단위 반올림을 적용합니다. (예: 92점 상승, 106점 상승 → 100점으로 계산)",
  },
  normal: {
    title: "일반 게임 · 칼바람",
    badge: "✅ 1판",
    rows: [{ icons: [], cells: ["티어 무관", "5,000원"] }] as PriceRow[],
    cols: ["항목", "금액"] as const,
    note: "",
  },
};

export type Lineup = {
  name: string;
  positions: string[];
  rank: string;
  tier: string;
  description: string;
  weekdayHours: string;
  weekendHours: string;
  champions?: string[];
  services: string[];
  image: string;
};

export const lineups: Lineup[] = [
  {
    name: "이브",
    positions: ["정글"],
    rank: "Challenger",
    tier: "/images/tier/10-challenger.png",
    description: "매 판 혼자 캐리 가능합니다.",
    weekdayHours: "18:00 ~ 23:00",
    weekendHours: "ALL",
    champions: ["이블린", "카서스", "자이라"],
    services: ["대리", "듀오"],
    image: "/images/lineup/이브.png",
  },
  {
    name: "메뚜기",
    positions: ["정글"],
    rank: "Challenger",
    tier: "/images/tier/10-challenger.png",
    description: "다이아 구간 100 게임 승률 85% 이상 나옵니다.",
    weekdayHours: "18:00 ~ 00:00",
    weekendHours: "ALL",
    champions: ["카직스", "사일러스", "로크"],
    services: ["대리", "듀오"],
    image: "/images/lineup/메뚜기.png",
  },
  {
    name: "기사 C",
    positions: ["탑"],
    rank: "Challenger",
    tier: "/images/tier/10-challenger.png",
    description: "멘트",
    weekdayHours: "12:00 ~ 02:00",
    weekendHours: "11:00 ~ 03:00",
    champions: ["갱플랭크"],
    services: ["대리", "듀오"],
    image: "/images/lineup-3.png",
  },
  {
    name: "도치",
    positions: ["바텀"],
    rank: "Challenger",
    tier: "/images/tier/10-challenger.png",
    description: "잘 부탁드립니다.",
    weekdayHours: "불가능",
    weekendHours: "ALL",
    champions: ["징크스"],
    services: ["대리", "듀오"],
    image: "/images/lineup/도치.png",
  },
  {
    name: "달빛",
    positions: ["미드"],
    rank: "Challenger",
    tier: "/images/tier/10-challenger.png",
    description: "고승률 보장합니다.",
    weekdayHours: "08:00 ~ 03:00",
    weekendHours: "08:00 ~ 03:00",
    champions: ["다이애나", "카시오페아", "요네"],
    services: ["대리", "듀오"],
    image: "/images/lineup/달빛킹.png",
  },
  {
    name: "기사 F",
    positions: ["정글"],
    rank: "Challenger",
    tier: "/images/tier/10-challenger.png",
    description: "멘트",
    weekdayHours: "16:00 ~ 06:00",
    weekendHours: "14:00 ~ 06:00",
    champions: ["헤카림"],
    services: ["대리", "듀오"],
    image: "/images/lineup-3.png",
  },
  {
    name: "기사 G",
    positions: ["미드"],
    rank: "Challenger",
    tier: "/images/tier/10-challenger.png",
    description: "멘트",
    weekdayHours: "13:00 ~ 03:00",
    weekendHours: "12:00 ~ 04:00",
    champions: ["판테온"],
    services: ["대리", "듀오"],
    image: "/images/lineup-1.png",
  },
  {
    name: "경계",
    positions: ["정글"],
    rank: "Grandmaster",
    tier: "/images/tier/9-grandmaster.png",
    description: "한계를 넘는 피지컬 보여드리겠습니다.",
    weekdayHours: "ALL",
    weekendHours: "ALL",
    champions: ["벨베스", "비에고", "다이애나"],
    services: ["대리"],
    image: "/images/lineup/경계.png",
  },
  {
    name: "케인",
    positions: ["정글"],
    rank: "Challenger",
    tier: "/images/tier/10-challenger.png",
    description: "편안한 승차감을 느끼실겁니다.",
    weekdayHours: "19:00 ~ 00:00",
    weekendHours: "ALL",
    champions: ["케인", "카서스", "신 짜오"],
    services: ["대리", "듀오"],
    image: "/images/lineup/케인킹.png",
  },
  {
    name: "기사 J",
    positions: ["탑", "정글"],
    rank: "Challenger",
    tier: "/images/tier/10-challenger.png",
    description:
      "탱커 챔피언 중심의 안정적 운영과 팀 합류 타이밍에 특화되어 있습니다.",
    weekdayHours: "09:00 ~ 23:00",
    weekendHours: "09:00 ~ 01:00",
    champions: ["말파이트", "아무무", "쓰레쉬"],
    services: ["대리"],
    image: "/images/lineup-1.png",
  },
  {
    name: "기사 K",
    positions: ["정글"],
    rank: "Challenger",
    tier: "/images/tier/10-challenger.png",
    description: "카운터 정글과 비전 장악을 통한 맵 통제에 능숙합니다.",
    weekdayHours: "18:00 ~ 06:00",
    weekendHours: "16:00 ~ 06:00",
    champions: ["이블린", "카직스", "렉사이"],
    services: ["대리", "듀오"],
    image: "/images/lineup-2.png",
  },
  {
    name: "기사 L",
    positions: ["미드"],
    rank: "Challenger",
    tier: "/images/tier/10-challenger.png",
    description: "텔레포트 연계와 글로벌 스킬 챔피언 중심의 운영을 선호합니다.",
    weekdayHours: "14:00 ~ 02:00",
    weekendHours: "12:00 ~ 03:00",
    champions: ["갱플랭크", "판테온", "사이온"],
    services: ["대리", "듀오"],
    image: "/images/lineup-3.png",
  },
  {
    name: "기사 M",
    positions: ["바텀"],
    rank: "Challenger",
    tier: "/images/tier/10-challenger.png",
    description: "초반 라인전 우위와 타워 압박에 집중하는 공격적 스타일입니다.",
    weekdayHours: "15:00 ~ 03:00",
    weekendHours: "13:00 ~ 04:00",
    champions: ["드레이븐", "루시안", "사미라"],
    services: ["대리", "듀오"],
    image: "/images/lineup-1.png",
  },
  {
    name: "기사 N",
    positions: ["서폿", "미드"],
    rank: "Challenger",
    tier: "/images/tier/10-challenger.png",
    description: "로밍 서포터와 카운터 픽 이해도가 높은 전략형 기사입니다.",
    weekdayHours: "12:00 ~ 02:00",
    weekendHours: "11:00 ~ 03:00",
    champions: ["파이크", "블리츠크랭크", "탐켄치"],
    services: ["대리", "듀오"],
    image: "/images/lineup-2.png",
  },
  {
    name: "기사 O",
    positions: ["탑"],
    rank: "Challenger",
    tier: "/images/tier/10-challenger.png",
    description:
      "스플릿 푸쉬와 1대1 교전 능력이 뛰어난 솔로 라인 전문 기사입니다.",
    weekdayHours: "10:00 ~ 00:00",
    weekendHours: "10:00 ~ 02:00",
    champions: ["피오라", "카밀", "트린다미어"],
    services: ["대리"],
    image: "/images/lineup-3.png",
  },
  {
    name: "기사 P",
    positions: ["정글", "탑"],
    rank: "Challenger",
    tier: "/images/tier/10-challenger.png",
    description:
      "상대 정글러 동선 파악과 선제 갱킹으로 라인을 이끄는 스타일입니다.",
    weekdayHours: "17:00 ~ 05:00",
    weekendHours: "15:00 ~ 05:00",
    champions: ["워윅", "볼리베어", "우디르"],
    services: ["대리", "듀오"],
    image: "/images/lineup-1.png",
  },
  {
    name: "기사 Q",
    positions: ["미드"],
    rank: "Challenger",
    tier: "/images/tier/10-challenger.png",
    description:
      "라인 푸쉬와 로밍 밸런스가 뛰어나며 꼼꼼한 진행 안내를 제공합니다.",
    weekdayHours: "13:00 ~ 01:00",
    weekendHours: "12:00 ~ 02:00",
    champions: ["오리아나", "신드라", "조이"],
    services: ["대리", "듀오"],
    image: "/images/lineup-2.png",
  },
  {
    name: "기사 R",
    positions: ["바텀", "미드"],
    rank: "Challenger",
    tier: "/images/tier/10-challenger.png",
    description:
      "유틸 원딜과 딜탱 챔피언 모두 능숙하며 안정적인 후반 캐리를 보장합니다.",
    weekdayHours: "16:00 ~ 04:00",
    weekendHours: "14:00 ~ 05:00",
    champions: ["코그모", "베인", "미스포츈"],
    services: ["대리", "듀오"],
    image: "/images/lineup-3.png",
  },
];
