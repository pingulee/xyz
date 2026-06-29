export const site = {
  name: "xyz",
  url: "https://롤대리.xyz",
  description:
    "검증된 상위 티어 기사와 함께하는 프리미엄 리그 오브 레전드 대리, 듀오, 계정 상담 서비스입니다.",
  kakaoUrl: "https://open.kakao.com/",
  email: "contact@example.com",
};

export const navItems = [
  { label: "메인", href: "/" },
  { label: "기사 라인업", href: "/lineup" },
  { label: "가격 안내", href: "/price" },
  { label: "기사 모집", href: "/recruit" },
];

export const services = [
  {
    title: "롤 대리",
    href: "/price/boosting",
    eyebrow: "boosting",
    description: "현재 티어와 목표 티어에 맞춰 안정적으로 진행하는 프리미엄 대리 서비스입니다.",
    image: "/images/boosting.png",
  },
  {
    title: "롤 듀오",
    href: "/price/duo",
    eyebrow: "duo queue",
    description: "검증된 기사와 함께 플레이하며 승률과 피드백을 동시에 챙기는 듀오 서비스입니다.",
    image: "/images/duo.png",
  },
  {
    title: "롤 계정",
    href: "/price/account",
    eyebrow: "account",
    description: "원하는 조건과 예산에 맞춰 맞춤형 계정 상담을 진행합니다.",
    image: "/images/account.png",
  },
];

export const priceRows = [
  ["아이언 → 브론즈", "상담 후 안내", "난이도 낮음"],
  ["실버 → 골드", "상담 후 안내", "인기 구간"],
  ["플래티넘 → 에메랄드", "상담 후 안내", "승률 관리"],
  ["다이아 이상", "별도 견적", "기사 배정"],
];
