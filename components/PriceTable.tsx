"use client";

import Image from "next/image";
import { boostingPrices } from "@/lib/site";

export default function PriceTable() {
  const { hourly, score, normal } = boostingPrices;

  return (
    <div className="grid gap-10">
      {/* 시간제 */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-black tracking-widest text-gold">
            {hourly.badge}
          </span>
          <h3 className="font-black text-white">{hourly.title}</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {hourly.rows.map((row) => (
            <div
              key={row.cells[0]}
              className="flex items-center gap-4 rounded-2xl border border-white/6 bg-white/3 px-4 py-3 transition hover:border-gold/20 hover:bg-white/5.5"
            >
              <div className="flex shrink-0 items-center -space-x-2.5">
                {row.icons.map((src, i) => (
                  <Image
                    key={i}
                    src={src}
                    alt=""
                    width={32}
                    height={32}
                    className="rounded-full ring-2 ring-zinc-900"
                    style={{ zIndex: row.icons.length - i }}
                  />
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">
                  {row.cells[0]}
                </p>
                <p className="text-xs text-zinc-500">승률 {row.cells[1]}</p>
              </div>
              <span className="shrink-0 font-black text-gold">
                {row.cells[2]}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 whitespace-pre-line rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs leading-6 text-red-300/80">{hourly.note}</p>
      </section>

      {/* 점수 보장제 */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-black tracking-widest text-gold">
            {score.badge}
          </span>
          <h3 className="font-black text-white">{score.title}</h3>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {score.rows.map((row) => (
            <div
              key={row.cells[0]}
              className="flex items-center gap-4 rounded-2xl border border-white/6 bg-white/3 px-4 py-3 transition hover:border-gold/20 hover:bg-white/5.5"
            >
              <div className="flex shrink-0 items-center -space-x-2.5">
                {row.icons.map((src, i) => (
                  <Image
                    key={i}
                    src={src}
                    alt=""
                    width={32}
                    height={32}
                    className="rounded-full ring-2 ring-zinc-900"
                    style={{ zIndex: row.icons.length - i }}
                  />
                ))}
              </div>
              <p className="min-w-0 flex-1 truncate text-sm font-bold text-white">
                {row.cells[0]}
              </p>
              <span className="shrink-0 font-black text-gold">
                {row.cells[1]}
              </span>
            </div>
          ))}
        </div>
        {score.note && <p className="mt-3 whitespace-pre-line rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs leading-6 text-red-300/80">{score.note}</p>}
      </section>

      {/* 일반 게임 */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-black tracking-widest text-gold">
            {normal.badge}
          </span>
          <h3 className="font-black text-white">{normal.title}</h3>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-white/6 bg-white/3 px-4 py-4 transition hover:border-gold/20 hover:bg-white/5.5">
          <p className="flex-1 text-sm font-bold text-white">
            {normal.rows[0].cells[0]}
          </p>
          <span className="font-black text-gold">
            {normal.rows[0].cells[1]}
          </span>
        </div>
      </section>
    </div>
  );
}
