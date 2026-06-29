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
    serviceType: [
      "롤대리",
      "롤 듀오",
      "롤 계정 상담",
      "리그 오브 레전드 대리",
    ],
    sameAs: [site.kakaoUrl],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
