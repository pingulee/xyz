import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import FaqItem from "@/components/ui/FaqItem";
import Reveal from "@/components/ui/Reveal";
import SectionTitle from "@/components/ui/SectionTitle";
import ServiceDetail from "@/components/service/ServiceDetail";
import { site } from "@/lib/site";

const description =
  "XYZ 롤 대리 가격표와 티어별 승률 보장, 진행 방식, 기사 배정, 환불 기준을 확인하세요. 현재 티어와 목표 티어 기준으로 맞춤 견적을 안내합니다.";

export const metadata: Metadata = {
  title: "롤 대리 가격 | 티어별 승률 보장 비용 안내",
  description,
  keywords: [
    "롤 대리 가격",
    "롤 대리 비용",
    "롤 티어 올리기",
    "롤 승률 보장",
    "롤 작업 가격",
    "XYZ 롤 대리",
  ],
  alternates: { canonical: "/boosting" },
  openGraph: {
    title: "롤 대리 가격 | XYZ",
    description,
    url: "/boosting",
    type: "website",
    siteName: site.brand,
    images: [{ url: site.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "롤 대리 가격 | XYZ",
    description,
    images: [site.ogImage],
  },
};

const faqs = [
  [
    "진행 방식이 어떻게 되나요?",
    "상담 후 현재 티어와 목표 티어를 확인하고 적합한 기사를 배정합니다. 결제 확인 후 즉시 작업을 시작합니다.",
  ],
  [
    "계정 정보는 안전한가요?",
    "기사는 검증된 인원으로만 구성되며, 작업 외 계정 접근은 일절 없습니다. 작업 완료 후 비밀번호 변경을 권장합니다.",
  ],
  [
    "챔피언이나 라인을 지정할 수 있나요?",
    "네, 가능합니다. 상담 시 원하는 챔피언·포지션·플레이 스타일을 말씀해 주시면 최대한 반영합니다. 대신 비주류 챔프의 경우 추가 요금이 발생할 수 있습니다.",
  ],
  [
    "승률 보장이 안 지켜지면 어떻게 되나요?",
    "10시간 이상 진행 시 승률 미달 구간은 추가 진행으로 보완해 드립니다. 자세한 내용은 상담 시 안내합니다.",
  ],
  [
    "진행 중 기사 교체가 가능한가요?",
    "작업 속도나 진행 방식이 맞지 않거나 기사님 일정 조율이 필요한 경우 상담원에게 문의해 주세요.\n현재 진행 상황과 대체 가능한 기사님 여부를 확인한 뒤 가능한 범위에서 기사 교체를 도와드립니다.",
  ],
  [
    "진행 중 현황을 확인할 수 있나요?",
    "카카오톡으로 실시간 진행 상황을 문의하실 수 있습니다.",
  ],
  [
    "환불이 가능한가요?",
    "진행이 시작되기 전에는 환불이 가능하며, 진행이 시작된 이후에는 환불이 불가합니다.",
  ],
  [
    "시간제는 처음보는데 뭔가요?",
    "시간제는 특정 시간 동안 기사님이 대리 작업을 진행하는 방식입니다.\n예를 들어 2시간을 신청하면 기사님이 2시간 동안 대리 작업을 진행합니다.",
  ],
  [
    "시간제 결제했는데 시간이 남으면 어떻게 되나요?",
    "1시간 50분동안 게임이 진행되었고, 10분이 남은 상태라면 우선 작업은 종료됩니다. 남은 10분만으로는 게임을 돌릴 수 없기 때문입니다. \n대신 남은 10분은 적립되며 다음 작업 시 사용 가능합니다.\n(예: 2시간 신청 → 1시간 50분 진행 → 10분 적립 → 다음 작업 시 10분 추가)",
  ],
  [
    "시간제 결제했는데 작업 시간이 결제한 시간을 넘으면 어떻게 되나요?",
    "시간제 작업은 실제 진행 시간을 기준으로 계산됩니다.\n다만 리그오브레전드 게임 특성상 한 판을 진행하려면 최소 15분 이상이 필요한 경우가 많습니다. 예를 들어 2시간을 결제했고 1시간 45분을 진행한 뒤 15분이 남았다면, 다음 한 판을 시작했을 때 결제 시간을 초과할 수 있습니다.\n이 경우 추가 진행 여부는 기사님의 재량에 따라 결정됩니다. 기사님이 남은 시간을 고려해 추가 비용 없이 한 판을 더 진행해 주실 수도 있고, 초과 시간이 예상되는 경우 추가 결제를 요청할 수도 있습니다.\n남은 시간이 애매한 상황에서는 상담원 또는 기사님과 먼저 상의한 뒤 진행 여부를 결정하시는 것을 권장드립니다.",
  ],
];

export default function BoostingPage() {
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
    name: "롤 대리",
    description,
    provider: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    serviceType: "League of Legends boosting",
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
        eyebrow="boosting"
        title="롤 대리 가격"
        desc="목표 티어까지 안정적인 진행을 원하는 고객을 위한 서비스입니다."
        featureTitle="부가 서비스"
        points={[
          "기사 지정",
          "라인 및 챔피언 지정",
          "스펠 및 아이템 위치 지정",
          "디스코드 화면 공유",
        ]}
        cta="대리 문의하기"
        pointIcon="check"
        showPriceTable
        priceTableVariant="boosting"
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
