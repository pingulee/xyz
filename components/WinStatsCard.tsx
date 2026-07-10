"use client";

import { useState } from "react";
import Image from "next/image";
import { Swords } from "lucide-react";
import {
  TIER_ICON_BY_NAME,
  kdaRatingClass,
  kdaRatioLabel,
} from "@/components/TierRecords";
import type { WinStatsGroup } from "@/lib/lineups";

type TabKey = "total" | "boost" | "duo";

export default function WinStatsCard({
  stats,
}: {
  stats: { total: WinStatsGroup; boost: WinStatsGroup; duo: WinStatsGroup };
}) {
  const tabs = (
    [
      { key: "total", label: "전체", data: stats.total },
      { key: "boost", label: "대리", data: stats.boost },
      { key: "duo", label: "듀오", data: stats.duo },
    ] as { key: TabKey; label: string; data: WinStatsGroup }[]
  ).filter(({ key, data }) => key === "total" || data.wins + data.losses > 0);

  const [activeKey, setActiveKey] = useState<TabKey>("total");
  const active = tabs.find((tab) => tab.key === activeKey) ?? tabs[0];
  const games = active.data.wins + active.data.losses;
  const winRate = games > 0 ? Math.round((active.data.wins / games) * 100) : 0;

  return (
    <div className="card-premium flex h-full flex-col rounded-4xl p-6 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-black text-gold">
          <Swords size={16} />
          작업 기록
        </div>
        {tabs.length > 1 && (
          <div className="flex rounded-full border border-white/8 bg-black/30 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveKey(tab.key)}
                className={`rounded-full px-4 py-1.5 text-xs font-black transition ${
                  tab.key === active.key
                    ? "bg-gold-gradient text-black"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-xs font-black text-zinc-500">
              {active.label} 승률
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl font-black text-white">{winRate}%</span>
              <span className="text-sm font-bold text-zinc-500">
                {active.data.wins}승 {active.data.losses}패
              </span>
            </div>
          </div>
          <div className="pb-1 text-xs font-bold text-zinc-500">총 {games}판</div>
        </div>
        <div className="mt-3 flex h-6 overflow-hidden rounded-md text-xs font-black text-white">
          {active.data.wins > 0 && (
            <div
              className="flex items-center bg-[#5383e8] pl-2.5 transition-all duration-500"
              style={{ width: `${(active.data.wins / games) * 100}%` }}
            >
              {active.data.wins}승
            </div>
          )}
          {active.data.losses > 0 && (
            <div
              className="flex items-center justify-end bg-[#e84057] pr-2.5 transition-all duration-500"
              style={{ width: `${(active.data.losses / games) * 100}%` }}
            >
              {active.data.losses}패
            </div>
          )}
        </div>
      </div>

      {active.data.byTier.length > 0 && (
        <div className="mt-6 border-t border-white/6 pt-5">
          <div className="text-xs font-black text-zinc-500">티어별 승률</div>
          <div className="mt-3 grid gap-2.5">
            {active.data.byTier.map((t) => {
              const total = t.wins + t.losses;
              const pct = total > 0 ? Math.round((t.wins / total) * 100) : 0;
              return (
                <div key={t.tier} className="flex items-center gap-3">
                  <span className="flex w-28 shrink-0 items-center gap-2 text-xs font-black text-zinc-300">
                    {TIER_ICON_BY_NAME[t.tier] && (
                      <Image
                        src={TIER_ICON_BY_NAME[t.tier]}
                        alt={t.tier}
                        width={22}
                        height={22}
                        className="rounded-full bg-zinc-900"
                      />
                    )}
                    {t.tier}
                  </span>
                  <div className="flex h-5 flex-1 overflow-hidden rounded-md text-[11px] font-black text-white">
                    {t.wins > 0 && (
                      <div
                        className="flex items-center bg-[#5383e8] pl-2 transition-all duration-500"
                        style={{ width: `${(t.wins / total) * 100}%` }}
                      >
                        {t.wins}승
                      </div>
                    )}
                    {t.losses > 0 && (
                      <div
                        className="flex items-center justify-end bg-[#e84057] pr-2 transition-all duration-500"
                        style={{ width: `${(t.losses / total) * 100}%` }}
                      >
                        {t.losses}패
                      </div>
                    )}
                  </div>
                  <span
                    className={`w-10 shrink-0 text-right text-xs font-black ${
                      pct >= 60 ? "text-red-400" : "text-white"
                    }`}
                  >
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {active.data.byChampion.length > 0 && (
        <div className="mt-6 border-t border-white/6 pt-5">
          <div className="text-xs font-black text-zinc-500">챔피언별 전적</div>
          <div className="mt-3 grid gap-2">
            {active.data.byChampion.map((c) => {
              const total = c.wins + c.losses;
              const pct = total > 0 ? Math.round((c.wins / total) * 100) : 0;
              const kdaRatio = kdaRatioLabel({
                kills: c.kills ?? undefined,
                deaths: c.deaths ?? undefined,
                assists: c.assists ?? undefined,
              });
              return (
                <div
                  key={c.champion}
                  className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/20 px-3 py-2.5"
                >
                  {c.image ? (
                    <Image
                      src={c.image}
                      alt={c.champion}
                      width={40}
                      height={40}
                      className="shrink-0 rounded-xl border border-white/10 bg-zinc-900 object-cover"
                    />
                  ) : (
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-zinc-900 text-sm font-black text-zinc-500">
                      {c.champion.charAt(0)}
                    </span>
                  )}
                  <p className="min-w-0 flex-1 truncate text-sm font-black text-white">
                    {c.champion}
                  </p>
                  {kdaRatio && (
                    <div className="flex-1 shrink-0 text-center">
                      <p
                        className={`text-sm font-black ${kdaRatingClass({
                          kills: c.kills ?? undefined,
                          deaths: c.deaths ?? undefined,
                          assists: c.assists ?? undefined,
                        })}`}
                      >
                        {kdaRatio === "Perfect" ? "Perfect" : `평점 ${kdaRatio}`}
                      </p>
                      <p className="text-[11px] font-bold text-zinc-400">
                        {(c.kills ?? 0).toFixed(1)} / {(c.deaths ?? 0).toFixed(1)} /{" "}
                        {(c.assists ?? 0).toFixed(1)}
                      </p>
                    </div>
                  )}
                  <div className="w-24 shrink-0 text-center">
                    <p
                      className={`text-sm font-black ${
                        pct >= 60 ? "text-red-400" : "text-white"
                      }`}
                    >
                      {pct}%
                    </p>
                    <p className="text-[11px] font-bold text-zinc-500">
                      {total} 게임
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
