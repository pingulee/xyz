import type { Metadata } from "next";
import Container from "@/components/Container";
import FaqItem from "@/components/FaqItem";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import ServiceDetail from "@/components/ServiceDetail";
import { site } from "@/lib/site";

const description =
  "XYZ 롤 듀오 랭크 서비스의 가격과 진행 방식을 안내합니다. 시간제 듀오 랭크 서비스를 제공합니다.";

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
    url: "/price/duo",
    type: "website",
    siteName: site.name,
  },
  twitter: {
    card: "summary",
    title: "롤 듀오 가격 | XYZ",
    description,
  },
};

const faqs = [
  [
    "듀오 랭크는 어떻게 진행되나요?",
    "상담 후 현재 티어와 원하는 진행 시간대를 확인하고, 조건에 맞는 기사님을 배정합니다. 고객님과 기사님이 함께 파티를 맺고 랭크를 진행합니다.",
  ],
  [
    "보이스 채팅은 필수인가요?",
    "필수는 아니지만 원활한 콜과 피드백을 원하시면 보이스 채팅을 권장합니다. 원치 않으시면 채팅 위주로도 진행 가능합니다.",
  ],
  [
    "라인이나 챔피언 요청이 가능한가요?",
    "가능합니다. 상담 시 선호 라인, 챔피언, 피하고 싶은 포지션을 알려주시면 최대한 반영해 기사님을 배정합니다.",
  ],
  [
    "진행 중 기사 변경이 가능한가요?",
    "기사님 일정이나 진행 스타일이 맞지 않는 경우 상담을 통해 가능한 범위에서 조정해드립니다.",
  ],
  [
    "패배한 판도 시간에 포함되나요?",
    "시간제 듀오 랭크는 실제 진행 시간을 기준으로 계산됩니다. 승률 보장 기준과 세부 적용 방식은 상담 시 안내드립니다.",
  ],
  [
    "환불은 가능한가요?",
    "진행 전에는 환불이 가능하며, 진행이 시작된 이후에는 사용된 시간과 진행 상황을 기준으로 정산합니다.",
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
      name: site.name,
      url: site.url,
    },
    serviceType: "League of Legends duo queue",
    areaServed: "KR",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ServiceDetail
        eyebrow="duo queue"
        title="듀오 랭크 가격"
        desc="상위 티어 기사와 함께 플레이하며 승률과 피드백을 동시에 챙기는 듀오 랭크 서비스입니다."
        featureTitle="부가 서비스"
        points={[
          "기사 지정",
          "기사 라인 및 챔피언 지정",
          "보이스 채팅",
          "플레이 피드백",
        ]}
        cta="듀오 문의하기"
        showPriceTable
        priceTableVariant="duo"
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
