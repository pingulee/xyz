import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  ShieldCheck,
  Star,
  Trophy,
} from "lucide-react";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import ServiceCard from "@/components/ServiceCard";
import PriceTable from "@/components/PriceTable";
import JsonLd from "@/components/JsonLd";
import { services, site } from "@/lib/site";

const stats = [
  ["상위 티어", "검증 기사"],
  ["100%", "수동 진행"],
  ["24h", "상담 접수"],
  ["1:1", "맞춤 견적"],
];

const process = [
  "상담 접수",
  "견적 안내",
  "기사 배정",
  "진행 보고",
  "완료 확인",
];

const faqs = [
  [
    "진행 방식은 어떻게 되나요?",
    "현재 티어, 목표 티어, 선호 챔피언, 일정 확인 후 가장 적합한 기사로 배정합니다.",
  ],
  [
    "가격은 고정인가요?",
    "구간, mmr, 챔피언 제한, 진행 속도에 따라 달라질 수 있어 상담 후 정확히 안내합니다.",
  ],
  [
    "진행 상황을 볼 수 있나요?",
    "진행 중 필요한 내용을 상담 채널에서 확인할 수 있도록 안내합니다.",
  ],
  [
    "이미지는 어디에 넣나요?",
    "public/images/hero.png, boosting.png, duo.png, account.png, lineup-1.png 파일을 교체하면 됩니다.",
  ],
];

