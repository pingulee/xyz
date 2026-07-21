"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  Clock3,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trophy,
  TrendingUp,
  ClipboardCheck,
  Gamepad2,
  Ban,
} from "lucide-react";
import { site } from "@/lib/site";
import { useChampionOptions } from "@/components/useChampionOptions";

type Tier = {
  key: string;
  name: string;
  image: string;
  divisionPrice: number;
  divisions: number[];
};

const TIERS: Tier[] = [
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

const LP_OPTIONS = ["0–20", "21–40", "41–60", "61–80", "81–99"];
const LP_DISCOUNTS = [0, 0.2, 0.4, 0.6, 0.8];

const SERVICES = [
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

type ServiceKey = (typeof SERVICES)[number]["key"];

const ADDONS = [
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

const LANES = ["탑", "정글", "미드", "원딜", "서포터"] as const;

function rankScore(tierIndex: number, division: number) {
  return tierIndex * 4 + (4 - division);
}

function won(value: number) {
  return (
    `${Math.round(value / 1000) * 1000}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") +
    "원"
  );
}

function RankPicker({
  title,
  hint,
  tierIndex,
  division,
  onTierChange,
  onDivisionChange,
  hideDivision = false,
  minTierIndex = 0,
  maxTierIndex = TIERS.length - 1,
  splitDiamond = false,
  splitMaster = false,
  divisionOptions,
}: {
  title: string;
  hint: string;
  tierIndex: number;
  division: number;
  onTierChange: (index: number) => void;
  onDivisionChange: (division: number) => void;
  hideDivision?: boolean;
  minTierIndex?: number;
  maxTierIndex?: number;
  splitDiamond?: boolean;
  splitMaster?: boolean;
  /** 선택 가능한 단계를 제한할 때 사용 (기본: 티어의 전체 단계) */
  divisionOptions?: number[];
}) {
  const tier = TIERS[tierIndex];
  const divisions = divisionOptions ?? tier.divisions;
  const tierChoices = TIERS.flatMap((item, index) => {
    if (splitDiamond && item.key === "diamond") {
      return [
        { item, index, label: "다이아 4~3", choiceDivision: 4 },
        { item, index, label: "다이아 2~1", choiceDivision: 2 },
        { item, index, label: "듀오 불가", choiceDivision: -1 },
      ];
    }
    if (splitMaster && item.key === "master") {
      return [0, 200, 400, 600, 800].map((start) => ({
        item,
        index,
        label: `${start}~${start + 199} LP`,
        choiceDivision: start,
      }));
    }
    return [
      { item, index, label: item.name, choiceDivision: item.divisions[0] },
    ];
  }).filter(({ index }) => index >= minTierIndex && index <= maxTierIndex);

  return (
    <div className="rounded-3xl border border-white/8 bg-black/20 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-white">{title}</h3>
          <p className="mt-1 text-xs text-zinc-500">{hint}</p>
        </div>
        <span className="rounded-full bg-gold/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-gold">
          필수 선택
        </span>
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-8">
        {tierChoices.map(({ item, index, label, choiceDivision }) => {
          const active =
            index === tierIndex &&
            (!splitDiamond ||
              item.key !== "diamond" ||
              (choiceDivision === -1
                ? division === -1
                : choiceDivision === 4
                  ? division >= 3
                  : division >= 0 && division <= 2)) &&
            (!splitMaster ||
              item.key !== "master" ||
              division === choiceDivision);
          return (
            <button
              key={`${item.key}-${choiceDivision}`}
              type="button"
              onClick={() => {
                onTierChange(index);
                if (splitDiamond || splitMaster)
                  onDivisionChange(choiceDivision);
              }}
              className={`group relative rounded-2xl border px-1 py-3 transition ${
                active
                  ? "border-gold/70 bg-gold/12 shadow-[0_0_22px_rgba(222,176,67,.12)]"
                  : "border-white/7 bg-white/[.025] hover:border-gold/30 hover:bg-white/[.05]"
              }`}
            >
              {choiceDivision === -1 ? (
                <span className="mx-auto flex h-10 w-14 items-center justify-center sm:h-12">
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-red-400/30 bg-red-950/85 text-red-300 shadow-lg backdrop-blur-sm">
                    <Ban size={21} strokeWidth={2.5} />
                  </span>
                </span>
              ) : (
                <Image
                  src={item.image}
                  alt=""
                  width={52}
                  height={52}
                  className={`mx-auto h-10 w-10 object-contain transition sm:h-12 sm:w-12 ${active ? "scale-110" : "opacity-70 group-hover:opacity-100"}`}
                />
              )}
              <span
                className={`mt-2 block truncate text-[10px] font-bold sm:text-[11px] ${active ? "text-gold-soft" : "text-zinc-500"}`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {!hideDivision && (
        <div className="mt-5">
          <p className="mb-2 text-[11px] font-bold text-zinc-500">단계</p>
          <div className="grid grid-cols-4 gap-2">
            {divisions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onDivisionChange(item)}
                className={`rounded-xl border py-2.5 text-sm font-black transition ${
                  item === division
                    ? "border-gold bg-gold text-black"
                    : "border-white/8 text-zinc-400 hover:border-gold/35"
                }`}
              >
                {tier.divisions.length === 1
                  ? "LP"
                  : ["", "I", "II", "III", "IV"][item]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuoteCalculator() {
  const [serviceKey, setServiceKey] = useState<ServiceKey>("hourly");
  const [quantity, setQuantity] = useState(10);
  const serviceSliderRef = useRef<HTMLDivElement>(null);
  const [currentTier, setCurrentTier] = useState(2);
  const [currentDivision, setCurrentDivision] = useState(4);
  const [targetTier, setTargetTier] = useState(3);
  const [targetDivision, setTargetDivision] = useState(3);
  const [currentLp, setCurrentLp] = useState(0);
  const [addons, setAddons] = useState<string[]>([]);
  const [selectedLanes, setSelectedLanes] = useState<string[]>([]);
  const [selectedChampions, setSelectedChampions] = useState<string[]>([]);
  const [championSearch, setChampionSearch] = useState("");
  const { champions, loading: championsLoading } = useChampionOptions();

  const currentScore = rankScore(currentTier, currentDivision);
  const targetScore = rankScore(targetTier, targetDivision);
  const service =
    SERVICES.find((item) => item.key === serviceKey) ?? SERVICES[0];
  const needsTargetRank = service.needsTarget && serviceKey !== "hourly";
  const soloOptionAvailable = !(
    serviceKey === "hourly" &&
    (currentTier >= 7 || (currentTier === 6 && currentDivision === -1))
  );
  const visibleAddons = ADDONS.filter(
    (item) => item.key !== "solo" || soloOptionAvailable,
  );
  const serviceRankValid =
    serviceKey === "low-win"
      ? currentTier <= 6
      : serviceKey === "high-score"
        ? currentTier >= 6
        : true;
  const validTarget =
    serviceRankValid && (!needsTargetRank || targetScore > currentScore);
  const championSelectionValid =
    !addons.includes("champion") || selectedChampions.length >= 1;
  const formValid = validTarget && championSelectionValid;

  const quote = useMemo(() => {
    if (!validTarget)
      return {
        base: 0,
        addon: 0,
        discount: 0,
        total: 0,
        steps: 0,
        optionItems: [] as { label: string; amount: number }[],
      };
    let base = 0;
    if (serviceKey === "hourly") {
      const hourlyRates = [
        12000, 12000, 12000, 14000, 16000, 18000, 20000, 26000, 32000, 40000,
      ];
      const masterLpSurcharge =
        currentTier === 7 ? Math.floor(currentDivision / 200) * 2000 : 0;
      // 다이아몬드: 4~3 20,000원 · 2~1 24,000원 · 듀오 불가 26,000원 (1시간당)
      const hourlyRate =
        currentTier === 6
          ? currentDivision === -1
            ? 26000
            : currentDivision >= 3
              ? 20000
              : 24000
          : hourlyRates[currentTier] + masterLpSurcharge;
      base = hourlyRate * quantity;
    } else if (serviceKey === "low-win") {
      // 신청 수량 없이 현재 → 목표 구간 수로 자동 계산 (구간당 티어별 단가)
      for (let score = currentScore; score < targetScore; score++) {
        base += TIERS[Math.floor(score / 4)].divisionPrice;
      }
    } else if (serviceKey === "high-score") {
      const perHundred =
        currentTier >= 7 ? 180000 : currentTier === 6 ? 150000 : 120000;
      base = perHundred * (quantity / 100);
    } else if (serviceKey === "placement") {
      const placementRates = [
        5000, 5000, 5000, 6000, 7000, 8000, 13000, 20000, 25000, 30000,
      ];
      base = placementRates[currentTier] * quantity;
    } else {
      base = 5000 * quantity;
    }
    if (needsTargetRank)
      base -= Math.min(
        base * 0.2,
        TIERS[currentTier].divisionPrice * LP_DISCOUNTS[currentLp],
      );
    const selectedAddons = ADDONS.filter(
      (item) =>
        addons.includes(item.key) &&
        (item.key !== "solo" || soloOptionAvailable),
    );
    const addonRate = selectedAddons.reduce((sum, item) => sum + item.rate, 0);
    const championRate = addons.includes("champion")
      ? selectedChampions.length === 1
        ? 0.2
        : selectedChampions.length === 2
          ? 0.1
          : 0
      : 0;
    const perGameAddon =
      selectedAddons.reduce((sum, item) => sum + item.perGame, 0) * quantity;
    const addon = base * (addonRate + championRate) + perGameAddon;
    const discount = addons.includes("lane") ? 0 : base * 0.05;
    const optionItems: { label: string; amount: number }[] = selectedAddons
      .filter((item) => item.rate > 0 || item.perGame > 0)
      .map((item) => ({
        label: item.label,
        amount: base * item.rate + item.perGame * quantity,
      }));
    if (championRate > 0) {
      optionItems.push({
        label: `챔피언 지정 ${selectedChampions.length}개`,
        amount: base * championRate,
      });
    }
    return {
      base,
      addon,
      discount,
      total: base + addon - discount,
      steps: targetScore - currentScore,
      optionItems,
    };
  }, [
    addons,
    currentDivision,
    currentLp,
    currentTier,
    needsTargetRank,
    quantity,
    selectedChampions,
    serviceKey,
    targetScore,
    currentScore,
    validTarget,
    soloOptionAvailable,
  ]);

  const filteredChampions = useMemo(() => {
    const keyword = championSearch.trim().toLocaleLowerCase("ko-KR");
    if (!keyword) return champions;
    return champions.filter((champion) =>
      champion.name.toLocaleLowerCase("ko-KR").includes(keyword),
    );
  }, [championSearch, champions]);

  const selectService = (key: ServiceKey) => {
    const next = SERVICES.find((item) => item.key === key) ?? SERVICES[0];
    setServiceKey(key);
    setQuantity(next.initial);
    if (key === "hourly" && currentTier >= 7) {
      setAddons((items) => items.filter((item) => item !== "solo"));
    }
    if (key === "high-score" && currentTier < 6) {
      setCurrentTier(6);
      setCurrentDivision(4);
      setTargetTier(7);
      setTargetDivision(1);
    }
    if (key === "low-win") {
      if (currentTier > 6) {
        setCurrentTier(2);
        setCurrentDivision(4);
        setTargetTier(3);
        setTargetDivision(4);
      } else if (
        currentTier === 6 &&
        (currentDivision === 1 || currentDivision === -1)
      ) {
        // 다이아몬드 1(및 듀오 불가)은 현재 랭크로 선택 불가
        setCurrentDivision(2);
      }
      if (targetTier > 6) {
        setTargetTier(6);
        setTargetDivision(1);
      } else if (targetTier === 0 && targetDivision === 4) {
        // 아이언 4는 목표 랭크로 선택 불가
        setTargetDivision(3);
      }
    }
  };

  const serviceIcon = (key: ServiceKey) => {
    if (key === "hourly") return Clock3;
    if (key === "low-win") return Trophy;
    if (key === "high-score") return TrendingUp;
    if (key === "placement") return ClipboardCheck;
    return Gamepad2;
  };

  const slideToService = (key: ServiceKey) => {
    selectService(key);
    window.requestAnimationFrame(() => {
      serviceSliderRef.current
        ?.querySelector<HTMLElement>(`[data-service="${key}"]`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
    });
  };

  const moveService = (direction: -1 | 1) => {
    const index = SERVICES.findIndex((item) => item.key === serviceKey);
    const nextIndex = (index + direction + SERVICES.length) % SERVICES.length;
    slideToService(SERVICES[nextIndex].key);
  };

  const changeQuantity = (amount: number) => {
    setQuantity((value) =>
      Math.min(service.max, Math.max(service.min, value + amount)),
    );
  };

  const selectCurrentTier = (index: number) => {
    setCurrentTier(index);
    setCurrentDivision(TIERS[index].divisions[0]);
    if (serviceKey === "hourly" && index >= 7) {
      setAddons((items) => items.filter((item) => item !== "solo"));
    }
    if (
      rankScore(targetTier, targetDivision) <=
      rankScore(index, TIERS[index].divisions[0])
    ) {
      const next = Math.min(index + 1, TIERS.length - 1);
      setTargetTier(next);
      setTargetDivision(TIERS[next].divisions[0]);
    }
  };

  const selectCurrentDivision = (division: number) => {
    setCurrentDivision(division);
    if (serviceKey === "hourly" && currentTier === 6 && division === -1) {
      setAddons((items) => items.filter((item) => item !== "solo"));
    }
  };

  const toggleAddon = (key: string) => {
    if (key === "champion" && !addons.includes("lane")) return;
    setAddons((items) => {
      if (key === "lane" && items.includes("lane")) {
        return items.filter((item) => item !== "lane" && item !== "champion");
      }
      return items.includes(key)
        ? items.filter((item) => item !== key)
        : [...items, key];
    });
    if (key === "lane" && addons.includes("lane")) {
      setSelectedLanes([]);
      setSelectedChampions([]);
      setChampionSearch("");
    }
    if (key === "champion" && addons.includes("champion")) {
      setSelectedChampions([]);
      setChampionSearch("");
    }
  };

  const toggleLane = (lane: string) => {
    setSelectedLanes((items) =>
      items.includes(lane)
        ? items.filter((item) => item !== lane)
        : [...items, lane],
    );
  };

  const toggleChampion = (id: string) => {
    setSelectedChampions((items) => {
      if (items.includes(id)) return items.filter((item) => item !== id);
      return [...items, id];
    });
  };

  const needsCurrentRank = serviceKey !== "normal";
  const needsCurrentLp =
    serviceKey !== "normal" &&
    serviceKey !== "placement" &&
    serviceKey !== "hourly";
  const currentRankTitle =
    serviceKey === "placement" ? "전시즌 랭크" : "현재 랭크";
  const currentRankHint =
    serviceKey === "placement"
      ? "지난 시즌에 마감한 티어와 단계를 선택해주세요."
      : serviceKey === "hourly"
        ? "현재 티어를 선택해주세요. 다이아몬드는 구간이 분리됩니다."
        : "지금 계정의 티어와 단계를 선택해주세요.";
  const quantityTitle =
    serviceKey === "hourly"
      ? "신청 시간"
      : serviceKey === "high-score"
        ? "상승 점수"
        : "신청 게임 수";
  const estimatedDays =
    serviceKey === "high-score"
      ? Math.max(1, Math.ceil(quantity / 100))
      : serviceKey === "low-win"
        ? Math.max(1, Math.ceil(quote.steps / 2))
        : Math.max(1, Math.ceil(quantity / 10));
  const guaranteeRate =
    currentTier <= 2
      ? 90
      : currentTier === 3
        ? 85
        : currentTier === 4
          ? 80
          : currentTier === 5
            ? 75
            : currentTier === 6
              ? currentDivision === -1
                ? 60
                : currentDivision >= 3
                  ? 70
                  : 65
              : currentTier === 7
                ? 60
                : null;
  const guaranteeLabel =
    guaranteeRate === null ? "별도 상담" : `${guaranteeRate}% 보장`;
  const priceConsultRequired = serviceKey === "hourly" && currentTier >= 8;

  return (
    <div className="card-premium overflow-hidden rounded-[32px]">
      <div className="border-b border-white/8 bg-black/25 px-5 py-5 sm:px-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gold/12 text-gold">
              <Sparkles size={19} />
            </span>
            <div>
              <p className="font-black text-white">맞춤 서비스 견적</p>
              <p className="text-xs text-zinc-500">
                원하는 서비스를 선택하고 예상 견적을 바로 확인하세요.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-500">
            {["현재 랭크", "목표 랭크", "견적 확인"].map((item, index) => (
              <span key={item} className="flex items-center gap-2">
                <i className="grid h-5 w-5 place-items-center rounded-full bg-gold/12 not-italic text-gold">
                  {index + 1}
                </i>
                {item}
                {index < 2 && <ArrowRight size={12} />}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_350px] lg:p-7">
        <div className="space-y-4">
          <div className="rounded-3xl border border-gold/20 bg-gold/[.035] p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-black text-white">서비스 선택</p>
                <p className="mt-1 text-xs text-zinc-500">
                  좌우로 넘겨 원하는 서비스를 선택해주세요.
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => moveService(-1)}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/20 text-zinc-300 transition hover:border-gold/50 hover:text-gold"
                  aria-label="이전 서비스"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => moveService(1)}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-black/20 text-zinc-300 transition hover:border-gold/50 hover:text-gold"
                  aria-label="다음 서비스"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
            <div
              ref={serviceSliderRef}
              className="mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {SERVICES.map((item) => {
                const active = item.key === serviceKey;
                const Icon = serviceIcon(item.key);
                return (
                  <button
                    key={item.key}
                    data-service={item.key}
                    type="button"
                    onClick={() => slideToService(item.key)}
                    className={`relative min-h-22 w-[72%] shrink-0 snap-center overflow-hidden rounded-2xl border p-3 text-left transition duration-300 sm:w-[42%] xl:w-[29%] ${active ? "border-gold/70 bg-[radial-gradient(circle_at_top_right,rgba(222,176,67,.22),transparent_48%),rgba(222,176,67,.08)] shadow-[0_14px_40px_rgba(0,0,0,.25)]" : "border-white/8 bg-black/20 opacity-65 hover:border-gold/30 hover:opacity-100"}`}
                  >
                    <span
                      className={`grid h-8 w-8 place-items-center rounded-xl ${active ? "bg-gold text-black" : "bg-white/5 text-zinc-500"}`}
                    >
                      <Icon size={16} />
                    </span>
                    <span className="mt-2 flex items-center gap-1.5">
                      <b
                        className={`block truncate text-xs ${active ? "text-white" : "text-zinc-400"}`}
                      >
                        {item.label}
                      </b>
                      {item.category && (
                        <small
                          className={`rounded-full border px-2 py-0.5 text-[9px] font-black ${active ? "border-gold/30 bg-gold/10 text-gold" : "border-white/10 text-zinc-600"}`}
                        >
                          {item.category}
                        </small>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[9px] text-zinc-600">
                      {item.unit} 단위 견적
                    </span>
                    {active && (
                      <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-gold text-black">
                        <Check size={11} strokeWidth={4} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-center gap-1.5">
              {SERVICES.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => slideToService(item.key)}
                  className={`h-1.5 rounded-full transition-all ${item.key === serviceKey ? "w-7 bg-gold" : "w-1.5 bg-white/15"}`}
                  aria-label={`${item.label} 선택`}
                />
              ))}
            </div>
          </div>

          {needsCurrentRank && (
            <RankPicker
              title={currentRankTitle}
              hint={currentRankHint}
              tierIndex={currentTier}
              division={currentDivision}
              onTierChange={selectCurrentTier}
              onDivisionChange={selectCurrentDivision}
              hideDivision={
                serviceKey === "placement" || serviceKey === "hourly"
              }
              splitDiamond={serviceKey === "hourly"}
              splitMaster={serviceKey === "hourly"}
              minTierIndex={serviceKey === "high-score" ? 6 : 0}
              maxTierIndex={
                serviceKey === "hourly"
                  ? 7
                  : serviceKey === "low-win"
                    ? 6
                    : TIERS.length - 1
              }
              divisionOptions={
                serviceKey === "low-win" && currentTier === 6
                  ? [4, 3, 2]
                  : undefined
              }
            />
          )}

          {needsCurrentLp && (
            <div className="rounded-3xl border border-white/8 bg-black/20 p-5">
              <label className="block max-w-sm">
                <span className="text-xs font-black text-zinc-400">
                  현재 LP
                </span>
                <span className="relative mt-2 block">
                  <select
                    value={currentLp}
                    onChange={(event) =>
                      setCurrentLp(Number(event.target.value))
                    }
                    className="w-full appearance-none rounded-2xl border border-white/8 bg-[#15130f] px-4 py-3 text-sm font-bold text-white outline-none focus:border-gold/50"
                  >
                    {LP_OPTIONS.map((lp, index) => (
                      <option key={lp} value={index}>
                        {lp} LP
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                </span>
              </label>
            </div>
          )}

          {serviceKey !== "low-win" && (
          <div className="rounded-3xl border border-white/8 bg-black/20 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-black text-white">{quantityTitle}</h3>
                <p className="mt-1 text-xs text-zinc-500">
                  원하는 신청 수량을 {service.unit} 단위로 입력해주세요.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => changeQuantity(-service.step)}
                  aria-label={`신청 수량 ${service.step} ${service.unit} 줄이기`}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-zinc-300 hover:border-gold/40"
                >
                  <Minus size={15} />
                </button>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={quantity}
                    onChange={(event) => {
                      const value = Number(
                        event.target.value.replace(/[^0-9]/g, ""),
                      );
                      setQuantity(
                        Math.min(
                          service.max,
                          Math.max(service.min, value || service.min),
                        ),
                      );
                    }}
                    className="w-32 rounded-2xl border border-gold/25 bg-black/30 py-3 pl-4 pr-12 text-center font-black text-white outline-none focus:border-gold"
                    aria-label={`신청 ${service.unit}`}
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gold">
                    {service.unit}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => changeQuantity(service.step)}
                  aria-label={`신청 수량 ${service.step} ${service.unit} 늘리기`}
                  className="grid h-11 w-11 place-items-center rounded-full border border-white/10 text-zinc-300 hover:border-gold/40"
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>
          </div>
          )}

          {needsTargetRank && (
            <RankPicker
              title="목표 랭크"
              hint="달성하고 싶은 티어와 단계를 선택해주세요."
              tierIndex={targetTier}
              division={targetDivision}
              onTierChange={(index) => {
                setTargetTier(index);
                setTargetDivision(
                  serviceKey === "low-win" && index === 0
                    ? 3
                    : TIERS[index].divisions[0],
                );
              }}
              onDivisionChange={setTargetDivision}
              minTierIndex={serviceKey === "high-score" ? 6 : 0}
              maxTierIndex={serviceKey === "low-win" ? 6 : TIERS.length - 1}
              divisionOptions={
                serviceKey === "low-win" && targetTier === 0
                  ? [3, 2, 1]
                  : undefined
              }
            />
          )}

          {!serviceRankValid && (
            <p className="rounded-2xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm font-bold text-red-300">
              {serviceKey === "low-win"
                ? "저티어 티어 보장제는 다이아몬드 이하만 신청할 수 있습니다."
                : "고티어 점수 보장제는 다이아몬드 이상만 신청할 수 있습니다."}
            </p>
          )}
          {serviceRankValid && !validTarget && (
            <p className="rounded-2xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-sm font-bold text-red-300">
              목표 랭크는 현재 랭크보다 높게 선택해주세요.
            </p>
          )}

          <div className="hidden">
            <h3 className="font-black text-white">
              추가 옵션{" "}
              <span className="ml-1 text-xs font-medium text-zinc-600">
                선택 사항
              </span>
            </h3>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
              {visibleAddons.map((item) => {
                const active = addons.includes(item.key);
                const locked =
                  item.key === "champion" && !addons.includes("lane");
                return (
                  <button
                    key={item.key}
                    type="button"
                    disabled={locked}
                    onClick={() => toggleAddon(item.key)}
                    className={`rounded-2xl border p-4 text-left transition ${locked ? "cursor-not-allowed border-white/5 bg-white/[.01] opacity-35" : active ? "border-gold/60 bg-gold/10" : "border-white/8 bg-white/[.02] hover:border-gold/25"}`}
                  >
                    <span className="flex items-center justify-between">
                      <b className="text-sm text-white">{item.label}</b>
                      <i
                        className={`grid h-5 w-5 place-items-center rounded-full border not-italic ${active ? "border-gold bg-gold text-black" : "border-white/15"}`}
                      >
                        {active && <Check size={12} strokeWidth={4} />}
                      </i>
                    </span>
                    <span className="mt-1 block text-[11px] text-zinc-500">
                      {locked ? "라인 지정 선택 후 이용" : item.desc}
                    </span>
                    <span className="mt-3 block text-xs font-black text-gold">
                      {item.key === "champion"
                        ? "최대 3개"
                        : item.perGame
                          ? `+${won(item.perGame)} / 판`
                          : item.rate
                            ? `+${item.rate * 100}%`
                            : "무료"}
                    </span>
                  </button>
                );
              })}
            </div>
            {addons.includes("lane") && (
              <div className="mt-4 rounded-2xl border border-gold/15 bg-gold/[.04] p-4">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-white">
                      희망 라인 선택
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      여러 라인을 중복으로 선택할 수 있습니다.
                    </p>
                  </div>
                  {selectedLanes.length > 0 && (
                    <span className="mt-2 text-xs font-bold text-gold sm:mt-0">
                      {selectedLanes.join(" · ")}
                    </span>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {LANES.map((lane) => {
                    const active = selectedLanes.includes(lane);
                    return (
                      <button
                        key={lane}
                        type="button"
                        onClick={() => toggleLane(lane)}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition ${active ? "border-gold bg-gold text-black" : "border-white/10 bg-black/20 text-zinc-400 hover:border-gold/35"}`}
                      >
                        <span
                          className={`grid h-4 w-4 place-items-center rounded border ${active ? "border-black/30 bg-black/10" : "border-white/20"}`}
                        >
                          {active && <Check size={10} strokeWidth={4} />}
                        </span>
                        {lane}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {addons.includes("champion") && (
              <div className="mt-4 rounded-2xl border border-gold/15 bg-gold/[.04] p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-white">
                      희망 챔피언 선택{" "}
                      <span
                        className={`ml-1 text-xs ${championSelectionValid ? "text-gold" : "text-red-300"}`}
                      >
                        {selectedChampions.length}개 선택
                      </span>
                    </p>
                    <p className="mt-1 text-[11px] text-zinc-500">
                      무료 지정을 위해 최소 3개 이상 선택해주세요.
                    </p>
                  </div>
                  <input
                    type="search"
                    value={championSearch}
                    onChange={(event) => setChampionSearch(event.target.value)}
                    placeholder="챔피언 검색"
                    className="rounded-xl border border-white/10 bg-black/25 px-4 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-gold/50 sm:w-56"
                  />
                </div>
                {!championSelectionValid && (
                  <p className="mt-3 rounded-xl border border-red-400/15 bg-red-400/[.06] px-3 py-2 text-[11px] font-bold text-red-300">
                    챔피언을 {3 - selectedChampions.length}개 더 선택해주세요.
                  </p>
                )}
                {selectedChampions.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedChampions.map((id) => {
                      const champion = champions.find((item) => item.id === id);
                      if (!champion) return null;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => toggleChampion(id)}
                          className="flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 py-1 pl-1 pr-3 text-xs font-bold text-gold-soft"
                        >
                          <Image
                            src={`/images/champion/${champion.id}.png`}
                            alt=""
                            width={24}
                            height={24}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                          {champion.name}
                          <span className="text-zinc-500">×</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="mt-4 grid max-h-56 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-6">
                  {championsLoading ? (
                    <p className="col-span-full py-6 text-center text-xs text-zinc-500">
                      챔피언을 불러오는 중입니다.
                    </p>
                  ) : (
                    filteredChampions.map((champion) => {
                      const active = selectedChampions.includes(champion.id);
                      return (
                        <button
                          key={champion.id}
                          type="button"
                          onClick={() => toggleChampion(champion.id)}
                          className={`rounded-xl border p-2 text-center transition ${active ? "border-gold bg-gold/12" : "border-white/8 bg-black/20 hover:border-gold/30"}`}
                        >
                          <Image
                            src={`/images/champion/${champion.id}.png`}
                            alt=""
                            width={38}
                            height={38}
                            className="mx-auto h-9 w-9 rounded-full object-cover"
                          />
                          <span
                            className={`mt-1 block truncate text-[10px] font-bold ${active ? "text-gold" : "text-zinc-500"}`}
                          >
                            {champion.name}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="rounded-3xl border border-gold/25 bg-[radial-gradient(circle_at_top_right,rgba(222,176,67,.15),transparent_45%),rgba(0,0,0,.32)] p-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-gold">예상 견적</p>
            <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-500">
              <BadgeCheck size={13} /> 실시간 계산
            </span>
          </div>
          <div className="mt-4 rounded-2xl border border-gold/15 bg-gold/[.06] px-4 py-3">
            <p className="text-[10px] font-bold text-zinc-500">선택 서비스</p>
            <p className="mt-1 flex items-center gap-2 text-sm font-black text-gold-soft">
              {service.label}
              {service.category && (
                <span className="rounded-full border border-gold/25 px-2 py-0.5 text-[9px]">
                  {service.category}
                </span>
              )}
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              {serviceKey === "low-win"
                ? `${validTarget ? quote.steps : 0}구간 신청`
                : `${quantity.toLocaleString("ko-KR")}${service.unit} 신청`}
            </p>
          </div>

          <div className="mt-4 border-t border-white/8 pt-4">
            <p className="text-xs font-black text-white">
              추가 옵션{" "}
              <span className="ml-1 font-medium text-zinc-600">선택</span>
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {visibleAddons.map((item) => {
                const active = addons.includes(item.key);
                const locked =
                  item.key === "champion" && !addons.includes("lane");
                return (
                  <button
                    key={item.key}
                    type="button"
                    disabled={locked}
                    onClick={() => toggleAddon(item.key)}
                    className={`rounded-xl border p-3 text-left transition ${locked ? "cursor-not-allowed border-white/5 bg-black/10 opacity-35" : active ? "border-gold/60 bg-gold/10" : "border-white/8 bg-black/20 hover:border-gold/25"}`}
                  >
                    <span className="flex items-center justify-between gap-1">
                      <b className="truncate text-[11px] text-white">
                        {item.label}
                      </b>
                      <i
                        className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border not-italic ${active ? "border-gold bg-gold text-black" : "border-white/15"}`}
                      >
                        {active && <Check size={9} strokeWidth={4} />}
                      </i>
                    </span>
                    <span
                      className={`mt-2 block text-[10px] font-black ${locked ? "text-zinc-600" : "text-gold"}`}
                    >
                      {locked
                        ? "라인 먼저 선택"
                        : item.key === "lane"
                          ? active
                            ? "지정됨"
                            : "라인 미지정 시 -5%"
                          : item.key === "champion"
                            ? selectedChampions.length === 1
                              ? "+20%"
                              : selectedChampions.length === 2
                                ? "+10%"
                                : selectedChampions.length >= 3
                                  ? "무료"
                                  : "1개 이상 선택"
                            : item.perGame
                              ? `+${won(item.perGame)}/판`
                              : item.rate
                                ? `+${item.rate * 100}%`
                                : "무료"}
                    </span>
                  </button>
                );
              })}
            </div>

            {addons.includes("lane") && (
              <div className="mt-3 rounded-xl border border-gold/15 bg-gold/4 p-3">
                <p className="text-[11px] font-black text-white">
                  희망 라인{" "}
                  <span className="font-medium text-zinc-600">복수 선택</span>
                </p>
                <div className="mt-2 grid grid-cols-3 gap-1.5">
                  {LANES.map((lane) => {
                    const active = selectedLanes.includes(lane);
                    return (
                      <button
                        key={lane}
                        type="button"
                        onClick={() => toggleLane(lane)}
                        className={`rounded-lg border px-2 py-2 text-[10px] font-bold transition ${active ? "border-gold bg-gold text-black" : "border-white/10 text-zinc-500"}`}
                      >
                        {lane}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {addons.includes("champion") && (
              <div className="mt-3 rounded-xl border border-gold/15 bg-gold/[.04] p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-black text-white">
                    희망 챔피언
                  </p>
                  <span
                    className={`text-[10px] font-black ${championSelectionValid ? "text-gold" : "text-red-300"}`}
                  >
                    {selectedChampions.length}개 선택
                  </span>
                </div>
                <p className="mt-1 text-[9px] text-zinc-500">
                  1개 +20% · 2개 +10% · 3개 이상 무료
                </p>
                <input
                  type="search"
                  value={championSearch}
                  onChange={(event) => setChampionSearch(event.target.value)}
                  placeholder="챔피언 검색"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-gold/50"
                />
                {!championSelectionValid && (
                  <p className="mt-2 text-[10px] font-bold text-red-300">
                    챔피언을 1개 이상 선택해주세요.
                  </p>
                )}
                <div className="mt-2 grid max-h-44 grid-cols-3 gap-1.5 overflow-y-auto pr-1">
                  {championsLoading ? (
                    <p className="col-span-full py-4 text-center text-[10px] text-zinc-500">
                      불러오는 중
                    </p>
                  ) : (
                    filteredChampions.map((champion) => {
                      const active = selectedChampions.includes(champion.id);
                      return (
                        <button
                          key={champion.id}
                          type="button"
                          onClick={() => toggleChampion(champion.id)}
                          className={`rounded-lg border p-1.5 text-center ${active ? "border-gold bg-gold/12" : "border-white/8 bg-black/20"}`}
                        >
                          <Image
                            src={`/images/champion/${champion.id}.png`}
                            alt=""
                            width={30}
                            height={30}
                            className="mx-auto h-7 w-7 rounded-full object-cover"
                          />
                          <span
                            className={`mt-1 block truncate text-[9px] font-bold ${active ? "text-gold" : "text-zinc-600"}`}
                          >
                            {champion.name}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="mt-6 space-y-3 border-y border-white/8 py-5 text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">기본 금액</span>
              <b className="text-zinc-200">
                {priceConsultRequired
                  ? "별도 상담"
                  : validTarget
                    ? won(quote.base)
                    : "-"}
              </b>
            </div>
            {!priceConsultRequired &&
              quote.optionItems.map((item) => (
                <div key={item.label} className="flex justify-between gap-3">
                  <span className="text-zinc-500">{item.label}</span>
                  <b className="shrink-0 text-red-400">+{won(item.amount)}</b>
                </div>
              ))}
            {!priceConsultRequired && quote.optionItems.length === 0 && (
              <div className="flex justify-between">
                <span className="text-zinc-500">추가 옵션</span>
                <b className="text-zinc-400">0원</b>
              </div>
            )}
            {!priceConsultRequired && quote.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-zinc-500">라인 미지정 할인</span>
                <b className="text-emerald-400">-{won(quote.discount)}</b>
              </div>
            )}
            {serviceKey === "hourly" && (
              <div className="flex justify-between gap-3">
                <span className="text-zinc-500">승률 보장</span>
                <b
                  className={`shrink-0 ${quantity >= 10 ? "text-gold" : "text-zinc-400"}`}
                >
                  {quantity >= 10
                    ? guaranteeLabel
                    : `${10 - quantity}시간 더 필요`}
                </b>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-zinc-500">예상 소요</span>
              <b className="flex items-center gap-1 text-zinc-200">
                <Clock3 size={13} />{" "}
                {validTarget ? `약 ${estimatedDays}일` : "-"}
              </b>
            </div>
          </div>
          <div className="mt-5">
            <p className="text-xs font-bold text-zinc-500">총 예상 금액</p>
            <p className="mt-1 text-3xl font-black tracking-tight text-white">
              {priceConsultRequired
                ? "별도 상담"
                : validTarget
                  ? won(quote.total)
                  : "계산 불가"}
            </p>
            <p className="mt-2 text-[11px] leading-5 text-zinc-600">
              계정 상태와 요청 조건에 따라 최종 금액이 달라질 수 있습니다.
            </p>
          </div>
          <a
            href={site.kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 text-sm font-black transition ${formValid ? "bg-gold-gradient text-black hover:brightness-110" : "pointer-events-none bg-white/5 text-zinc-600"}`}
          >
            <MessageCircle size={16} /> 이 견적으로 상담하기
          </a>
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold text-zinc-600">
            <ShieldCheck size={13} className="text-gold" /> 상담 전 별도 결제가
            발생하지 않습니다.
          </div>
        </aside>
      </div>
    </div>
  );
}
