import Image from "next/image";
import { Clock, EyeOff } from "lucide-react";
import BoosterAvatar from "@/components/booster/BoosterAvatar";
import type { Booster } from "@/lib/booster-model";
import {
  nationalityFlag,
  nationalityLabel,
} from "@/components/booster/adminBoosterConstants";

export default function AdminBoosterCard({ booster }: { booster: Booster }) {
  const wins = booster.wins ?? 0;
  const losses = booster.losses ?? 0;
  const games = wins + losses;
  const winRate = games > 0 ? Math.round((wins / games) * 100) : 0;
  return (
    <article className={`card-premium overflow-hidden rounded-[28px] ${!booster.active ? "opacity-50" : ""}`}>
      <div className="flex gap-4 p-5">
        <BoosterAvatar
          availability={booster}
          image={booster.image}
          name={booster.name}
          size={80}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <Image
                src={booster.tier}
                alt={booster.rank}
                width={18}
                height={18}
                className="rounded-full bg-zinc-800"
              />
              <span className="text-xs font-black text-gold">{booster.rank}</span>
            </div>
            {!booster.active && (
              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-700/50 px-2 py-0.5 text-[10px] font-bold text-zinc-400">
                <EyeOff size={10} />
                숨김
              </span>
            )}
          </div>
          <p className="mt-1.5 flex items-center gap-2 font-black text-white">
            <span className="truncate">{booster.name}</span>
            <Image
              src={nationalityFlag(booster.nationality)}
              alt={nationalityLabel(booster.nationality)}
              title={nationalityLabel(booster.nationality)}
              width={24}
              height={16}
              className="shrink-0 rounded-[3px] border border-white/10 object-cover"
            />
          </p>
          <div className="mt-1 grid gap-0.5 text-xs text-zinc-500">
            <div className="flex items-center gap-1.5">
              <Clock size={10} />
              <span>평일 {booster.weekdayHours}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={10} />
              <span>주말 {booster.weekendHours}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/6 px-5 pb-5 pt-4">
        <p className="text-sm leading-6 text-zinc-400">{booster.description}</p>
        <div className="mt-4 grid gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-17 shrink-0 text-xs font-black text-zinc-500">라인</span>
            <div className="flex min-h-6 flex-wrap items-center gap-1.5">
              {booster.positions.map((position) => (
                <span
                  key={position}
                  className="rounded-full border border-white/8 bg-white/4 px-2.5 py-0.5 text-xs font-bold text-zinc-300"
                >
                  {position}
                </span>
              ))}
            </div>
          </div>
          {booster.champions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-17 shrink-0 text-xs font-black text-zinc-500">챔피언</span>
              <div className="flex min-h-6 flex-wrap items-center gap-1.5">
                {booster.champions.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-white/8 bg-white/4 px-2.5 py-0.5 text-xs font-bold text-zinc-300"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="w-17 shrink-0 text-xs font-black text-zinc-500">진행 서비스</span>
            <div className="flex min-h-6 flex-wrap items-center gap-1.5">
              {booster.services.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-white/8 bg-white/4 px-2.5 py-0.5 text-xs font-bold text-zinc-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          {games > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-17 shrink-0 text-xs font-black text-zinc-500">승률</span>
              <div className="flex h-5 flex-1 overflow-hidden rounded-md bg-white/6 text-[11px] text-white">
                {wins > 0 && (
                  <div
                    className="flex items-center bg-[#5383e8] pl-2"
                    style={{ width: `${(wins / games) * 100}%` }}
                  >
                    {wins}승
                  </div>
                )}
                {losses > 0 && (
                  <div
                    className="flex items-center justify-end bg-[#e84057] pr-2"
                    style={{ width: `${(losses / games) * 100}%` }}
                  >
                    {losses}패
                  </div>
                )}
              </div>
              <span
                className={`w-10 shrink-0 text-right text-xs ${
                  winRate >= 60 ? "text-red-400" : "text-lol-gray-500"
                }`}
              >
                {winRate}%
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
