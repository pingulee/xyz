import type { Metadata } from "next";
import { CheckCircle2, Send } from "lucide-react";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import { site } from "@/lib/site";

const description = "xyz에서 함께할 상위 티어 롤 기사님을 모집합니다.";

export const metadata: Metadata = {
  title: "기사 모집",
  description,
  alternates: { canonical: "/recruit" },
  openGraph: {
    title: "기사 모집 | XYZ",
    description,
    url: "/recruit",
    type: "website",
    siteName: site.name,
    images: [{ url: site.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "기사 모집 | XYZ",
    description,
    images: [site.ogImage],
  },
};

const conditions = [
  "현 시즌 챌린저 달성",
  "그랜드마스터 이상 상시 유지 가능",
  "본인 명의 계정 인증 가능",
  "책임감 있는 진행 가능",
  "서비스 규칙 준수 가능",
  "시간 약속 준수 가능",
];

export default function RecruitPage() {
  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="recruit"
            title="기사 모집"
            desc="실력과 책임감을 갖춘 상위 티어 기사님을 모집합니다."
            as="h1"
          />
        </Reveal>
        <Reveal>
          <div className="card-premium mx-auto max-w-5xl rounded-[38px] p-8 sm:p-10">
            <h2 className="text-3xl font-black text-white">지원 조건</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {conditions.map((c) => (
                <div
                  key={c}
                  className="flex items-center gap-3 rounded-2xl bg-white/4 p-4 text-zinc-300"
                >
                  <CheckCircle2 className="text-gold" size={20} />
                  {c}
                </div>
              ))}
            </div>
            <a
              href={site.kakaoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-9 inline-flex items-center gap-2 rounded-full bg-gold-gradient px-7 py-4 font-black text-black transition hover:brightness-110"
            >
              <Send size={18} /> 기사 지원하기
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
