import Image from "next/image";
import Link from "next/link";
import { Clock, Crown, Star } from "lucide-react";
import BoosterAvatar from "@/components/booster/BoosterAvatar";
import type { Booster } from "@/lib/booster-model";
import { getBoosterPath } from "@/lib/booster";

function nationalityFlag(code: number) {
  return code === 2 ? "/images/flags/cn.svg" : "/images/flags/kr.svg";
}

function nationalityLabel(code: number) {
  return code === 2 ? "중국" : "대한민국";
}

export default function BoosterCard({
  booster,
  placement,
}: {
  booster: Booster;
  placement?: number;
}) {
  const wins = booster.wins ?? 0;
  const losses = booster.losses ?? 0;
  const games = wins + losses;
  const winRate = games > 0 ? Math.round((wins / games) * 100) : 0;

  const crown =
    placement && placement <= 3
      ? [
          {
            label: "1",
            className:
              "border-yellow-300/45 bg-yellow-300/15 text-yellow-200 shadow-[0_0_18px_rgba(250,204,21,0.22)]",
          },
          {
            label: "2",
            className:
              "border-zinc-200/35 bg-zinc-100/12 text-zinc-100 shadow-[0_0_18px_rgba(228,228,231,0.16)]",
          },
          {
            label: "3",
            className:
              "border-[#9a5a32]/55 bg-[#5f321f]/35 text-[#c27a48] shadow-[0_0_18px_rgba(120,62,34,0.2)]",
          },
        ][placement - 1]
      : null;

  return (
    <Link href={getBoosterPath(booster)} prefetch={false} className="block">
      <article className="card-premium relative overflow-hidden rounded-[28px] transition duration-200">
        {crown && (
          <div
            className={`absolute right-4 top-4 z-10 inline-flex h-10 min-w-10 items-center justify-center gap-1 rounded-full border px-2.5 text-xs font-black ${crown.className}`}
            aria-label={`${crown.label}위 기사`}
          >
            <Crown size={15} className="fill-current" />
            <span>{crown.label}</span>
          </div>
        )}
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
                <span className="text-xs font-black text-gold">
                  {booster.rank}
                </span>
              </div>
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
            <div className="mt-1 flex items-center gap-1.5 text-sm text-zinc-400">
              <Star size={14} className="fill-gold text-gold" />
              <span>
                {booster.averageRating ? booster.averageRating.toFixed(1) : "0.0"}
              </span>
              <span className="text-zinc-500">
                ({booster.reviewCount ?? 0}개 리뷰)
              </span>
            </div>
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
          <p className="text-sm leading-6 text-zinc-400">
            {booster.description}
          </p>

          <div className="mt-4 grid gap-2.5">
            <div className="flex items-center gap-2">
              <span className="w-17 shrink-0 text-xs font-black text-zinc-500">
                라인
              </span>
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
                <span className="w-17 shrink-0 text-xs font-black text-zinc-500">
                  챔피언
                </span>
                <div className="flex min-h-6 flex-wrap items-center gap-1.5">
                  {booster.champions.map((champion) => (
                    <span
                      key={champion}
                      className="rounded-full border border-white/8 bg-white/4 px-2.5 py-0.5 text-xs font-bold text-zinc-300"
                    >
                      {champion}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="w-17 shrink-0 text-xs font-black text-zinc-500">
                진행 서비스
              </span>
              <div className="flex min-h-6 flex-wrap items-center gap-1.5">
                {booster.services.map((service) => (
                  <span
                    key={service}
                    className="rounded-full border border-white/8 bg-white/4 px-2.5 py-0.5 text-xs font-bold text-zinc-300"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>

            {games > 0 && (
              <div className="flex items-center gap-2">
                <span className="w-17 shrink-0 text-xs font-black text-zinc-500">
                  승률
                </span>
                <div className="flex h-5 flex-1 overflow-hidden rounded-md bg-white/6 text-[11px] text-white">
                  {wins > 0 && (
                    <div
                      className="flex min-w-fit items-center bg-[#5383e8] pl-2 whitespace-nowrap"
                      style={{ width: `${(wins / games) * 100}%` }}
                    >
                      {wins}승
                    </div>
                  )}
                  {losses > 0 && (
                    <div
                      className="flex min-w-fit items-center justify-end bg-[#e84057] pr-2 whitespace-nowrap"
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
    </Link>
  );
}
