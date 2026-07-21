import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Clock,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";
import Container from "@/components/layout/Container";
import FaqItem from "@/components/ui/FaqItem";
import HeroSlider from "@/components/home/HeroSlider";
import LineupCard from "@/components/lineup/LineupCard";
import Reveal from "@/components/ui/Reveal";
import SectionTitle from "@/components/ui/SectionTitle";
import ServiceCard from "@/components/home/ServiceCard";
import QuoteCalculator from "@/components/quote/QuoteCalculator";
import JsonLd from "@/components/ui/JsonLd";
import { services, site } from "@/lib/site";
import { getLineups } from "@/lib/lineups";
import type { Lineup } from "@/lib/lineup-model";

const stats = [
  { value: "상위 티어", label: "검증 기사", icon: ShieldCheck },
  { value: "100%", label: "수동 진행", icon: Sparkles },
  { value: "24h", label: "상담 접수", icon: Clock },
  { value: "1:1", label: "맞춤 견적", icon: Star },
];

const process = [
  { title: "상담 접수", image: "/images/process/01.webp" },
  { title: "계정 분석", image: "/images/process/02.webp" },
  { title: "기사 배정", image: "/images/process/03.webp" },
  { title: "작업 진행", image: "/images/process/04.webp" },
  { title: "작업 완료", image: "/images/process/05.webp" },
];

const reviews = [
  [
    "마빵 구간 다른 곳은 드럽게 비싸던데 이렇게 저렴해도 되나 싶다..",
    "롤 대리",
  ],
  ["플래티넘 구간 듀오로 20연승함 이 가격에 말이 안됨", "롤 듀오"],
  ["아직도 업디 파는 곳이 있네 잘 안팔려고 하는데 잘쓰는 중 굿굿", "롤 계정"],
  [
    "다른 대리팀도 많이 이용해봤는데 좀 신기한 시스템이긴 하네요 앞으로 여기만 이용할 듯",
    "롤 대리",
  ],
  [
    "평소에 제가 보던 분이 이 업체에 계시네요 ㅎㅎ.. 저야 뭐 싸게 이용해서 좋습니다.",
    "롤 듀오",
  ],
  ["시간제라는거 첨들어보는데 그냥 해봤더니 다 이기시네요 ㅋㅋㅋ", "롤 대리"],
  [
    "챔프 연습용으로 싸게 사서 쓰던 중 본주가 비번 바꿨는데 바로 보상해주심 ㄷㄷ;",
    "롤 계정",
  ],
  [
    "이 가격이면 마진이 거의 없을 것 같은데 기사님들께는 어떻게 페이를 지급하시나요?",
    "롤 듀오",
  ],
  [
    "제가 찾는 기사님은 일정이 항상 꽉 차있어서 아쉽네요.. 어쩔 수 없는 부분 ㅠㅠ",
    "롤 대리",
  ],
  ["랜덤 계정 샀는데 생배 받음 개꿀딱ㅋ", "롤 계정"],
];

const faqs = [
  [
    "롤 대리와 롤 듀오는 어떻게 진행되나요?",
    "상담 후 현재 티어, 원하는 진행 방식, 라인·챔피언 요청, 희망 일정을 확인하고 조건에 맞는 기사님을 배정합니다.\n대리는 기사님이 계정에 접속해 작업을 진행하고, 듀오는 고객님과 기사님이 함께 파티를 맺고 랭크를 진행합니다.",
  ],
  [
    "상담은 어떻게 신청하나요?",
    "카카오톡 상담을 통해 현재 티어와 원하는 서비스, 희망 시간대를 알려주시면 견적과 진행 가능 여부를 안내드립니다.",
  ],
  [
    "가격은 어떻게 정해지나요?",
    "가격은 현재 티어, 진행 구간, 신청 시간, 라인·챔피언 요청, 기사 지정 여부 등에 따라 달라질 수 있습니다. 정확한 금액은 상담 시 안내드립니다.",
  ],
  [
    "라인이나 챔피언 요청이 가능한가요?",
    "네, 가능합니다. 상담 시 원하는 라인·챔피언·플레이 스타일을 말씀해 주시면 최대한 반영합니다. 비주류 챔프나 특정 조합 요청은 추가 요금이 발생할 수 있습니다.",
  ],
  [
    "승률 보장이 안 지켜지면 어떻게 되나요?",
    "10시간 이상 진행 시 승률 보장 기준이 적용됩니다. 승률 미달 구간은 상담 후 추가 진행으로 보완해드리며, 자세한 기준은 상담 시 안내드립니다.",
  ],
  [
    "진행 중 기사 교체가 가능한가요?",
    "작업 속도나 플레이 스타일이 맞지 않거나 기사님 일정 조율이 필요한 경우 상담원에게 문의해 주세요.\n현재 진행 상황과 대체 가능한 기사님 여부를 확인한 뒤 가능한 범위에서 기사 교체를 도와드립니다.",
  ],
  [
    "진행 중 현황을 확인할 수 있나요?",
    "대리는 카카오톡으로 진행 상황을 문의하실 수 있고, 듀오는 고객님이 직접 함께 플레이하기 때문에 진행 상황을 바로 확인하실 수 있습니다.",
  ],
  [
    "시간제는 어떤 방식인가요?",
    "시간제는 특정 시간 동안 기사님이 대리 작업을 진행하거나, 기사님과 함께 듀오 랭크를 진행하는 방식입니다.\n예를 들어 2시간을 신청하면 2시간 기준으로 작업 또는 듀오가 진행됩니다.",
  ],
  [
    "시간제 결제 후 시간이 남으면 어떻게 되나요?",
    "남은 시간만으로 다음 게임을 시작하기 어려운 경우 우선 작업은 종료될 수 있습니다. 남은 시간은 적립되며 다음 작업 시 사용할 수 있습니다.",
  ],
  [
    "환불은 가능한가요?",
    "진행이 시작되기 전에는 환불이 가능하며, 진행이 시작된 이후에는 환불이 불가합니다.",
  ],
];

