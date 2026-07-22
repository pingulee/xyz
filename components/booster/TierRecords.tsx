"use client";

import Image from "next/image";
import { Copy, Plus, Trash2 } from "lucide-react";
import { useChampionOptions } from "@/hooks/useChampionOptions";
import type { TierRecord } from "@/lib/review";

export const TIER_OPTIONS = [
  "언랭크",
  "아이언",
  "브론즈",
  "실버",
  "골드",
  "플래티넘",
  "에메랄드",
  "다이아몬드",
  "마스터",
  "그랜드마스터",
  "챌린저",
];

// 듀오는 마스터/그랜드마스터/챌린저 불가 → 서비스별 선택 가능 티어
const DUO_EXCLUDED_TIERS = ["마스터", "그랜드마스터", "챌린저"];
function tierOptionsForService(service?: string) {
  return service && service.includes("듀오")
    ? TIER_OPTIONS.filter((t) => !DUO_EXCLUDED_TIERS.includes(t))
    : TIER_OPTIONS;
}

export const TIER_ICON_BY_NAME: Record<string, string> = {
  언랭크: "/images/tier/0-unrank.png",
  아이언: "/images/tier/1-iron.png",
  브론즈: "/images/tier/2-bronze.png",
  실버: "/images/tier/3-silver.png",
  골드: "/images/tier/4-gold.png",
  플래티넘: "/images/tier/5-platinum.png",
  에메랄드: "/images/tier/6-emerald.png",
  다이아몬드: "/images/tier/7-diamond.png",
  마스터: "/images/tier/8-master.png",
  그랜드마스터: "/images/tier/9-grandmaster.png",
  챌린저: "/images/tier/10-challenger.png",
};

export const TIER_EN_BY_NAME: Record<string, string> = {
  언랭크: "Unranked",
  아이언: "Iron",
  브론즈: "Bronze",
  실버: "Silver",
  골드: "Gold",
  플래티넘: "Platinum",
  에메랄드: "Emerald",
  다이아몬드: "Diamond",
  마스터: "Master",
  그랜드마스터: "Grandmaster",
  챌린저: "Challenger",
};

const inputCls =
  "rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50";

/** 모든 게임 기록에 티어·챔피언·킬/데스/어시가 빠짐없이 입력되었는지 확인 */
export function isTierRecordsComplete(records: TierRecord[]): boolean {
  return records.every(
    (record) =>
      record.tier !== "" &&
      (record.champion ?? "") !== "" &&
      record.kills !== undefined &&
      record.deaths !== undefined &&
      record.assists !== undefined,
  );
}

/** OP.GG 스타일 평점 색상: 3 미만 회색, 3점대 초록, 4점대 파랑, 5 이상(Perfect 포함) 주황 */
export function kdaRatingClass(
  record: Pick<TierRecord, "kills" | "deaths" | "assists">,
): string {
  const deaths = record.deaths ?? 0;
  const ratio =
    deaths > 0
      ? ((record.kills ?? 0) + (record.assists ?? 0)) / deaths
      : Infinity;
  if (ratio >= 5) return "text-orange-400";
  if (ratio >= 4) return "text-blue-400";
  if (ratio >= 3) return "text-emerald-400";
  return "text-zinc-400";
}

export function kdaRatioLabel(record: Pick<TierRecord, "kills" | "deaths" | "assists">): string | null {
  const { kills, deaths, assists } = record;
  if (kills === undefined && deaths === undefined && assists === undefined) {
    return null;
  }
  const k = kills ?? 0;
  const d = deaths ?? 0;
  const a = assists ?? 0;
  if (d <= 0) return "Perfect";
  return ((k + a) / d).toFixed(2);
}

/**
 * 구형식(승/패 집계) 기록을 판별 기록으로 펼친다.
 * 기사가 기존 답변을 수정할 때 에디터에 넣기 전에 호출한다.
 */
export function normalizeTierRecords(records: TierRecord[]): TierRecord[] {
  return records.flatMap((record) => {
    if (typeof record.win === "boolean") return [record];
    const wins = Math.max(0, Math.floor(Number(record.wins) || 0));
    const losses = Math.max(0, Math.floor(Number(record.losses) || 0));
    const base = {
      tier: record.tier,
      champion: record.champion ?? "",
      kills: record.kills !== undefined ? Math.round(record.kills) : undefined,
      deaths: record.deaths !== undefined ? Math.round(record.deaths) : undefined,
      assists: record.assists !== undefined ? Math.round(record.assists) : undefined,
    };
    return [
      ...Array.from({ length: wins }, () => ({ ...base, win: true })),
      ...Array.from({ length: losses }, () => ({ ...base, win: false })),
    ];
  });
}

