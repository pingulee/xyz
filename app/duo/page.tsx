import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import FaqItem from "@/components/ui/FaqItem";
import Reveal from "@/components/ui/Reveal";
import SectionTitle from "@/components/ui/SectionTitle";
import ServiceDetail from "@/components/service/ServiceDetail";
import { site } from "@/lib/site";
import { serializeJsonLd } from "@/lib/jsonld";

const description =
  "XYZ 롤 듀오 랭크 서비스의 가격과 진행 방식을 안내합니다. 현재 티어와 요청 조건에 따른 비용은 상담으로 안내합니다.";

export const metadata: Metadata = {
  title: "듀오 랭크 가격 | 검증 기사 듀오 서비스 안내",
  description,
  keywords: [
    "롤 듀오 가격",
    "롤 듀오 비용",
    "롤 듀오 서비스",
    "롤 듀오 기사",
    "롤 듀오 후기",
    "XYZ 롤 듀오",
  ],
  alternates: { canonical: "/duo" },
  openGraph: {
    title: "롤 듀오 가격 | XYZ",
    description,
    url: "/duo",
    type: "website",
    siteName: site.brand,
    images: [{ url: site.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "롤 듀오 가격 | XYZ",
    description,
    images: [site.ogImage],
  },
};

const faqs = [
  [
    "듀오 랭크는 어떻게 진행되나요?",
    "상담 후 현재 티어와 원하는 진행 시간대를 확인하고, 조건에 맞는 기사님을 배정합니다. 결제 확인 후 기사님이 고객님을 초대하시면 함께 파티를 맺고 듀오 랭크를 진행하시면 됩니다.",
  ],
  [
    "라인이나 챔피언 요청이 가능한가요?",
    "네, 가능합니다. 상담 시 원하는 라인·챔피언·플레이 스타일을 말씀해 주시면 최대한 반영합니다. 대신 비주류 챔프나 특정 조합을 원하시는 경우 추가 요금이 발생할 수 있습니다.",
  ],
  [
    "보이스 채팅은 필수인가요?",
    "필수는 아닙니다. 다만 원활한 콜과 피드백을 원하시면 보이스 채팅을 권장드립니다. 원치 않으시면 채팅 위주로도 진행 가능합니다.\n보이스 채팅은 비용이 부과될 수 있습니다. (상담 시 안내)",
  ],
  [
    "진행 중 기사 교체가 가능한가요?",
    "기사님과 플레이 스타일이 맞지 않거나 일정 조율이 필요한 경우 상담원에게 문의해 주세요.\n진행 상황과 대체 가능한 기사님 여부를 확인한 뒤 가능한 범위에서 기사 교체를 도와드립니다.",
  ],
  [
    "환불이 가능한가요?",
    "진행이 시작되기 전에는 환불이 가능하며, 진행이 시작된 이후에는 환불이 불가합니다.",
  ],
];

export default function DuoPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "롤 듀오",
    description,
    provider: {
      "@type": "Organization",
      name: site.brand,
      url: site.url,
    },
    serviceType: "League of Legends duo queue",
    areaServed: "KR",
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
        eyebrow="duo queue"
        title="롤 듀오 가격"
        desc="상위 티어 기사와 함께 플레이하며 승률과 피드백을 동시에 챙기는 듀오 랭크 서비스입니다. 가격은 현재 티어와 요청 조건에 따라 상담으로 안내합니다."
        featureTitle="부가 서비스"
        points={[
          "기사 지정",
          "기사 라인 및 챔피언 지정",
          "보이스 채팅",
          "플레이 피드백",
        ]}
        cta="듀오 문의하기"
      />

      <section className="pb-20">
        <Container>
          <Reveal>
            <SectionTitle eyebrow="faq" title="자주 묻는 질문" />
          </Reveal>
          <div className="mx-auto max-w-4xl space-y-4">
            {faqs.map(([q, a]) => (
              <FaqItem key={q} q={q} a={a} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
