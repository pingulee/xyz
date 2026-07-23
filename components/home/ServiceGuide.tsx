import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";

// 대리 vs 듀오 비교 (서비스 소개 섹션과 겹치지 않도록 "결정용 비교표" 포맷)
type Cell = string | boolean;
const rows: { label: string; boost: Cell; duo: Cell }[] = [
  { label: "진행 방식", boost: "기사가 계정으로 대신 진행", duo: "함께 파티로 직접 플레이" },
  { label: "계정 공유", boost: "필요", duo: false },
  { label: "실시간 피드백", boost: false, duo: true },
  { label: "추천 대상", boost: "빠른 티어 상승", duo: "실력·티어 동시" },
  { label: "가격 시작", boost: "시간제 12,000원~", duo: "시간제 14,000원~" },
];

function CellView({ value, accent }: { value: Cell; accent?: boolean }) {
  if (value === true)
    return (
      <span className={`inline-flex items-center gap-1.5 font-black ${accent ? "text-gold" : "text-emerald-400"}`}>
        <Check size={16} aria-hidden="true" /> 가능
      </span>
    );
  if (value === false)
    return (
      <span className="inline-flex items-center gap-1.5 font-bold text-zinc-600">
        <Minus size={16} aria-hidden="true" /> 없음
      </span>
    );
  return <span className={accent ? "font-bold text-white" : "font-semibold text-zinc-300"}>{value}</span>;
}

export default function ServiceGuide() {
  return (
    <section
      aria-labelledby="service-guide-title"
      className="relative isolate overflow-hidden border-y border-white/6 bg-[#0d0b08] py-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(222,176,67,0.12),transparent_36%),radial-gradient(circle_at_92%_92%,rgba(250,219,116,0.06),transparent_32%)]"
      />

      <Container className="relative">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.24em] text-gold">
              <span className="h-px w-8 bg-gold/60" />
              Start here
              <span className="h-px w-8 bg-gold/60" />
            </div>
            <h2
              id="service-guide-title"
              className="mt-5 text-3xl font-black tracking-tighter text-balance text-white sm:text-4xl lg:text-5xl"
            >
              롤 대리 vs 롤 듀오,
              <br className="sm:hidden" /> <span className="gold-text">한눈에 비교</span>
            </h2>
            <p className="mt-4 text-base leading-8 text-pretty text-zinc-300 sm:text-lg">
              계정을 맡길지 함께 플레이할지, 아래 비교로 나에게 맞는 방식을 골라보세요.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mx-auto mt-12 max-w-3xl overflow-hidden rounded-4xl border border-white/8 bg-white/[0.02]">
            {/* 헤더 행 */}
            <div className="grid grid-cols-[1fr_1fr_1fr] border-b border-white/8 bg-black/25">
              <div className="px-4 py-4 text-xs font-black uppercase tracking-[0.16em] text-zinc-500 sm:px-6">
                항목
              </div>
              <div className="border-l border-white/8 bg-gold/8 px-4 py-4 text-center text-sm font-black text-gold sm:px-6 sm:text-base">
                롤 대리
              </div>
              <div className="border-l border-white/8 px-4 py-4 text-center text-sm font-black text-white sm:px-6 sm:text-base">
                롤 듀오
              </div>
            </div>

            {/* 데이터 행 */}
            {rows.map((row, i) => (
              <div
                key={row.label}
                className={`grid grid-cols-[1fr_1fr_1fr] ${
                  i > 0 ? "border-t border-white/6" : ""
                }`}
              >
                <div className="px-4 py-4 text-xs font-black text-zinc-400 sm:px-6 sm:text-sm">
                  {row.label}
                </div>
                <div className="border-l border-white/8 bg-gold/[0.04] px-4 py-4 text-center text-xs sm:px-6 sm:text-sm">
                  <CellView value={row.boost} accent />
                </div>
                <div className="border-l border-white/8 px-4 py-4 text-center text-xs sm:px-6 sm:text-sm">
                  <CellView value={row.duo} />
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-3">
            <Link
              href="/boosting"
              className="group inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/8 px-6 py-3 text-sm font-black text-gold transition hover:border-gold/50 hover:bg-gold/12"
            >
              롤 대리 가격 보기
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/duo"
              className="group inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-6 py-3 text-sm font-black text-white transition hover:border-gold/40 hover:text-gold"
            >
              롤 듀오 가격 보기
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
