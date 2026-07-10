"use client";

import Image from "next/image";
import { Copy, Plus, Trash2 } from "lucide-react";
import { useChampionOptions } from "@/components/useChampionOptions";
import type { TierRecord } from "@/lib/reviews";

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
}: {
  records: TierRecord[];
  onChange: (records: TierRecord[]) => void;
}) {
  const { champions, loading: championsLoading } = useChampionOptions();
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
          className="grid gap-2 rounded-2xl border border-white/8 bg-white/2.5 p-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end"
        >
          <select
            value={record.tier}
            onChange={(event) => update(i, "tier", event.target.value)}
            className={`${inputCls} min-w-0 ${record.tier ? "" : "border-gold/40! text-zinc-500"}`}
          >
            <option value="" disabled={Boolean(record.tier)}>
              티어 선택
            </option>
            {TIER_OPTIONS.map((tier) => (
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
        const kdaRatio = kdaRatioLabel(record);
        const isPerGame = typeof record.win === "boolean";
        const wins = record.wins ?? 0;
        const losses = record.losses ?? 0;
        const total = wins + losses;
        const rate = total > 0 ? Math.round((wins / total) * 100) : 0;

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
              <p className="text-xs font-black text-gold">
                {record.tier}
                {record.champion ? (
                  <span className="ml-1.5 text-zinc-300">{record.champion}</span>
                ) : null}
              </p>
              {isPerGame ? (
                kdaRatio && (
                  <p className="text-xs font-bold text-zinc-400">
                    {record.kills ?? 0} / {record.deaths ?? 0} / {record.assists ?? 0}
                    <span className="ml-1 text-zinc-500">({kdaRatio})</span>
                  </p>
                )
              ) : (
                <>
                  <p className="text-xs font-bold text-zinc-400">
                    {wins}승 {losses}패
                  </p>
                  {kdaRatio && (
                    <p className="text-xs font-bold text-zinc-500">
                      KDA {(record.kills ?? 0).toFixed(1)} /{" "}
                      {(record.deaths ?? 0).toFixed(1)} /{" "}
                      {(record.assists ?? 0).toFixed(1)}
                      <span className="ml-1 text-gold">({kdaRatio})</span>
                    </p>
                  )}
                </>
              )}
            </div>
            {isPerGame ? (
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-black ${
                  record.win
                    ? "bg-emerald-400/15 text-emerald-300"
                    : "bg-red-400/15 text-red-300"
                }`}
              >
                {record.win ? "승리" : "패배"}
              </span>
            ) : (
              <span className="text-sm font-black text-white">{rate}%</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
