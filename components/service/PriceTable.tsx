"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { boostingPrices } from "@/lib/site";
import { approximateWon, parseExchangeRate, type ExchangeRate } from "@/lib/exchange-rate";

type PriceTableProps = { variant: "boosting" | "duo" };

export default function PriceTable({ variant }: PriceTableProps) {
  const [exchange, setExchange] = useState<ExchangeRate | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (variant !== "boosting") return;
    let active = true;
    let pending = false;
    const controller = new AbortController();
    async function refresh() {
      if (pending) return;
      pending = true;
      try {
        const response = await fetch("/api/exchange-rate", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Exchange rate unavailable");
        const data = await response.json();
        const result = parseExchangeRate({ ...data, base: "CNY", quote: "KRW" });
        if (active) { setExchange(result); setFailed(false); }
      } catch {
        if (active) { setExchange(null); setFailed(true); }
      } finally { pending = false; }
    }
    void refresh();
    const interval = window.setInterval(refresh, 3600000);
    window.addEventListener("focus", refresh);
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [variant]);

  if (variant !== "boosting") return null;

  return (
    <div className="grid gap-10">
      <div className="rounded-2xl border border-gold/20 bg-gold/5 px-5 py-4 text-center text-sm leading-6 text-zinc-300" aria-live="polite">
        <p>위안(CNY) 기준 요금 · 원화는 환율에 따른 예상 금액입니다.</p>
        <p className="mt-1 text-xs text-zinc-400">
          {exchange ? `환율 기준일 ${exchange.date} · 1위안 ≈ ${exchange.rate.toLocaleString("ko-KR", { maximumFractionDigits: 4 })}원 · 소수점 이하 버림` : failed ? "현재 환율 조회가 지연되고 있습니다. 잠시 후 다시 방문해 주세요." : "최신 환율을 불러오는 중입니다."}
          {" · "}<a href="https://frankfurter.dev/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">환율 출처: Frankfurter</a>
        </p>
      </div>
      {boostingPrices.map((group) => (
        <section key={group.title}>
          <div className="mb-6 text-center">
            <h3 className="text-xl font-black text-white sm:text-2xl">{group.title}</h3>
            <p className="mt-2 text-sm text-zinc-400">{group.unit}</p>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {group.rows.map((row) => (
              <div key={row.label} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-white/6 bg-white/3 px-4 py-4 transition hover:border-gold/20 hover:bg-white/5.5">
                <div className="flex shrink-0 items-center -space-x-2.5">
                  {row.icons.map((src, i) => <Image key={src} unoptimized src={src} alt="" width={30} height={30} style={{ zIndex: row.icons.length - i }} />)}
                </div>
                <p className="min-w-0 flex-1 text-sm font-bold leading-6 text-white">{row.label}</p>
                <div className="flex w-full flex-wrap items-baseline justify-end gap-x-2 gap-y-1 pl-9 sm:w-auto sm:pl-0">
                  <span className="whitespace-nowrap font-black text-gold">{row.cny.toLocaleString("ko-KR")}위안</span>
                  <span className="whitespace-nowrap text-sm text-zinc-300">{exchange ? `(${approximateWon(row.cny, exchange.rate)})` : failed ? "(환율 조회 불가)" : "(환율 조회 중)"}</span>
                </div>
              </div>
            ))}
          </div>
          {group.note && <p className="mt-3 rounded-xl border border-gold/15 bg-gold/5 px-4 py-3 text-sm leading-6 text-zinc-300">{group.note}</p>}
        </section>
      ))}
    </div>
  );
}
