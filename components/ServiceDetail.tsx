import { ArrowRight, CheckCircle2 } from "lucide-react";
import Container from "@/components/Container";
import PriceTable from "@/components/PriceTable";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import { site } from "@/lib/site";

type ServiceDetailProps = {
  eyebrow: string;
  title: string;
  desc: string;
  featureTitle: string;
  points: string[];
  cta: string;
  showPriceTable?: boolean;
};

export default function ServiceDetail({
  eyebrow,
  title,
  desc,
  featureTitle,
  points,
  cta,
  showPriceTable = false,
}: ServiceDetailProps) {
  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <SectionTitle eyebrow={eyebrow} title={title} desc={desc} />
        </Reveal>
        <div className="grid gap-8">
          <Reveal>
            <div className="card-premium rounded-[34px] p-8">
              <h2 className="text-2xl font-black text-white">{featureTitle}</h2>
              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {points.map((point) => (
                  <div
                    key={point}
                    className="flex items-center gap-3 rounded-2xl bg-white/4 p-4 text-zinc-300"
                  >
                    <CheckCircle2 className="shrink-0 text-gold" size={20} />
                    {point}
                  </div>
                ))}
              </div>
              <a
                href={site.kakaoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-4 font-black text-black"
              >
                {cta}
                <ArrowRight size={18} />
              </a>
            </div>
          </Reveal>
          {showPriceTable && (
            <Reveal delay={0.1}>
              <PriceTable />
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  );
}
