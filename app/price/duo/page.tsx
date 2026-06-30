import type { Metadata } from "next";
import ServiceDetail from "@/components/ServiceDetail";
import { site } from "@/lib/site";

const description =
  "XYZ 롤 듀오 가격과 진행 방식을 안내합니다. 검증된 기사와 함께 플레이하며 라인, 챔피언, 일정 조건에 맞춰 안전하게 듀오 서비스를 진행합니다.";

export const metadata: Metadata = {
  title: "롤 듀오 가격 | 검증 기사 듀오 서비스 안내",
  description,
  keywords: [
    "롤 듀오 가격",
    "롤 듀오 비용",
    "롤 듀오 서비스",
    "롤 듀오 기사",
    "롤 듀오 후기",
    "XYZ 롤 듀오",
  ],
  alternates: { canonical: "/price/duo" },
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
        title="롤 듀오 가격"
        desc="검증된 기사와 함께 플레이하며 승률과 안정성을 동시에 챙기는 서비스입니다."
        featureTitle="듀오 서비스 특징"
        points={[
          "기사와 함께 직접 플레이",
          "라인/챔피언 조율 가능",
          "승률 중심 안전 진행",
          "플레이 피드백 가능",
        ]}
        cta="듀오 문의하기"
      />
    </>
  );
}
