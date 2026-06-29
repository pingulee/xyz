import { site } from "@/lib/site";

export default function JsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: site.name,
    url: site.url,
    description: site.description,
    areaServed: "KR",
    serviceType: ["League of Legends Boosting", "Duo Queue", "Account Consultation"],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }} />;
}
