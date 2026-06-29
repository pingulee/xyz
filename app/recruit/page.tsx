import type { Metadata } from "next";
import { CheckCircle2, Send } from "lucide-react";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "기사 모집", description: "xyz에서 함께할 상위 티어 롤 기사님을 모집합니다.", alternates: { canonical: "/recruit" } };

const conditions = ["마스터 이상 티어 보유", "본인 계정 인증 가능", "원활한 소통 가능", "책임감 있는 진행 가능", "서비스 규칙 준수 가능", "시간 약속 준수 가능"];

export default function RecruitPage() {
  return (
    <section className="py-20">
      <Container>
        <Reveal><SectionTitle eyebrow="recruit" title="기사 모집" desc="실력과 책임감을 갖춘 상위 티어 기사님을 모집합니다." /></Reveal>
        <Reveal>
          <div className="card-premium mx-auto max-w-5xl rounded-[38px] p-8 sm:p-10">
            <h2 className="text-3xl font-black text-white">지원 조건</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {conditions.map((c) => <div key={c} className="flex items-center gap-3 rounded-2xl bg-white/[.04] p-4 text-zinc-300"><CheckCircle2 className="text-gold" size={20}/>{c}</div>)}
            </div>
            <a href={site.kakaoUrl} target="_blank" rel="noopener noreferrer" className="mt-9 inline-flex items-center gap-2 rounded-full bg-gold-gradient px-7 py-4 font-black text-black"><Send size={18}/> 기사 지원하기</a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
