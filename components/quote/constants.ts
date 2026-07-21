import type { Tier } from "@/components/quote/types";

export const TIERS: Tier[] = [
  {
    key: "iron",
    name: "아이언",
    image: "/images/tier/1-iron.png",
    divisionPrice: 18000,
    divisions: [4, 3, 2, 1],
  },
  {
    key: "bronze",
    name: "브론즈",
    image: "/images/tier/2-bronze.png",
    divisionPrice: 22000,
    divisions: [4, 3, 2, 1],
  },
  {
    key: "silver",
    name: "실버",
    image: "/images/tier/3-silver.png",
    divisionPrice: 28000,
    divisions: [4, 3, 2, 1],
  },
  {
    key: "gold",
    name: "골드",
    image: "/images/tier/4-gold.png",
    divisionPrice: 35000,
    divisions: [4, 3, 2, 1],
  },
  {
    key: "platinum",
    name: "플래티넘",
    image: "/images/tier/5-platinum.png",
    divisionPrice: 45000,
    divisions: [4, 3, 2, 1],
  },
  {
    key: "emerald",
    name: "에메랄드",
    image: "/images/tier/6-emerald.png",
    divisionPrice: 60000,
    divisions: [4, 3, 2, 1],
  },
  {
    key: "diamond",
    name: "다이아몬드",
    image: "/images/tier/7-diamond.png",
    divisionPrice: 90000,
    divisions: [4, 3, 2, 1],
  },
  {
    key: "master",
    name: "마스터",
    image: "/images/tier/8-master.png",
    divisionPrice: 150000,
    divisions: [1],
  },
  {
    key: "grandmaster",
    name: "그랜드마스터",
    image: "/images/tier/9-grandmaster.png",
    divisionPrice: 190000,
    divisions: [1],
  },
  {
    key: "challenger",
    name: "챌린저",
    image: "/images/tier/10-challenger.png",
    divisionPrice: 240000,
    divisions: [1],
  },
];

export const LP_OPTIONS = ["0–20", "21–40", "41–60", "61–80", "81–99"];
export const LP_DISCOUNTS = [0, 0.2, 0.4, 0.6, 0.8];

export const SERVICES = [
  {
    key: "hourly",
    label: "시간제",
    category: "대리",
    unit: "시간",
    min: 1,
    max: 100,
    step: 1,
    initial: 10,
    needsTarget: true,
  },
  {
    key: "low-win",
    label: "저티어 티어 보장제",
    category: "대리",
    unit: "구간",
    min: 1,
    max: 50,
    step: 1,
    initial: 5,
    needsTarget: true,
  },
  {
    key: "high-score",
    label: "고티어 점수 보장제",
    category: "대리",
    unit: "점",
    min: 10,
    max: 2000,
    step: 10,
    initial: 100,
    needsTarget: true,
  },
  {
    key: "placement",
    label: "배치고사",
    category: "대리",
    unit: "게임",
    min: 1,
    max: 5,
    step: 1,
    initial: 5,
    needsTarget: false,
  },
  {
    key: "normal",
    label: "일반 게임",
    category: "대리",
    unit: "게임",
    min: 1,
    max: 100,
    step: 1,
    initial: 10,
    needsTarget: false,
  },
] as const;

export type ServiceKey = (typeof SERVICES)[number]["key"];

export const ADDONS = [
  {
    key: "lane",
    label: "라인 지정",
    desc: "원하는 포지션으로 진행",
    rate: 0,
    perGame: 0,
  },
  {
    key: "champion",
    label: "챔피언 지정",
    desc: "1개 +20% · 2개 +10% · 3개 이상 무료",
    rate: 0,
    perGame: 0,
  },
  {
    key: "solo",
    label: "솔로랭크 전용",
    desc: "솔로 큐로만 진행",
    rate: 0.2,
    perGame: 0,
  },
  {
    key: "stream",
    label: "플레이 관전",
    desc: "진행 게임 화면 공유",
    rate: 0.15,
    perGame: 0,
  },
] as const;

export const LANES = ["탑", "정글", "미드", "원딜", "서포터"] as const;
