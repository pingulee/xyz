export const site = {
  name: "XYZ",
  url: "https://롤대리.xyz",
  description:
    "검증된 상위 티어 기사와 체계적인 운영으로 진행하는 프리미엄 리그 오브 레전드 서비스입니다.",
  kakaoUrl: "https://open.kakao.com/o/sKuEg9zi",
};

export const navItems = [
  { label: "메인", href: "/" },
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

export const priceRows = [
  ["아이언 - 브론즈", "상담 후 안내", "빠른 진행"],
  ["실버 - 골드", "상담 후 안내", "인기 구간"],
  ["플래티넘 - 에메랄드", "상담 후 안내", "승률 관리"],
  ["다이아 이상", "별도 견적", "전담 기사 배정"],
];

export const lineups = [
  {
    title: "정글 전문 기사",
    rank: "Challenger",
    description: "오브젝트 운영과 캐리 라인 중심 진행",
    image: "/images/lineup-1.png",
  },
  {
    title: "미드 전문 기사",
    rank: "Grandmaster+",
    description: "라인전 주도권과 합류 중심 진행",
    image: "/images/lineup-2.png",
  },
  {
    title: "바텀 전문 기사",
    rank: "Master+",
    description: "듀오 및 조합 중심 안정 진행",
    image: "/images/lineup-3.png",
  },
];
