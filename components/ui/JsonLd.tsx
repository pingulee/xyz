import { site } from "@/lib/site";

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
