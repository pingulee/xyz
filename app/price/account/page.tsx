import type { Metadata } from "next";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "롤 계정 가격",
  description: "xyz 롤 계정 상담 및 가격 안내입니다.",
  alternates: { canonical: "/price/account" },
};

export default function AccountPage() {
  const points = [
    "티어/챔피언/스킨 조건 상담",
    "예산별 맞춤 안내",
    "구매 전 확인 항목 안내",
    "빠른 상담 진행",
  ];
  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="account"
            title="롤 계정 가격"
            desc="원하는 조건과 예산에 맞춰 맞춤형 계정 상담을 진행합니다."
          />
        </Reveal>
        <Reveal>
          <div className="card-premium mx-auto max-w-4xl rounded-[34px] p-8">
            <h2 className="text-2xl font-black text-white">계정 상담 항목</h2>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {points.map((p) => (
                <div
                  key={p}
                  className="flex items-center gap-3 rounded-2xl bg-white/4 p-4 text-zinc-300"
                >
                  <CheckCircle2 className="text-gold" size={20} />
                  {p}
                </div>
              ))}
            </div>
            <a
              href={site.kakaoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-4 font-black text-black"
            >
              계정 문의하기 <ArrowRight size={18} />
            </a>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
