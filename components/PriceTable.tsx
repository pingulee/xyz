import { CheckCircle2 } from "lucide-react";
import { priceRows } from "@/lib/site";

export default function PriceTable() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-gold/15 bg-white/[0.035]">
      <div className="grid grid-cols-3 bg-gold/10 px-5 py-4 text-sm font-black text-gold sm:px-7">
        <span>구간</span><span>가격</span><span>비고</span>
      </div>
      {priceRows.map((row) => (
        <div key={row[0]} className="grid grid-cols-3 items-center border-t border-gold/10 px-5 py-5 text-sm text-zinc-300 sm:px-7">
          <span className="font-bold text-white">{row[0]}</span>
          <span>{row[1]}</span>
          <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-gold" />{row[2]}</span>
        </div>
      ))}
    </div>
  );
}
