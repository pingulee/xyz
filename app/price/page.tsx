import type { Metadata } from "next";
import ServiceCard from "@/components/ServiceCard";
import PriceTable from "@/components/PriceTable";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import { services } from "@/lib/site";

export const metadata: Metadata = {
  title: "가격 안내",
  description: "xyz 롤 대리, 롤 듀오, 롤 계정 가격 안내 페이지입니다.",
  alternates: { canonical: "/price" },
};

export default function PricePage() {
  return (
    <section className="py-20">
      <Container>
        <Reveal><SectionTitle eyebrow="price" title="가격 안내" desc="서비스별 상세 가격 안내 페이지로 이동할 수 있습니다. 실제 견적은 상담 후 확정됩니다." /></Reveal>
        <div className="grid gap-6 lg:grid-cols-3">{services.map((s, i) => <Reveal key={s.href} delay={i*.08}><ServiceCard {...s} /></Reveal>)}</div>
        <div className="mt-14"><PriceTable /></div>
      </Container>
    </section>
  );
}
