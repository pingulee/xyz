import type { Metadata } from "next";
import ServiceDetail from "@/components/service/ServiceDetail";
import { site } from "@/lib/site";
import { serializeJsonLd } from "@/lib/jsonld";

const description =
  "XYZ 롤 계정 판매·매입 안내입니다. 원하는 티어, 챔피언, 스킨, 예산 조건에 맞춘 계정 판매와 보유 계정 매입 상담 기준을 함께 안내합니다.";

export const metadata: Metadata = {
  title: "롤 계정 판매·매입 | 티어·챔피언·스킨 맞춤 상담",
  description,
  keywords: [
    "롤 계정 가격",
    "롤 업디",
    "롤 계정 구매",
    "롤 계정 판매",
    "롤 계정 매입",
    "롤 티어 계정",
    "롤 스킨 계정",
    "XYZ 롤 계정",
  ],
  alternates: { canonical: "/account" },
  openGraph: {
    title: "롤 계정 판매·매입 | XYZ",
    description,
    url: "/account",
    type: "website",
    siteName: site.brand,
    images: [{ url: site.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "롤 계정 판매·매입 | XYZ",
    description,
    images: [site.ogImage],
  },
};

export default function AccountPage() {
  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "롤 계정 판매·매입",
    description,
    provider: {
      "@type": "Organization",
      name: site.brand,
      url: site.url,
    },
    serviceType: "League of Legends account sales and buyback consultation",
    areaServed: "KR",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(serviceJsonLd) }}
      />
      <ServiceDetail
        eyebrow="account"
        title="롤 계정 판매·매입 가격"
        desc="원하는 조건의 계정 판매와 보유 계정 매입을 함께 진행합니다. 조건과 예산에 맞춰 맞춤 상담해 드립니다."
        featureTitle="계정 상담 항목"
        points={[
          "티어/챔피언/스킨 조건 상담",
          "예산별 맞춤 안내",
          "구매 전 확인 항목 안내",
          "보유 계정 매입 시세 상담",
        ]}
        cta="계정 문의하기"
      />
    </>
  );
}
