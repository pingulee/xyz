"use client";

import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";
import { useChampionOptions } from "@/components/useChampionOptions";
import type { TierRecord } from "@/lib/reviews";

export const TIER_OPTIONS = [
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

export const TIER_ICON_BY_NAME: Record<string, string> = {
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

const inputCls =
  "rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-gold/50";

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

export function TierRecordEditor({
  records,
  onChange,
}: {
  records: TierRecord[];
  onChange: (records: TierRecord[]) => void;
}) {
  const { champions, loading: championsLoading } = useChampionOptions();
  const add = () =>
    onChange([...records, { tier: "골드", champion: "", wins: 0, losses: 0 }]);
  const remove = (i: number) => onChange(records.filter((_, idx) => idx !== i));
  const update = (
    i: number,
    field: keyof TierRecord,
    value: string | number | undefined,
  ) =>
    onChange(
      records.map((record, idx) =>
        idx === i ? { ...record, [field]: value } : record,
      ),
    );
  const parseAvg = (raw: string): number | undefined => {
    if (raw === "") return undefined;
    return Math.max(0, Number(raw) || 0);
  };

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-zinc-400">작업 기록</span>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/12 px-4 py-2 text-xs font-black text-gold shadow-[0_0_18px_rgba(214,184,111,0.12)] transition hover:border-gold/70 hover:bg-gold/18 hover:text-white"
        >
          <Plus size={11} /> 추가
        </button>
      </div>

      {records.map((record, i) => (
        <div
          key={i}
          className="grid gap-2 rounded-2xl border border-white/8 bg-white/[.025] p-3"
        >
          <div className="flex items-center gap-2">
            <select
              value={record.tier}
              onChange={(event) => update(i, "tier", event.target.value)}
              className={`${inputCls} min-w-0 flex-1`}
            >
              {TIER_OPTIONS.map((tier) => (
                <option key={tier} value={tier}>
                  {tier}
                </option>
              ))}
            </select>
            <select
              value={record.champion ?? ""}
              onChange={(event) => update(i, "champion", event.target.value)}
              className={`${inputCls} min-w-0 flex-1`}
              disabled={championsLoading}
            >
              <option value="">
                {championsLoading ? "불러오는 중" : "챔피언 없음"}
              </option>
              {champions.map((champion) => (
                <option key={champion.id} value={champion.name}>
                  {champion.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => remove(i)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-zinc-500 transition hover:border-red-400/40 hover:text-red-300"
              aria-label="작업 기록 삭제"
            >
              <Trash2 size={12} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <label className="grid gap-1">
              <span className="text-[10px] font-black text-zinc-500">승</span>
              <input
                type="number"
                min={0}
                max={999}
                value={record.wins}
                onChange={(event) =>
                  update(i, "wins", Math.max(0, Number(event.target.value) || 0))
                }
                className={`${inputCls} w-full text-center`}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-[10px] font-black text-zinc-500">패</span>
              <input
                type="number"
                min={0}
                max={999}
                value={record.losses}
                onChange={(event) =>
                  update(i, "losses", Math.max(0, Number(event.target.value) || 0))
                }
                className={`${inputCls} w-full text-center`}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-[10px] font-black text-zinc-500">평균 킬</span>
              <input
                type="number"
                min={0}
                step={0.1}
                value={record.kills ?? ""}
                onChange={(event) => update(i, "kills", parseAvg(event.target.value))}
                className={`${inputCls} w-full text-center`}
                placeholder="-"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-[10px] font-black text-zinc-500">평균 데스</span>
              <input
                type="number"
                min={0}
                step={0.1}
                value={record.deaths ?? ""}
                onChange={(event) => update(i, "deaths", parseAvg(event.target.value))}
                className={`${inputCls} w-full text-center`}
                placeholder="-"
              />
            </label>
            <label className="grid gap-1">
              <span className="text-[10px] font-black text-zinc-500">평균 어시</span>
              <input
                type="number"
                min={0}
                step={0.1}
                value={record.assists ?? ""}
                onChange={(event) => update(i, "assists", parseAvg(event.target.value))}
                className={`${inputCls} w-full text-center`}
                placeholder="-"
              />
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TierRecordBadges({
  records,
  className = "grid gap-2 sm:grid-cols-2",
}: {
  records: TierRecord[];
  className?: string;
}) {
  if (records.length === 0) return null;

  return (
    <div className={className}>
      {records.map((record, index) => {
        const icon = TIER_ICON_BY_NAME[record.tier];
        const total = record.wins + record.losses;
        const rate = total > 0 ? Math.round((record.wins / total) * 100) : 0;
        const kdaRatio = kdaRatioLabel(record);

        return (
          <div
            key={`${record.tier}-${record.champion ?? ""}-${index}`}
            className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-3 py-2"
          >
            {icon && (
              <Image
                src={icon}
                alt={record.tier}
                width={28}
                height={28}
                className="rounded-full bg-zinc-900"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-gold">{record.tier}</p>
              <p className="text-xs font-bold text-zinc-400">
                {record.champion ? `${record.champion} · ` : ""}
                {record.wins}승 {record.losses}패
              </p>
              {kdaRatio && (
                <p className="text-xs font-bold text-zinc-500">
                  KDA {(record.kills ?? 0).toFixed(1)} /{" "}
                  {(record.deaths ?? 0).toFixed(1)} /{" "}
                  {(record.assists ?? 0).toFixed(1)}
                  <span className="ml-1 text-gold">({kdaRatio})</span>
                </p>
              )}
            </div>
            <span className="text-sm font-black text-white">{rate}%</span>
          </div>
        );
      })}
    </div>
  );
}
