"use client";

import Image from "next/image";
import { boostingPrices, duoPrices } from "@/lib/site";

type PriceTableProps = {
  variant?: "boosting" | "duo";
};

export default function PriceTable({ variant = "boosting" }: PriceTableProps) {
  const pricing = variant === "duo" ? duoPrices : boostingPrices;
  const { hourly, score } = pricing;

  return (
    <div className="grid gap-10">
      {/* 시간제 */}
      <section>
        <div className="mb-6 flex flex-col items-center justify-center gap-3 text-center">
          <h3 className="text-xl font-black text-white sm:text-2xl">
            {hourly.title}
          </h3>
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
                    className="rounded-full"
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
              <div className="flex shrink-0 flex-col items-end text-right">
                {row.cells[2] ? (
                  <>
                    <span className="font-black text-gold">{row.cells[2]}</span>
                    <span className="text-[11px] text-zinc-500">
                      1시간 단위
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 whitespace-pre-line rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs leading-6 text-red-300/80">
          {hourly.note}
        </p>
      </section>

      {/* 점수 보장제 */}
      <section>
        <div className="mb-6 flex flex-col items-center justify-center gap-3 text-center">
          <h3 className="text-xl font-black text-white sm:text-2xl">
            {score.title}
          </h3>
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
                    className="rounded-full"
                    style={{ zIndex: row.icons.length - i }}
                  />
                ))}
              </div>
              <p className="min-w-0 flex-1 truncate text-sm font-bold text-white">
                {row.cells[0]}
              </p>
              <div className="flex shrink-0 flex-col items-end text-right">
                {row.cells[1] ? (
                  <>
                    <span className="font-black text-gold">{row.cells[1]}</span>
                    <span className="text-[11px] text-zinc-500">
                      +100점 단위
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
        {score.note && (
          <p className="mt-3 whitespace-pre-line rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs leading-6 text-red-300/80">
            {score.note}
          </p>
        )}
      </section>
    </div>
  );
}
