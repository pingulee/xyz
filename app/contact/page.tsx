import type { Metadata } from "next";
import { MessageCircle, Send } from "lucide-react";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "문의하기", description: "xyz 카카오톡 상담 및 문의 안내 페이지입니다.", alternates: { canonical: "/contact" } };

export default function ContactPage() {
  return (
    <section className="py-20">
      <Container>
        <Reveal><SectionTitle eyebrow="contact" title="문의하기" desc="현재 티어, 목표 티어, 원하는 서비스를 알려주시면 빠르게 안내드립니다." /></Reveal>
        <Reveal>
          <div className="card-premium mx-auto max-w-3xl rounded-[38px] p-8 text-center sm:p-12">
            <MessageCircle className="mx-auto text-gold" size={54}/>
            <h2 className="mt-6 text-3xl font-black text-white">카카오톡 빠른 상담</h2>
            <p className="mx-auto mt-4 max-w-xl leading-8 text-zinc-400">대리, 듀오, 계정, 기사 지원 문의 모두 이 페이지에서 연결됩니다.</p>
            <a href={site.kakaoUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold-gradient px-7 py-4 font-black text-black"><Send size={18}/> 상담 시작하기</a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
