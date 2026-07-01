import type { Metadata } from "next";
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

export default function DuoPage() {
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
      <ServiceDetail
        eyebrow="duo queue"
        title="듀오 랭크 가격"
        desc="시간제 듀오 랭크를 확인할 수 있는 서비스 안내입니다."
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
    </>
  );
}
