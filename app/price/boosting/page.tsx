import type { Metadata } from "next";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import PriceTable from "@/components/PriceTable";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "롤 대리 가격", description: "xyz 롤 대리 가격과 진행 방식 안내입니다.", alternates: { canonical: "/price/boosting" } };

export default function BoostingPage() {
  return <ServiceDetail title="롤 대리" eyebrow="boosting" desc="목표 티어까지 안정적인 진행을 원하는 고객을 위한 서비스입니다." points={["현재/목표 티어 기반 견적", "챔피언 및 라인 요청 가능", "진행 상황 안내"]} />;
}

function ServiceDetail({title, eyebrow, desc, points}:{title:string; eyebrow:string; desc:string; points:string[]}) {
  return <section className="py-20"><Container><Reveal><SectionTitle eyebrow={eyebrow} title={title} desc={desc}/></Reveal><div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr]"><Reveal><div className="card-premium rounded-[34px] p-8"><h2 className="text-2xl font-black text-white">서비스 특징</h2><ul className="mt-6 space-y-4">{points.map(p=><li key={p} className="flex items-center gap-3 text-zinc-300"><CheckCircle2 className="text-gold" size={20}/>{p}</li>)}</ul><a href={site.kakaoUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-4 font-black text-black">견적 문의하기 <ArrowRight size={18}/></a></div></Reveal><Reveal delay=.1><PriceTable/></Reveal></div></Container></section>
}