export default function Home() {
  return (
    <>
      <JsonLd />
      <section className="noise relative min-h-[calc(100vh-80px)] overflow-hidden">
        <div className="grid-bg absolute inset-0" />
        <div className="absolute left-1/2 top-8 h-130 w-130 -translate-x-1/2 rounded-full bg-gold/20 blur-[130px]" />
        <Container className="relative grid gap-14 py-20 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:py-28">
          <Reveal>
            <p className="inline-flex rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-xs font-black uppercase tracking-[.28em] text-gold">
              premium league service
            </p>
            <h1 className="mt-7 text-5xl font-black leading-[.96] tracking-[-.07em] text-white sm:text-7xl lg:text-8xl">
              프리미엄
              <br />
              <span className="gold-text">롤 대리</span>
              <br />
              서비스 xyz
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-9 text-zinc-300">
              검증된 기사 라인업과 체계적인 운영으로 목표 티어까지 안정적으로
              진행합니다. 상담부터 완료까지 깔끔하게 관리되는 프리미엄 서비스를
              경험하세요.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={site.kakaoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-gradient px-7 py-4 font-black text-black shadow-gold transition hover:-translate-y-1"
              >
                빠른 상담하기 <ArrowRight size={18} />
              </a>
              <Link
                href="/price"
                className="inline-flex items-center justify-center rounded-full border border-gold/20 bg-white/4 px-7 py-4 font-bold text-white transition hover:border-gold/60"
              >
                가격 안내 보기
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map(([a, b]) => (
                <div
                  key={a}
                  className="rounded-3xl border border-gold/12 bg-white/[.035] p-5"
                >
                  <b className="text-2xl font-black text-gold">{a}</b>
                  <p className="mt-1 text-sm text-zinc-400">{b}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="relative mx-auto max-w-140">
              <div className="absolute inset-8 rounded-full bg-gold/25 blur-[90px]" />
              <div className="card-premium relative overflow-hidden rounded-[44px] p-4">
                <div className="relative aspect-4/5 overflow-hidden rounded-[34px] bg-black">
                  <Image
                    src="/images/hero.png"
                    alt="xyz 메인 히어로 이미지 위치"
                    fill
                    priority
                    className="object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-black/20" />
                  <div className="absolute bottom-6 left-6 right-6 rounded-[28px] border border-gold/20 bg-black/55 p-5 backdrop-blur-xl">
                    <p className="text-xs font-black uppercase tracking-[.28em] text-gold">
                      challenger verified
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-white">
                      승률 중심 맞춤 진행
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <Reveal>
            <SectionTitle
              eyebrow="services"
              title="서비스 안내"
              desc="대리, 듀오, 계정 상담까지 필요한 서비스를 빠르게 선택할 수 있습니다."
            />
          </Reveal>
          <div className="grid gap-6 lg:grid-cols-3">
            {services.map((s, i) => (
              <Reveal key={s.href} delay={i * 0.08}>
                <ServiceCard {...s} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-x-0 top-1/2 h-56 -translate-y-1/2 bg-gold/10 blur-[120px]" />
        <Container className="relative grid gap-10 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <Reveal>
            <SectionTitle
              center={false}
              eyebrow="process"
              title="운영 가능한 수준의 진행 프로세스"
              desc="상담, 견적, 기사 배정, 진행 보고, 완료 확인까지 실제 운영에 맞춘 구조입니다."
            />
          </Reveal>
          <Reveal delay={0.12}>
            <div className="grid gap-3">
              {process.map((p, i) => (
                <div
                  key={p}
                  className="flex items-center gap-5 rounded-3xl border border-gold/15 bg-white/[.035] p-5"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-gradient font-black text-black">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <b className="text-lg text-white">{p}</b>
                </div>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <Reveal>
            <SectionTitle
              eyebrow="price"
              title="가격 안내"
              desc="실제 가격은 상담 후 확정되며, 사이트에는 신뢰를 위한 안내 테이블을 배치했습니다."
            />
          </Reveal>
          <Reveal>
            <PriceTable />
          </Reveal>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <Reveal>
            <SectionTitle eyebrow="why xyz" title="xyz가 신뢰를 만드는 방식" />
          </Reveal>
          <div className="grid gap-5 lg:grid-cols-3">
            {[
              [
                ShieldCheck,
                "안전 중심",
                "무리한 속도보다 계정 상태와 일정에 맞춘 안정적인 진행을 우선합니다.",
              ],
              [
                Trophy,
                "검증 기사",
                "상위 티어 기사 라인업을 기준으로 서비스별 적합한 기사를 배정합니다.",
              ],
              [
                BadgeCheck,
                "투명한 상담",
                "목표와 조건을 확인한 뒤 진행 가능 여부와 견적을 명확하게 안내합니다.",
              ],
            ].map(([Icon, title, desc]) => {
              const I = Icon as typeof ShieldCheck;
              return (
                <Reveal key={String(title)}>
                  <div className="card-premium rounded-4xl p-8">
                    <I className="text-gold" size={36} />
                    <h3 className="mt-6 text-2xl font-black text-white">
                      {String(title)}
                    </h3>
                    <p className="mt-3 leading-7 text-zinc-400">
                      {String(desc)}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <Reveal>
            <SectionTitle eyebrow="faq" title="자주 묻는 질문" />
          </Reveal>
          <div className="mx-auto max-w-4xl space-y-4">
            {faqs.map(([q, a]) => (
              <details
                key={q}
                className="group rounded-3xl border border-gold/15 bg-white/[.035] p-6"
              >
                <summary className="cursor-pointer list-none text-lg font-black text-white">
                  {q}
                </summary>
                <p className="mt-4 leading-7 text-zinc-400">{a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-[44px] border border-gold/25 bg-gold-gradient p-10 text-black sm:p-14 lg:p-16">
              <Star
                className="absolute right-10 top-10 opacity-30"
                size={120}
              />
              <h2 className="max-w-3xl text-4xl font-black tracking-tighter sm:text-6xl">
                목표 티어까지, 지금 xyz에서 상담받으세요
              </h2>
              <p className="mt-5 max-w-2xl text-lg font-semibold text-black/70">
                현재 티어와 목표 티어만 알려주면 가장 적합한 방식으로
                안내드립니다.
              </p>
              <a
                href={site.kakaoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex rounded-full bg-black px-7 py-4 font-black text-white"
              >
                카카오톡 상담하기
              </a>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
