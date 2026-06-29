import { priceRows } from "@/lib/site";

export default function PriceTable() {
  return (
    <div className="card-premium overflow-hidden rounded-4xl">
      <div className="grid grid-cols-3 border-b border-gold/10 bg-white/4 px-5 py-4 text-xs font-black uppercase tracking-[0.2em] text-gold sm:px-7">
        <span>구간</span>
        <span>가격</span>
        <span>비고</span>
      </div>

      <div className="divide-y divide-gold/10">
        {priceRows.map(([range, price, note]) => (
          <div
            key={range}
            className="grid grid-cols-3 gap-4 px-5 py-5 text-sm transition hover:bg-white/4 sm:px-7"
          >
            <span className="font-bold text-white">{range}</span>
            <span className="font-black text-gold">{price}</span>
            <span className="text-zinc-400">{note}</span>
          </div>
        ))}
      </div>

      <p className="border-t border-gold/10 px-5 py-4 text-xs leading-6 text-zinc-500 sm:px-7">
        실제 견적은 MMR, 챔피언 제한, 진행 속도, 계정 상태에 따라 달라질 수 있습니다.
      </p>
    </div>
  );
}
