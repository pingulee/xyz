import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import ServiceDetail from "@/components/service/ServiceDetail";
import FaqItem from "@/components/ui/FaqItem";
import Reveal from "@/components/ui/Reveal";
import SectionTitle from "@/components/ui/SectionTitle";
import { serializeJsonLd } from "@/lib/jsonld";
import { site } from "@/lib/site";

const description =
  "XYZ 롤 육성 서비스의 가격과 진행 방식을 안내합니다. 소환사 레벨, 목표 기간, 일반 게임과 AI 게임 등 원하는 조건에 맞춰 견적을 안내합니다.";

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
    "현재 소환사 레벨과 목표 레벨, 희망 완료 일정, 원하는 진행 방식을 확인한 뒤 조건에 맞는 기사님을 배정합니다.",
  ],
  [
    "육성 가격은 어떻게 정해지나요?",
    "현재 레벨과 목표 레벨, 남은 기간, 진행 방식에 따라 필요한 시간이 달라지므로 상담 후 맞춤 견적을 안내합니다.",
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
        desc="현재 레벨과 목표 일정에 맞춰 안전하고 체계적으로 진행하는 맞춤 육성 서비스입니다."
        featureTitle="육성 상담 항목"
        points={[
          "현재·목표 레벨 맞춤 견적",
          "희망 완료 일정 상담",
          "진행 방식 선택",
          "실시간 진행 상황 안내",
        ]}
        cta="육성 문의하기"
      />

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
