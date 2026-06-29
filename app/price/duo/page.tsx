import type { Metadata } from "next";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "롤 듀오 가격", description: "xyz 롤 듀오 가격과 진행 방식 안내입니다.", alternates: { canonical: "/price/duo" } };

export default function DuoPage() {
  const points = ["기사와 함께 직접 플레이", "라인/챔피언 조율 가능", "승률 중심 안전 진행", "플레이 피드백 가능"];
  return <section className="py-20"><Container><Reveal><SectionTitle eyebrow="duo queue" title="롤 듀오 가격" desc="검증된 기사와 함께 플레이하며 승률과 안정성을 동시에 챙기는 서비스입니다."/></Reveal><Reveal><div className="card-premium mx-auto max-w-4xl rounded-[34px] p-8"><h2 className="text-2xl font-black text-white">듀오 서비스 특징</h2><div className="mt-7 grid gap-4 sm:grid-cols-2">{points.map(p=><div key={p} className="flex items-center gap-3 rounded-2xl bg-white/[.04] p-4 text-zinc-300"><CheckCircle2 className="text-gold" size={20}/>{p}</div>)}</div><a href={site.kakaoUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-4 font-black text-black">듀오 문의하기 <ArrowRight size={18}/></a></div></Reveal></Container></section>
}
