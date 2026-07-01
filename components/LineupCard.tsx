import Image from "next/image";
import Link from "next/link";
import { Clock, Star } from "lucide-react";
import KnightAvatar from "@/components/KnightAvatar";
import type { Lineup } from "@/lib/lineup-model";
import { getLineupPath } from "@/lib/lineups";

const positionColors: Record<string, string> = {
  정글: "bg-emerald-500/15 text-emerald-400",
  미드: "bg-blue-500/15 text-blue-400",
  바텀: "bg-purple-500/15 text-purple-400",
  서포터: "bg-pink-500/15 text-pink-400",
  서폿: "bg-pink-500/15 text-pink-400",
  탑: "bg-orange-500/15 text-orange-400",
};

export default function LineupCard({
  knight,
}: {
  knight: Lineup;
}) {
  return (
    <Link href={getLineupPath(knight)} className="block">
      <article className="card-premium overflow-hidden rounded-[28px] transition-transform duration-200 hover:-translate-y-1">
        <div className="flex gap-4 p-5">
          <KnightAvatar
            availability={knight}
            image={knight.image}
            name={knight.name}
            size={80}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {knight.positions.map((pos) => (
                <span
                  key={pos}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-black ${positionColors[pos] ?? "bg-gold/10 text-gold"}`}
                >
                  {pos}
                </span>
              ))}
              <div className="flex items-center gap-1">
                <Image
                  src={knight.tier}
                  alt={knight.rank}
                  width={18}
                  height={18}
                  className="rounded-full bg-zinc-800"
                />
                <span className="text-xs font-black text-gold">
                  {knight.rank}
                </span>
              </div>
            </div>
            <p className="mt-1.5 font-black text-white">{knight.name}</p>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-zinc-400">
              <Star size={14} className="fill-gold text-gold" />
              <span>
                {knight.averageRating ? knight.averageRating.toFixed(1) : "0.0"}
              </span>
              <span className="text-zinc-500">
                ({knight.reviewCount ?? 0}개 리뷰)
              </span>
            </div>
            <div className="mt-1 grid gap-0.5 text-xs text-zinc-500">
              <div className="flex items-center gap-1.5">
                <Clock size={10} />
                <span>평일 {knight.weekdayHours}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={10} />
                <span>주말 {knight.weekendHours}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/6 px-5 pb-5 pt-4">
          <p className="text-sm leading-6 text-zinc-400">
            {knight.description}
          </p>

          <div className="mt-4 grid gap-2.5">
            {knight.champions.length > 0 && (
              <div className="flex items-start gap-2">
                <span className="mt-0.5 w-12 shrink-0 text-xs font-black text-zinc-500">
                  챔피언
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {knight.champions.map((champion) => (
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

            <div className="flex items-start gap-2">
              <span className="mt-0.5 w-12 shrink-0 text-xs font-black text-zinc-500">
                작업
              </span>
              <div className="flex flex-wrap gap-1.5">
                {knight.services.map((service) => (
                  <span
                    key={service}
                    className="rounded-full border border-white/8 bg-white/4 px-2.5 py-0.5 text-xs font-bold text-zinc-300"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
