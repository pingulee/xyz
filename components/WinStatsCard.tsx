"use client";

import { useState } from "react";
import Image from "next/image";
import { Swords } from "lucide-react";
import { TIER_ICON_BY_NAME } from "@/components/TierRecords";
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
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-gold-gradient transition-all duration-500"
            style={{ width: `${winRate}%` }}
          />
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
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-gold-gradient transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-24 shrink-0 text-right text-xs font-bold text-zinc-500">
                    {t.wins}승 {t.losses}패
                    <span className="ml-1.5 font-black text-white">{pct}%</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
