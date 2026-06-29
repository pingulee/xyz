import type { Metadata } from "next";
import Image from "next/image";
import { Medal, ShieldCheck, Star } from "lucide-react";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";

export const metadata: Metadata = {
  title: "기사 라인업",
  description: "xyz의 검증된 상위 티어 롤 기사 라인업 안내 페이지입니다.",
  alternates: { canonical: "/lineup" },
};

const lineups = [
  ["정글 전문 기사", "Challenger", "오브젝트 운영과 캐리 라인 중심 진행", "/images/lineup-1.png"],
  ["미드 전문 기사", "Grandmaster+", "라인전 주도권과 합류 중심 진행", "/images/lineup-2.png"],
  ["바텀 전문 기사", "Master+", "듀오 및 조합 중심 안정 진행", "/images/lineup-3.png"],
];

export default function LineupPage() {
  return (
    <section className="py-20">
      <Container>
        <Reveal><SectionTitle eyebrow="lineup" title="기사 라인업" desc="실제 운영 페이지에 맞게 기사 프로필 이미지와 소개를 배치할 수 있는 구조입니다." /></Reveal>
        <div className="grid gap-6 lg:grid-cols-3">
          {lineups.map(([title, rank, desc, img], i) => (
            <Reveal key={title} delay={i*.08}>
              <article className="card-premium overflow-hidden rounded-[34px]">
                <div className="relative aspect-[4/4] bg-black">
                  <Image src={img} alt={`${title} 이미지 위치`} fill className="object-cover opacity-85" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>
                <div className="p-7">
                  <div className="flex items-center justify-between"><span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-black text-gold">{rank}</span><Medal className="text-gold" /></div>
                  <h2 className="mt-5 text-2xl font-black text-white">{title}</h2>
                  <p className="mt-3 leading-7 text-zinc-400">{desc}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {["티어 인증", "전적 검토", "서비스별 배정"].map((v, i) => <div key={v} className="rounded-3xl border border-gold/15 bg-white/[.035] p-6"><div className="text-gold">{i === 0 ? <ShieldCheck/> : i === 1 ? <Star/> : <Medal/>}</div><b className="mt-4 block text-white">{v}</b></div>)}
        </div>
      </Container>
    </section>
  );
}
