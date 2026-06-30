import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import Container from "@/components/Container";
import FaqItem from "@/components/FaqItem";
import HeroSlider from "@/components/HeroSlider";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import ServiceCard from "@/components/ServiceCard";
import PriceTable from "@/components/PriceTable";
import JsonLd from "@/components/JsonLd";
import { services, site } from "@/lib/site";
import { getLineups } from "@/lib/lineups";

const stats = [
  ["상위 티어", "검증 기사"],
  ["100%", "수동 진행"],
  ["24h", "상담 접수"],
  ["1:1", "맞춤 견적"],
];

const process = [
  "상담 접수",
  "조건 확인",
  "기사 배정",
  "진행 리포트",
  "완료 확인",
];

const reviews = [
  ["다이아 목표였는데 일정 맞춰서 깔끔하게 끝났어요.", "boosting"],
  ["듀오로 하니까 피드백이 바로 와서 훨씬 편했습니다.", "duo"],
  ["상담이 빠르고 조건 설명이 투명해서 믿고 진행했어요.", "account"],
];

const faqs = [
  [
    "진행 방식은 어떻게 되나요?",
    "현재 티어, 목표 티어, 선호 챔피언, 일정 조건을 확인한 뒤 맞는 기사로 배정합니다.",
  ],
  [
    "가격은 고정인가요?",
    "구간, MMR, 챔피언 제한, 진행 속도에 따라 달라져 상담 후 정확하게 안내합니다.",
  ],
  [
    "진행 상황을 볼 수 있나요?",
    "진행 중 중요한 내용은 상담 채널에서 확인할 수 있도록 안내합니다.",
  ],
  [
    "이미지는 어디서 교체하나요?",
    "메인 슬라이드는 public/images/hero/boosting.webp, duo.webp, account.webp 파일을 교체하면 됩니다.",
  ],
];

export default async function Home() {
  const lineups = await getLineups();

  return (
    <>
      <JsonLd />
      <HeroSlider />

      <section className="border-y border-gold/10 bg-black/24 py-10">
        <Container>
          <Reveal>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map(([value, label]) => (
                <div
                  key={value}
                  className="rounded-3xl border border-gold/12 bg-white/[.035] p-5 text-center"
                >
                  <b className="text-2xl font-black text-gold sm:text-3xl">
                    {value}
                  </b>
                  <p className="mt-1 text-sm font-bold text-zinc-400">
                    {label}
                  </p>
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
              eyebrow="services"
              title="서비스 안내"
              desc="대리, 듀오, 계정 상담까지 목적에 맞는 서비스를 빠르게 선택할 수 있습니다."
            />
          </Reveal>
          <div className="grid gap-6 lg:grid-cols-3">
            {services.map((service, i) => (
              <Reveal key={service.href} delay={i * 0.08}>
                <ServiceCard {...service} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-x-0 top-1/2 h-56 -translate-y-1/2 bg-gold/10 blur-[120px]" />
        <Container className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <SectionTitle
              center={false}
              eyebrow="process"
              title="운영 가능한 진행 프로세스"
              desc="상담부터 완료 확인까지 실제 서비스 운영에 맞춘 단계로 진행합니다."
            />
          </Reveal>
          <Reveal delay={0.12}>
            <div className="grid gap-3">
              {process.map((item, i) => (
                <div
                  key={item}
                  className="flex items-center gap-5 rounded-3xl border border-gold/15 bg-white/[.035] p-5"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gold-gradient font-black text-black">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <b className="text-lg text-white">{item}</b>
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
              eyebrow="lineup"
              title="기사 라인업 미리보기"
              desc="포지션과 티어 기준으로 검증된 기사 풀을 운영합니다."
            />
          </Reveal>
          <div className="grid gap-6 lg:grid-cols-3">
            {lineups.map(({ name, rank, image }, i) => (
              <Reveal key={name} delay={i * 0.08}>
                <article className="card-premium overflow-hidden rounded-[34px]">
                  <div className="relative aspect-4/3 bg-black">
                    {image && (
                      <Image
                        src={image}
                        alt={`${name} 프로필 이미지`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover opacity-90"
                        unoptimized
                      />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent" />
                  </div>
                  <div className="p-7">
                    <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-black text-gold">
                      {rank}
                    </span>
                    <h3 className="mt-5 text-2xl font-black text-white">
                      {name}
                    </h3>
                    <p className="mt-3 leading-7 text-zinc-400">
                      포지션별 숙련도와 진행 안정성을 기준으로 배정합니다.
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="mt-9 text-center">
              <Link
                href="/lineup"
                className="inline-flex items-center gap-2 rounded-full border border-gold/20 px-6 py-3 font-bold text-white transition hover:border-gold/60"
              >
                기사 라인업 보기 <ArrowRight size={18} />
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <Reveal>
            <SectionTitle
              eyebrow="price"
              title="가격 미리보기"
              desc="실제 견적은 상담 후 확정되며, 아래 표는 구간별 안내 기준입니다."
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
            <SectionTitle eyebrow="why xyz" title="XYZ가 신뢰를 만드는 방식" />
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
            <SectionTitle eyebrow="reviews" title="진행 후기" />
          </Reveal>
          <div className="grid gap-5 lg:grid-cols-3">
            {reviews.map(([text, tag]) => (
              <Reveal key={text}>
                <article className="rounded-3xl border border-gold/15 bg-white/[.035] p-7">
                  <div className="flex gap-1 text-gold">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={18} fill="currentColor" />
                    ))}
                  </div>
                  <p className="mt-5 min-h-18 leading-7 text-zinc-300">
                    {text}
                  </p>
                  <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-gold">
                    {tag}
                  </p>
                </article>
              </Reveal>
            ))}
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
              <FaqItem key={q} q={q} a={a} />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <Reveal>
            <div className="relative overflow-hidden rounded-[36px] border border-gold/25 bg-gold-gradient p-8 text-black sm:p-12 lg:p-16">
              <Sparkles
                className="absolute right-8 top-8 opacity-30"
                size={120}
              />
              <h2 className="max-w-3xl text-4xl font-black tracking-tighter sm:text-6xl">
                목표 티어까지, 지금 XYZ에서 상담받으세요
              </h2>
              <p className="mt-5 max-w-2xl text-lg font-semibold text-black/70">
                현재 티어와 목표만 알려주면 가장 적합한 방식으로 안내해드립니다.
              </p>
              <a
                href={site.kakaoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-7 py-4 font-black text-white"
              >
                <MessageCircle size={18} />
                카카오톡 상담하기
              </a>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
