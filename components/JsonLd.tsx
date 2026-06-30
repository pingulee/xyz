import { site } from "@/lib/site";

export default function JsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.name,
    url: site.url,
    description: site.description,
    areaServed: "KR",
    inLanguage: "ko-KR",
    serviceType: ["롤 대리", "롤 듀오", "롤 계정", "롤 업디"],
    sameAs: [site.kakaoUrl],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
