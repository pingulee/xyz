import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import ServiceDetail from "@/components/service/ServiceDetail";
import FaqItem from "@/components/ui/FaqItem";
import Reveal from "@/components/ui/Reveal";
import SectionTitle from "@/components/ui/SectionTitle";
import { serializeJsonLd } from "@/lib/jsonld";
import { site, levelingPrice } from "@/lib/site";

const priceLabel = `${levelingPrice.price.toLocaleString("ko-KR")}원`;
const levelLabel = `${levelingPrice.fromLevel}레벨부터 ${levelingPrice.toLevel}레벨까지`;
const description = `XYZ 롤 육성 ${levelLabel} ${priceLabel}. 매크로·봇 없이 기사가 직접 플레이하는 100% 수동 육성입니다.`;

export const metadata: Metadata = {
  title: "롤 육성 가격 | 소환사 레벨 맞춤 육성 안내",
  description,
  keywords: [
    "롤 육성",
    "롤 육성 가격",
    "롤 레벨업",
    "롤 30레벨 육성",
    "롤 계정 육성",
    "XYZ 롤 육성",
  ],
  alternates: { canonical: "/leveling" },
  openGraph: {
    title: "롤 육성 가격 | XYZ",
    description,
    url: "/leveling",
    type: "website",
    siteName: site.brand,
    images: [{ url: site.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "롤 육성 가격 | XYZ",
    description,
    images: [site.ogImage],
  },
};

const faqs = [
  [
    "롤 육성은 어떻게 진행되나요?",
    "매크로·봇 등 자동화 프로그램을 사용하지 않고 기사님이 직접 플레이하는 100% 수동 방식으로 진행합니다. 상담에서 현재 레벨과 희망 일정을 확인한 뒤 기사님을 배정합니다.",
  ],
  [
    "육성 가격은 어떻게 정해지나요?",
    `${levelLabel} 육성 비용은 ${priceLabel}입니다. 그 외 구간이나 별도 요청사항은 상담 시 안내합니다.`,
  ],
  [
    "원하는 챔피언이나 포지션을 요청할 수 있나요?",
    "가능합니다. 보유 챔피언과 진행 방식에 따라 반영 가능 여부가 달라질 수 있으므로 상담할 때 요청사항을 알려주세요.",
  ],
  [
    "진행 상황을 확인할 수 있나요?",
    "카카오톡 상담을 통해 현재 레벨과 진행 상황을 확인할 수 있습니다.",
  ],
  [
    "완료 일정은 지정할 수 있나요?",
    "희망 일정을 말씀해 주시면 가능한 기사 일정과 예상 플레이 시간을 확인해 안내합니다. 촉박한 일정은 추가 상담이 필요할 수 있습니다.",
  ],
  [
    "환불이 가능한가요?",
    "진행 시작 전에는 환불이 가능하며, 시작 이후에는 완료된 작업량과 진행 상태를 확인해 상담 기준에 따라 안내합니다.",
  ],
] as const;

export default function LevelingPage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "롤 육성",
    description,
    provider: {
      "@type": "Organization",
      name: site.brand,
      url: site.url,
    },
    serviceType: "League of Legends account leveling",
    areaServed: "KR",
    offers: {
      "@type": "Offer",
      name: `${levelLabel} 수동 육성`,
      price: levelingPrice.price,
      priceCurrency: levelingPrice.currency,
      url: `${site.url}/leveling`,
    },
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
      />
      <ServiceDetail
        eyebrow="leveling"
        title="롤 육성 가격"
        desc={description}
        featureTitle="자동화 없이, 사람이 직접"
        points={[
          "100% 수동 플레이",
          "희망 완료 일정 상담",
          "매크로·봇 사용 없음",
          "실시간 진행 상황 안내",
        ]}
        cta="육성 문의하기"
      />

      <section className="pb-20" aria-labelledby="leveling-price-title">
        <Container>
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-gold/30 bg-[linear-gradient(120deg,rgba(222,176,67,0.1),rgba(12,11,8,1)_65%)] p-7 sm:p-10">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold tracking-[0.2em] text-gold">100% MANUAL PLAY</p>
                <h2 id="leveling-price-title" className="mt-4 text-2xl font-black text-white sm:text-3xl">{levelLabel}</h2>
                <p className="mt-3 text-sm leading-7 text-zinc-300">매크로·봇 없이 기사가 직접 플레이합니다.<br />처음부터 30레벨까지, 전 과정 수동 육성.</p>
              </div>
              <div className="shrink-0 sm:text-right">
                <p className="text-xs text-zinc-400">0 → 30레벨 전체 비용</p>
                <p className="mt-2 text-4xl font-black tracking-tight text-gold sm:text-5xl">{priceLabel}</p>
                <a href={site.kakaoUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-gold-gradient px-7 py-3 text-sm font-black text-black transition hover:brightness-110">수동 육성 상담하기</a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="pb-20">
        <Container>
          <Reveal>
            <SectionTitle eyebrow="faq" title="자주 묻는 질문" />
          </Reveal>
          <div className="mx-auto max-w-4xl space-y-4">
            {faqs.map(([question, answer]) => (
              <FaqItem key={question} q={question} a={answer} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