export default async function Home() {
  let lineups: Lineup[] = [];
  try {
    lineups = (await getLineups(true, true)).slice(0, 3);
  } catch (error) {
    console.error("Failed to load home lineups", error);
  }

  return (
    <>
      <JsonLd />
      <HeroSlider />

      <section className="border-y border-gold/10 bg-black/24 py-10">
        <Container>
          <Reveal>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stats.map(({ value, label, icon: Icon }) => (
                <div
                  key={value}
                  className="rounded-3xl border border-gold/12 bg-white/3.5 p-5 text-center"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold">
                    <Icon size={20} />
                  </div>
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
              desc="대리, 듀오, 계정 까지 목적에 맞는 서비스를 빠르게 선택할 수 있습니다."
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

      <section className="py-20">
        <Container>
          <Reveal>
            <SectionTitle
              center={true}
              eyebrow="process"
              title="작업 진행 과정"
              desc="롤 대리 및 롤 듀오 서비스 작업 진행 과정입니다. 상담부터 결제, 작업, 완료 확인까지 한눈에 확인 해보세요."
            />
          </Reveal>
          <Reveal delay={0.12}>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
              {process.map(({ title, image }, i) => (
                <div
                  key={title}
                  className="flex flex-col items-center gap-3 sm:flex-row"
                >
                  <div className="flex min-w-45 flex-col items-center gap-3 rounded-3xl border border-gold/15 bg-white/3.5 p-5 text-center">
                    <div className="relative">
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-[22px] bg-transparent">
                        <Image
                          src={image}
                          alt={`${title} 아이콘`}
                          width={96}
                          height={96}
                          className="h-20 w-20 object-contain"
                        />
                      </div>
                      <span className="absolute -right-1 -top-1 rounded-full border border-black/10 bg-black px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gold shadow-lg">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <b className="text-lg text-white">{title}</b>
                  </div>
                  {i < process.length - 1 && (
                    <div className="flex items-center text-gold sm:hidden">
                      <ArrowDown size={32} strokeWidth={3} />
                    </div>
                  )}
                  {i < process.length - 1 && (
                    <div className="hidden items-center text-gold sm:flex">
                      <ArrowRight size={32} strokeWidth={3} />
                    </div>
                  )}
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
              title="BEST 기사"
              desc="XYZ에서 가장 인기있는 기사 3명을 소개합니다."
            />
          </Reveal>
          <div className="grid gap-6 lg:grid-cols-3">
            {lineups.map((lineup, i) => (
              <Reveal key={lineup.name} delay={i * 0.08}>
                <LineupCard knight={lineup} placement={i + 1} />
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="mt-9 text-center">
              <Link
                href="/lineup"
                className="inline-flex items-center gap-2 rounded-full border border-gold/20 px-6 py-3 font-bold text-white transition hover:border-gold/60"
              >
                기사 라인업 더보기 <ArrowRight size={18} />
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
              title="견적 계산기"
              desc="서비스, 진행 방식, 구간을 선택하면 예상 금액을 바로 확인할 수 있습니다. 실제 견적은 상담 후 확정됩니다."
            />
          </Reveal>
          <Reveal>
            <QuoteCalculator />
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
          <Reveal>
            <div className="review-marquee-mask mt-10 space-y-5">
              {[reviews.slice(0, 5), reviews.slice(5, 10)].map(
                (row, rowIndex) => (
                  <div
                    key={rowIndex === 0 ? "top" : "bottom"}
                    className={`review-marquee-track ${
                      rowIndex === 0
                        ? "animate-review-marquee-ltr"
                        : "animate-review-marquee-rtl"
                    }`}
                  >
                    {[...row, ...row].map(([text, tag], i) => (
                      <article
                        key={`${tag}-${i}`}
                        className="w-[280px] shrink-0 rounded-3xl border border-gold/15 bg-white/3.5 p-7 sm:w-[360px]"
                      >
                        <div className="flex gap-1 text-gold">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <Star
                              key={starIndex}
                              size={18}
                              fill="currentColor"
                            />
                          ))}
                        </div>
                        <p className="mt-5 min-h-18 leading-7 text-zinc-100">
                          {text}
                        </p>
                        <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-gold">
                          {tag}
                        </p>
                      </article>
                    ))}
                  </div>
                ),
              )}
            </div>
          </Reveal>
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
