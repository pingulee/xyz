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

// 홈 FAQ 리치 결과용 구조화 데이터 (서비스 페이지 FAQ와 질문이 겹치지 않음)
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(([q, a]) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
                prefetch={false}
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
            <SectionTitle
              eyebrow="why xyz"
              title="XYZ가 신뢰를 만드는 방식"
              desc="롤 대리·롤 듀오는 결국 계정을 믿고 맡기는 일입니다. XYZ는 안전, 검증, 투명함 세 가지 원칙으로 운영합니다."
            />
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
            <SectionTitle
              eyebrow="reviews"
              title="진행 후기"
              desc="롤 대리·롤 듀오·롤 계정을 이용한 고객님들의 생생한 후기입니다. 전체 작업 후기는 후기 게시판에서 확인하세요."
            />
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
                        className="w-[42vw] shrink-0 rounded-3xl border border-gold/15 bg-white/3.5 p-4 sm:w-90 sm:p-7"
                      >
                        <div className="flex gap-0.5 text-gold sm:gap-1">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <Star
                              key={starIndex}
                              size={14}
                              className="sm:h-4.5 sm:w-4.5"
                              fill="currentColor"
                            />
                          ))}
                        </div>
                        <p className="mt-3 min-h-24 text-sm leading-6 text-zinc-100 sm:mt-5 sm:min-h-18 sm:text-base sm:leading-7">
                          {text}
                        </p>
                        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-gold sm:mt-5 sm:text-xs sm:tracking-[0.22em]">
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

      {/* SEO 콘텐츠: 롤 대리/듀오 가이드 (검색 의도 커버 + 내부 링크) */}
      <section className="py-20">
        <Container>
          <Reveal>
            <SectionTitle
              eyebrow="guide"
              title="롤 대리 · 롤 듀오 이용 가이드"
              desc="처음 이용하시는 분들을 위해 롤 대리와 롤 듀오의 차이, 안전한 업체를 고르는 기준, XYZ의 진행 방식을 정리했습니다."
            />
          </Reveal>
          <div className="mx-auto grid max-w-4xl gap-10">
            <Reveal>
              <article>
                <h3 className="text-xl font-black text-white">
                  롤 대리란 무엇인가요?
                </h3>
                <p className="mt-3 leading-8 text-zinc-400">
                  롤 대리는 상위 티어의 검증된 기사가 고객님의 리그 오브 레전드
                  계정으로 대신 랭크 게임을 진행해 목표 티어까지 안전하게
                  올려드리는 서비스입니다. 아이언·브론즈·실버 같은 저티어
                  구간부터 다이아몬드, 마스터, 그랜드마스터 이상 고티어 구간까지
                  전 구간 진행이 가능하며, 시간제·승리 보장제·점수 보장제 등
                  목적에 맞는 방식을 선택할 수 있습니다. XYZ의 롤대리는 전원
                  수동 진행이 원칙이며, 계정 상태와 MMR을 먼저 분석한 뒤 무리한
                  연속 플레이 대신 안정적인 일정으로 승급을 진행합니다. 구간별
                  가격과 승률 보장 기준은{" "}
                  <Link
                    href="/boosting"
                    className="font-bold text-gold underline-offset-4 hover:underline"
                  >
                    롤 대리 가격표
                  </Link>
                  에서 바로 확인할 수 있습니다.
                </p>
              </article>
            </Reveal>
            <Reveal>
              <article>
                <h3 className="text-xl font-black text-white">
                  롤 듀오는 어떻게 다른가요?
                </h3>
                <p className="mt-3 leading-8 text-zinc-400">
                  롤 듀오는 고객님이 본인 계정으로 직접 플레이하면서 상위 티어
                  기사와 파티를 맺고 함께 랭크를 올리는 방식입니다. 계정을
                  맡기지 않기 때문에 가장 안전한 티어 상승 방법이고, 게임을
                  함께하며 라인전 운영·시야 장악·한타 판단 같은 실전 피드백을
                  바로 받을 수 있어 실력 향상까지 동시에 챙길 수 있습니다.
                  승급전이 불안한 구간, 연패로 무너진 MMR 복구, 시즌 마감 전
                  막판 스퍼트에 특히 효과적입니다. 자세한 진행 방식과 구간별
                  요금은{" "}
                  <Link
                    href="/duo"
                    className="font-bold text-gold underline-offset-4 hover:underline"
                  >
                    롤 듀오 가격표
                  </Link>
                  에서 확인해보세요. 원하는 티어·챔피언 조건의 계정이 필요하다면{" "}
                  <Link
                    href="/account"
                    className="font-bold text-gold underline-offset-4 hover:underline"
                  >
                    롤 계정 서비스
                  </Link>
                  도 함께 운영 중입니다.
                </p>
              </article>
            </Reveal>
            <Reveal>
              <article>
                <h3 className="text-xl font-black text-white">
                  안전한 롤 대리 업체, 이렇게 확인하세요
                </h3>
                <p className="mt-3 leading-8 text-zinc-400">
                  가격이 저렴하다는 이유만으로 업체를 고르면 계정 정지, 잠수,
                  환불 분쟁 같은 문제를 겪기 쉽습니다. 믿을 수 있는 롤대리
                  업체인지 판단할 때는 최소한 네 가지를 확인하세요. 첫째, 구간별
                  가격과 승률 보장 기준을 숨김없이 공개하는지. 둘째, 실제 작업을
                  진행하는 기사의 티어와 전적이 공개되어 있는지. 셋째, 조작이
                  아닌 실제 진행 기록이 남는 후기가 쌓여 있는지. 넷째, 진행 중
                  상담 채널로 실시간 소통이 가능한지입니다. XYZ는{" "}
                  <Link
                    href="/lineup"
                    className="font-bold text-gold underline-offset-4 hover:underline"
                  >
                    기사 라인업
                  </Link>
                  에서 기사별 티어·모스트 챔피언·티어별 승률·최근 전적을 모두
                  공개하고,{" "}
                  <Link
                    href="/reviews"
                    className="font-bold text-gold underline-offset-4 hover:underline"
                  >
                    작업 후기
                  </Link>
                  에는 담당 기사의 실제 게임 기록(티어·챔피언·KDA)이 답변으로
                  함께 남아 누구나 검증할 수 있습니다.
                </p>
              </article>
            </Reveal>
            <Reveal>
              <article>
                <h3 className="text-xl font-black text-white">
                  XYZ가 티어를 올리는 방식
                </h3>
                <p className="mt-3 leading-8 text-zinc-400">
                  상담에서 현재 티어, 목표 티어, 선호 라인과 챔피언, 희망
                  시간대를 확인한 뒤 조건에 가장 잘 맞는 기사를 1:1로
                  배정합니다. 진행 중에는 카카오톡으로 실시간 진행 상황을
                  공유하고, 작업이 끝나면 티어별 승률과 게임별 KDA가 담긴 작업
                  기록을 남깁니다. 구간별 승률 보장(저티어 최대 90%)이 기준에
                  미달하면 상담 후 추가 진행으로 보완해드리며, 결제 전 예상
                  금액은 메인의 견적 계산기로 미리 확인할 수 있습니다. 대리든
                  듀오든 목표는 하나입니다 — 고객님의 계정을 안전하게, 목표
                  티어까지. 지금 바로{" "}
                  <a
                    href={site.kakaoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-gold underline-offset-4 hover:underline"
                  >
                    카카오톡 상담
                  </a>
                  으로 현재 티어와 목표를 알려주세요.
                </p>
              </article>
            </Reveal>
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
