import type { Metadata } from "next";
import ServiceDetail from "@/components/ServiceDetail";
import { site } from "@/lib/site";

const description =
  "XYZ 롤 계정 가격과 맞춤 상담 안내입니다. 원하는 티어, 챔피언, 스킨, 예산 조건에 맞춰 구매 전 확인 항목과 상담 기준을 안내합니다.";

export const metadata: Metadata = {
  title: "롤 계정 가격 | 티어·챔피언·스킨 맞춤 상담",
  description,
  keywords: [
    "롤 계정 가격",
    "롤 계정 상담",
    "롤 계정 구매",
    "롤 티어 계정",
    "롤 스킨 계정",
    "XYZ 롤 계정",
  ],
  alternates: { canonical: "/price/account" },
  openGraph: {
    title: "롤 계정 가격 | XYZ",
    description,
    url: "/price/account",
    type: "website",
    siteName: site.name,
  },
  twitter: {
    card: "summary",
    title: "롤 계정 가격 | XYZ",
    description,
  },
};

export default function AccountPage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "롤 계정 상담",
    description,
    provider: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    serviceType: "League of Legends account consultation",
    areaServed: "KR",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <ServiceDetail
        eyebrow="account"
        title="롤 계정 가격"
        desc="원하는 조건과 예산에 맞춰 맞춤형 계정 상담을 진행합니다."
        featureTitle="계정 상담 항목"
        points={[
          "티어/챔피언/스킨 조건 상담",
          "예산별 맞춤 안내",
          "구매 전 확인 항목 안내",
          "빠른 상담 진행",
        ]}
        cta="계정 문의하기"
      />
    </>
  );
}
