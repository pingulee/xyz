import { services, site } from "@/lib/site";

const BRAND_NAME = "XYZ";

export default function JsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site.url}/#organization`,
        name: BRAND_NAME,
        alternateName: site.name,
        url: site.url,
        logo: {
          "@type": "ImageObject",
          url: `${site.url}${site.logo}`,
          width: 800,
          height: 360,
        },
        image: `${site.url}${site.ogImage}`,
        description: site.description,
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          url: site.kakaoUrl,
          availableLanguage: ["ko"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        name: BRAND_NAME,
        alternateName: site.name,
        url: site.url,
        inLanguage: "ko-KR",
        publisher: { "@id": `${site.url}/#organization` },
      },
      {
        "@type": "Service",
        "@id": `${site.url}/#service`,
        name: BRAND_NAME,
        alternateName: site.name,
        url: site.url,
        description: site.description,
        areaServed: "KR",
        inLanguage: "ko-KR",
        serviceType: ["롤 대리", "롤 듀오", "롤 계정", "롤 업디"],
        provider: { "@id": `${site.url}/#organization` },
        // 사이트 가격표에 공개된 실제 범위 (저티어 1승 5,000원 ~ 고티어 점수 보장 180,000원)
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "KRW",
          lowPrice: 5000,
          highPrice: 180000,
          offerCount: services.length,
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
