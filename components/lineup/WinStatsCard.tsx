"use client";

import { useState } from "react";
import Image from "next/image";
import { Swords } from "lucide-react";
import {
  TIER_EN_BY_NAME,
  TIER_ICON_BY_NAME,
  TIER_OPTIONS,
  kdaRatingClass,
  kdaRatioLabel,
} from "@/components/lineup/TierRecords";
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
        <div className="mt-3 flex h-6 overflow-hidden rounded-md text-xs text-white">
          {active.data.wins > 0 && (
            <div
              className="flex min-w-fit items-center bg-[#5383e8] pl-2.5 whitespace-nowrap transition-all duration-500"
              style={{ width: `${(active.data.wins / games) * 100}%` }}
            >
              {active.data.wins}승
            </div>
          )}
          {active.data.losses > 0 && (
            <div
              className="flex min-w-fit items-center justify-end bg-[#e84057] pr-2.5 whitespace-nowrap transition-all duration-500"
              style={{ width: `${(active.data.losses / games) * 100}%` }}
            >
              {active.data.losses}패
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid items-start gap-6 border-t border-white/6 pt-5 md:grid-cols-2">
          <div>
            <div className="text-xs font-black text-zinc-500">티어별 통계</div>
            <div className="mt-3 grid gap-2.5">
            {[...TIER_OPTIONS].reverse().map((tier) => {
              const t = active.data.byTier.find((row) => row.tier === tier) ?? {
                tier,
                wins: 0,
                losses: 0,
              };
              const total = t.wins + t.losses;
              const pct = total > 0 ? Math.round((t.wins / total) * 100) : 0;
              return (
                <div key={tier} className="flex items-center gap-3">
                  <span className="flex w-32 shrink-0 items-center gap-2 text-xs text-zinc-300">
                    {TIER_ICON_BY_NAME[tier] && (
                      <Image
                        src={TIER_ICON_BY_NAME[tier]}
                        alt={tier}
                        width={22}
                        height={22}
                        className="rounded-full bg-zinc-900"
                      />
                    )}
                    {TIER_EN_BY_NAME[tier] ?? tier}
                  </span>
                  <div className="flex h-5 flex-1 overflow-hidden rounded-md bg-white/6 text-[11px] text-white">
                    {t.wins > 0 && (
                      <div
                        className="flex min-w-fit items-center bg-[#5383e8] pl-2 whitespace-nowrap transition-all duration-500"
                        style={{ width: `${(t.wins / total) * 100}%` }}
                      >
                        {t.wins}승
                      </div>
                    )}
                    {t.losses > 0 && (
                      <div
                        className="flex min-w-fit items-center justify-end bg-[#e84057] pr-2 whitespace-nowrap transition-all duration-500"
                        style={{ width: `${(t.losses / total) * 100}%` }}
                      >
                        {t.losses}패
                      </div>
                    )}
                  </div>
                  <span
                    className={`w-10 shrink-0 text-right text-xs ${
                      total > 0 && pct >= 60
                        ? "text-red-400"
                        : "text-lol-gray-500"
                    }`}
                  >
                    {total > 0 ? `${pct}%` : "-"}
                  </span>
                </div>
              );
            })}
            </div>
          </div>

          {active.data.byChampion.length > 0 && (
            <div>
              <div className="text-xs font-black text-zinc-500">챔피언별 통계 TOP5</div>
              <div className="mt-3 grid gap-2">
            {active.data.byChampion.slice(0, 5).map((c, index) => {
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
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-black text-white">
                      {c.champion}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      Most {index + 1}
                    </p>
                  </div>
                  {kdaRatio && (
                    <div className="flex-1 shrink-0 text-center">
                      <p
                        className={`text-xs font-black ${kdaRatingClass({
                          kills: c.kills ?? undefined,
                          deaths: c.deaths ?? undefined,
                          assists: c.assists ?? undefined,
                        })}`}
                      >
                        {kdaRatio === "Perfect" ? "Perfect" : `${kdaRatio} 평점`}
                      </p>
                      <p className="text-[11px] whitespace-nowrap text-zinc-400">
                        {(c.kills ?? 0).toFixed(1)} / {(c.deaths ?? 0).toFixed(1)} /{" "}
                        {(c.assists ?? 0).toFixed(1)}
                      </p>
                    </div>
                  )}
                  <div className="w-20 shrink-0 text-right">
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
            </div>
          )}
      </div>

      {active.data.recent.length > 0 && (
        <div className="mt-6 border-t border-white/6 pt-5">
          <div className="text-xs font-black text-zinc-500">최근 전적</div>
          <div className="mt-3 grid gap-2">
            {active.data.recent.map((game, index) => {
              const kdaRatio = kdaRatioLabel({
                kills: game.kills ?? undefined,
                deaths: game.deaths ?? undefined,
                assists: game.assists ?? undefined,
              });
              const date = game.date
                ? new Intl.DateTimeFormat("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }).format(new Date(game.date))
                : "";
              return (
                <div
                  key={`${game.date}-${index}`}
                  className={`grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-2 rounded-2xl border px-3 py-2.5 sm:flex sm:gap-3 ${
                    game.win
                      ? "border-[#5383e8]/25 bg-[#5383e8]/12"
                      : "border-[#e84057]/25 bg-[#e84057]/12"
                  }`}
                >
                  {/* 승패 */}
                  <span
                    className={`w-12 shrink-0 rounded-full px-2 py-0.5 text-center text-[11px] font-black ${
                      game.win
                        ? "bg-[#5383e8]/20 text-[#5383e8]"
                        : "bg-[#e84057]/20 text-[#e84057]"
                    }`}
                  >
                    {game.win ? "승리" : "패배"}
                  </span>

                  {/* 여백: 승패 ↔ 챔피언 */}
                  <div className="hidden flex-1 sm:block" />

                  {/* 챔피언 이미지 + 이름 */}
                  <div className="flex min-w-0 items-center gap-2.5 sm:w-36 sm:shrink-0">
                    {game.image ? (
                      <Image
                        src={game.image}
                        alt={game.champion}
                        width={40}
                        height={40}
                        className="shrink-0 rounded-xl border border-white/10 bg-zinc-900 object-cover"
                      />
                    ) : (
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-zinc-900 text-sm font-black text-zinc-500">
                        {game.champion.charAt(0) || "?"}
                      </span>
                    )}
                    <p className="min-w-0 truncate text-xs font-black text-white">
                      {game.champion || "챔피언 미기록"}
                    </p>
                  </div>

                  {/* KDA / 평점 */}
                  <div className="w-24 shrink-0 text-center">
                    {kdaRatio && (
                      <>
                        <p className="text-[15px] font-black whitespace-nowrap text-zinc-300">
                          {game.kills ?? 0} /{" "}
                          <span className="text-red-600">{game.deaths ?? 0}</span> /{" "}
                          {game.assists ?? 0}
                        </p>
                        <p className="text-xs text-gray-500">
                          {kdaRatio === "Perfect" ? "Perfect" : `${kdaRatio} 평점`}
                        </p>
                      </>
                    )}
                  </div>

                  {/* 여백: KDA ↔ 티어 */}
                  <div className="hidden flex-1 sm:block" />

                  {/* 티어 이미지 + 티어 */}
                  <div className="flex items-center gap-1.5 sm:w-28 sm:shrink-0 sm:justify-center">
                    {TIER_ICON_BY_NAME[game.tier] && (
                      <Image
                        src={TIER_ICON_BY_NAME[game.tier]}
                        alt={game.tier}
                        width={20}
                        height={20}
                      />
                    )}
                    <span className="text-xs text-zinc-300">
                      {TIER_EN_BY_NAME[game.tier] ?? game.tier}
                    </span>
                  </div>

                  {/* 대리/듀오 */}
                  <span className="w-11 shrink-0 justify-self-center text-center">
                    {game.service && (
                      <span className="rounded-full border border-white/12 bg-black/30 px-2 py-0.5 text-[10px] text-zinc-300">
                        {game.service}
                      </span>
                    )}
                  </span>

                  {/* 날짜 */}
                  <span className="w-20 shrink-0 text-right text-[11px] whitespace-nowrap text-zinc-500">
                    {date}
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
