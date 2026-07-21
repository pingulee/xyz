import { site } from "@/lib/site";

export default function JsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site.url}/#organization`,
        name: site.name,
        url: site.url,
        logo: {
          "@type": "ImageObject",
          url: `${site.url}${site.logo}`,
        },
        image: `${site.url}${site.ogImage}`,
        description: site.description,
        sameAs: [site.kakaoUrl],
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        name: site.name,
        url: site.url,
        inLanguage: "ko-KR",
        publisher: { "@id": `${site.url}/#organization` },
      },
      {
        "@type": "ProfessionalService",
        "@id": `${site.url}/#service`,
        name: site.name,
        url: site.url,
        description: site.description,
        areaServed: "KR",
        inLanguage: "ko-KR",
        serviceType: ["롤 대리", "롤 듀오", "롤 계정", "롤 업디"],
        provider: { "@id": `${site.url}/#organization` },
        sameAs: [site.kakaoUrl],
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