export function TierRecordEditor({
  records,
  onChange,
  service,
}: {
  records: TierRecord[];
  onChange: (records: TierRecord[]) => void;
  /** 리뷰 서비스("롤 듀오" 등). 듀오면 마스터/그마/챌린저 선택 불가 */
  service?: string;
}) {
  const { champions, loading: championsLoading } = useChampionOptions();
  const tierOptions = tierOptionsForService(service);
  const add = () =>
    onChange([...records, { tier: "", champion: "", win: true }]);
  const duplicate = (i: number) =>
    onChange([
      ...records.slice(0, i + 1),
      { ...records[i] },
      ...records.slice(i + 1),
    ]);
  const remove = (i: number) => onChange(records.filter((_, idx) => idx !== i));
  const update = (
    i: number,
    field: keyof TierRecord,
    value: string | number | boolean | undefined,
  ) =>
    onChange(
      records.map((record, idx) =>
        idx === i ? { ...record, [field]: value } : record,
      ),
    );
  const parseCount = (raw: string): number | undefined => {
    if (raw === "") return undefined;
    return Math.min(99, Math.max(0, Math.floor(Number(raw) || 0)));
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-black text-zinc-400">작업 기록</span>
          <span className="ml-2 text-[11px] text-zinc-600">게임 1판마다 추가해주세요</span>
        </div>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/12 px-4 py-2 text-xs font-black text-gold shadow-[0_0_18px_rgba(214,184,111,0.12)] transition hover:border-gold/70 hover:bg-gold/18 hover:text-white"
        >
          <Plus size={11} /> 게임 추가
        </button>
      </div>

      {records.map((record, i) => (
        <div
          key={i}
          className="grid gap-2 rounded-2xl border border-white/8 bg-white/2.5 p-2"
        >
          <div className="grid grid-cols-2 gap-2">
            <select
              value={record.tier}
              onChange={(event) => update(i, "tier", event.target.value)}
              className={`${inputCls} min-w-0 ${record.tier ? "" : "border-gold/40! text-zinc-500"}`}
            >
              <option value="" disabled={Boolean(record.tier)}>
                티어 선택
              </option>
              {tierOptions.map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </select>
            <select
              value={record.champion ?? ""}
              onChange={(event) => update(i, "champion", event.target.value)}
              className={`${inputCls} min-w-0 ${record.champion ? "" : "border-gold/40! text-zinc-500"}`}
              disabled={championsLoading}
            >
              <option value="" disabled={Boolean(record.champion)}>
                {championsLoading ? "불러오는 중" : "챔피언 선택"}
              </option>
              {champions.map((champion) => (
                <option key={champion.id} value={champion.name}>
                  {champion.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex shrink-0 rounded-full border border-white/10 bg-black/30 p-0.5">
              <button
                type="button"
                onClick={() => update(i, "win", true)}
                className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                  record.win !== false
                    ? "bg-emerald-400/90 text-black"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                승
              </button>
              <button
                type="button"
                onClick={() => update(i, "win", false)}
                className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                  record.win === false
                    ? "bg-red-400/90 text-black"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                패
              </button>
            </div>
            <label className="grid min-w-0 flex-1 gap-1">
              <span className="text-center text-[10px] font-black text-zinc-500">킬</span>
              <input
                type="number"
                min={0}
                max={99}
                value={record.kills ?? ""}
                onChange={(event) => update(i, "kills", parseCount(event.target.value))}
                className={`${inputCls} w-full min-w-14 text-center`}
                placeholder="0"
              />
            </label>
            <label className="grid min-w-0 flex-1 gap-1">
              <span className="text-center text-[10px] font-black text-zinc-500">데스</span>
              <input
                type="number"
                min={0}
                max={99}
                value={record.deaths ?? ""}
                onChange={(event) => update(i, "deaths", parseCount(event.target.value))}
                className={`${inputCls} w-full min-w-14 text-center`}
                placeholder="0"
              />
            </label>
            <label className="grid min-w-0 flex-1 gap-1">
              <span className="text-center text-[10px] font-black text-zinc-500">어시</span>
              <input
                type="number"
                min={0}
                max={99}
                value={record.assists ?? ""}
                onChange={(event) => update(i, "assists", parseCount(event.target.value))}
                className={`${inputCls} w-full min-w-14 text-center`}
                placeholder="0"
              />
            </label>
            <button
              type="button"
              onClick={() => duplicate(i)}
              className="grid h-9.5 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-zinc-500 transition hover:border-gold/50 hover:text-gold"
              aria-label="게임 기록 복제"
              title="복제"
            >
              <Copy size={12} />
            </button>
            <button
              type="button"
              onClick={() => remove(i)}
              className="grid h-9.5 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-zinc-500 transition hover:border-red-400/40 hover:text-red-300"
              aria-label="게임 기록 삭제"
              title="삭제"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TierRecordBadges({
  records,
  className = "grid gap-2",
}: {
  records: TierRecord[];
  className?: string;
}) {
  if (records.length === 0) return null;

  // 판별 기록을 티어별로 합산해서 보여준다 (예: 실버 3승 0패)
  type TierGroup = {
    tier: string;
    wins: number;
    losses: number;
    killsSum: number;
    deathsSum: number;
    assistsSum: number;
    kdaGames: number;
  };
  const groups = new Map<string, TierGroup>();
  for (const record of records) {
    if (!record.tier) continue;
    const isPerGame = typeof record.win === "boolean";
    const wins = isPerGame
      ? record.win ? 1 : 0
      : Math.max(0, Math.floor(Number(record.wins) || 0));
    const losses = isPerGame
      ? record.win ? 0 : 1
      : Math.max(0, Math.floor(Number(record.losses) || 0));
    const weight = isPerGame ? 1 : wins + losses;
    const hasKda =
      weight > 0 &&
      (record.kills !== undefined ||
        record.deaths !== undefined ||
        record.assists !== undefined);
    const group = groups.get(record.tier) ?? {
      tier: record.tier,
      wins: 0,
      losses: 0,
      killsSum: 0,
      deathsSum: 0,
      assistsSum: 0,
      kdaGames: 0,
    };
    group.wins += wins;
    group.losses += losses;
    if (hasKda) {
      group.killsSum += (Number(record.kills) || 0) * weight;
      group.deathsSum += (Number(record.deaths) || 0) * weight;
      group.assistsSum += (Number(record.assists) || 0) * weight;
      group.kdaGames += weight;
    }
    groups.set(record.tier, group);
  }

  // 낮은 티어가 왼쪽(위)에 오도록 오름차순 정렬 (언랭크 → 챌린저)
  const rows = [...groups.values()].sort(
    (a, b) => TIER_OPTIONS.indexOf(a.tier) - TIER_OPTIONS.indexOf(b.tier),
  );

  return (
    <div className={className}>
      {rows.map((group) => {
        const icon = TIER_ICON_BY_NAME[group.tier];
        const total = group.wins + group.losses;
        const pct = total > 0 ? Math.round((group.wins / total) * 100) : 0;
        const avg =
          group.kdaGames > 0
            ? {
                kills: group.killsSum / group.kdaGames,
                deaths: group.deathsSum / group.kdaGames,
                assists: group.assistsSum / group.kdaGames,
              }
            : null;
        const rating = avg
          ? avg.deaths > 0
            ? ((avg.kills + avg.assists) / avg.deaths).toFixed(2)
            : "Perfect"
          : null;
        return (
          <div
            key={group.tier}
            className="flex items-center gap-2 rounded-2xl border border-white/8 bg-black/20 px-3 py-2.5 sm:gap-3"
          >
            {icon && (
              <Image
                src={icon}
                alt={group.tier}
                width={28}
                height={28}
                className="shrink-0 rounded-full bg-zinc-900"
              />
            )}
            <p className="min-w-0 flex-1 truncate text-xs font-black text-white">
              {TIER_EN_BY_NAME[group.tier] ?? group.tier}
            </p>
            {avg && (
              <div className="min-w-0 flex-1 text-center">
                <p className={`text-xs font-black whitespace-nowrap ${kdaRatingClass(avg)}`}>
                  {rating === "Perfect" ? "Perfect" : `${rating} 평점`}
                </p>
                <p className="text-[11px] whitespace-nowrap text-zinc-400">
                  {avg.kills.toFixed(1)} / {avg.deaths.toFixed(1)} /{" "}
                  {avg.assists.toFixed(1)}
                </p>
              </div>
            )}
            <div className="w-14 shrink-0 text-right sm:w-20">
              <p
                className={`text-xs ${
                  pct >= 60 ? "text-red-400" : "text-lol-gray-500"
                }`}
              >
                {pct}%
              </p>
              <p className="text-[11px] text-zinc-500">
                {total} 게임
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
