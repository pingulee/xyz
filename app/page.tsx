import Image from "next/image";
import Link from "next/link";
import {
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
import HeroSlider from "@/components/home/HeroSlider";
import HomeFaq, {
  type HomeFaqCategory,
} from "@/components/home/HomeFaq";
import ServiceGuide from "@/components/home/ServiceGuide";
import BoosterCard from "@/components/booster/BoosterCard";
import Reveal from "@/components/ui/Reveal";
import SectionTitle from "@/components/ui/SectionTitle";
import ServiceCard from "@/components/home/ServiceCard";
import QuoteCalculator from "@/components/quote/QuoteCalculator";
import JsonLd from "@/components/ui/JsonLd";
import { services, site } from "@/lib/site";
import { getBoosterList } from "@/lib/booster";
import type { Booster } from "@/lib/booster-model";

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

const reviewList = [
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

const faqCategories: HomeFaqCategory[] = [
  {
    id: "boosting",
    label: "롤 대리",
    title: "롤 대리 이용 전 확인",
    description:
      "진행 방식부터 시간제와 승률 보장 기준까지, 계정을 맡기기 전에 필요한 내용을 모았습니다.",
    detailHref: "/boosting",
    detailLabel: "롤 대리 가격 자세히 보기",
    items: [
      {
        question: "롤 대리는 어떤 방식으로 진행되나요?",
        answer:
          "카카오톡 상담에서 현재 티어와 목표 티어, 희망 일정, 라인·챔피언 요청을 확인합니다. 조건에 맞는 기사를 배정하고 결제 확인 후 기사가 계정에 접속해 작업을 진행합니다.",
      },
      {
        question: "시간제 롤 대리는 무엇인가요?",
        answer:
          "신청한 시간 동안 기사가 대리 작업을 진행하는 방식입니다. 예를 들어 2시간을 신청하면 2시간을 기준으로 작업을 진행합니다.",
      },
      {
        question: "롤 대리 승률 보장 기준은 언제 적용되나요?",
        answer:
          "시간제 대리의 승률 보장 기준은 10시간 이상 신청할 때 적용됩니다. 티어 구간별 보장률은 가격표에서 확인할 수 있으며, 기준에 미달한 구간은 상담 후 추가 진행으로 보완합니다.",
      },
      {
        question: "롤 대리도 라인과 챔피언을 지정할 수 있나요?",
        answer:
          "상담 시 원하는 라인·챔피언·플레이 스타일을 요청할 수 있으며 가능한 범위에서 반영합니다. 비주류 챔피언 요청은 추가 요금이 발생할 수 있습니다.",
      },
      {
        question: "롤 대리 진행 현황은 어떻게 확인하나요?",
        answer:
          "진행 중인 대리 작업의 현재 상황은 카카오톡 상담 채널로 문의해 확인할 수 있습니다.",
      },
      {
        question: "계정이 정지될 위험은 없나요?",
        answer:
          "무리한 연속 플레이 대신 계정 상태와 MMR을 고려한 안정적인 진행을 원칙으로 합니다. 상위 티어 기사가 수동으로만 작업하며 프로그램·핵을 일절 사용하지 않아 위험을 최소화합니다.",
      },
      {
        question: "작업은 얼마나 걸리나요?",
        answer:
          "구간과 목표 티어, 하루 진행 가능 판수에 따라 달라집니다. 보통 한 판당 30분 내외로 진행되며, 상담 시 현재 티어와 목표를 기준으로 예상 소요 기간을 안내합니다.",
      },
      {
        question: "작업 계정 정보는 안전하게 관리되나요?",
        answer:
          "전달받은 계정 정보는 작업 목적으로만 사용하고 작업 완료 후 안전하게 폐기합니다. 진행 중에는 지정된 기사 한 명만 계정에 접속합니다.",
      },
      {
        question: "작업이 끝난 걸 어떻게 확인하나요?",
        answer:
          "목표 티어 달성 시 결과 화면과 함께 완료를 안내합니다. 진행한 게임 기록은 작업 후기의 기사 답변에 티어·챔피언·KDA로 함께 남아 직접 확인할 수 있습니다.",
      },
    ],
  },
  {
    id: "duo",
    label: "롤 듀오",
    title: "롤 듀오 선택과 진행",
    description:
      "직접 플레이하는 듀오의 특징과 기사 배정, 보이스 채팅, 요청 가능한 조건을 확인하세요.",
    detailHref: "/duo",
    detailLabel: "롤 듀오 가격 자세히 보기",
    items: [
      {
        question: "롤 듀오는 롤 대리와 무엇이 다른가요?",
        answer:
          "롤 대리는 기사가 고객님의 계정으로 작업하고, 롤 듀오는 고객님이 직접 플레이하며 기사와 파티를 맺어 랭크를 진행합니다.",
      },
      {
        question: "롤 듀오 랭크는 어떻게 시작하나요?",
        answer:
          "상담에서 현재 티어와 희망 시간대를 확인한 뒤 조건에 맞는 기사를 배정합니다. 결제가 확인되면 기사가 고객님을 초대하고 함께 파티를 맺어 듀오 랭크를 진행합니다.",
      },
      {
        question: "롤 듀오에서 보이스 채팅은 필수인가요?",
        answer:
          "필수는 아니며 채팅 위주로도 진행할 수 있습니다. 원활한 콜과 피드백을 원하면 보이스 채팅을 요청할 수 있고, 비용이 추가될 수 있어 상담 시 확인이 필요합니다.",
      },
      {
        question: "롤 듀오도 라인이나 챔피언 요청이 가능한가요?",
        answer:
          "원하는 라인·챔피언·플레이 스타일을 상담에서 요청할 수 있습니다. 비주류 챔피언이나 특정 조합은 추가 요금이 발생할 수 있습니다.",
      },
      {
        question: "롤 듀오에도 승률 보장 기준이 있나요?",
        answer:
          "10시간 이상 진행할 때 티어 구간별 승률 보장 기준이 적용됩니다. 기준에 미달한 구간은 상담 후 추가 진행으로 보완하며, 구체적인 보장률은 듀오 가격표에서 확인할 수 있습니다.",
      },
      {
        question: "롤 듀오는 어떤 사람에게 추천하나요?",
        answer:
          "계정을 맡기지 않고 직접 플레이하며 티어를 올리고 싶은 분, 승급전이 불안하거나 연패로 MMR이 무너진 분, 실전 피드백으로 실력까지 키우고 싶은 분께 특히 적합합니다.",
      },
      {
        question: "듀오 중 실시간으로 피드백을 받을 수 있나요?",
        answer:
          "함께 플레이하기 때문에 라인전 운영, 시야 장악, 한타 판단 같은 피드백을 게임 중 바로 받을 수 있습니다. 원하시면 보이스로 상세한 코칭을 함께 진행합니다.",
      },
      {
        question: "듀오 가능한 시간대는 어떻게 되나요?",
        answer:
          "기사별 가능 시간대가 달라 상담에서 희망 시간을 알려주시면 조건이 맞는 기사를 배정합니다. 야간·주말 진행도 기사 일정에 따라 조율할 수 있습니다.",
      },
    ],
  },
  {
    id: "account",
    label: "롤 계정",
    title: "롤 계정 맞춤 상담",
    description:
      "원하는 계정 조건과 예산을 정리하고, 구매 전 확인할 내용을 상담하는 방법을 안내합니다.",
    detailHref: "/account",
    detailLabel: "롤 계정 상담 항목 보기",
    items: [
      {
        question: "롤 계정 상담 시 어떤 조건을 알려주면 되나요?",
        answer:
          "원하는 티어와 챔피언, 스킨, 예산 조건을 알려주시면 해당 기준에 맞춰 상담을 진행합니다.",
      },
      {
        question: "원하는 조건에 맞춰 롤 계정을 상담할 수 있나요?",
        answer:
          "티어·챔피언·스킨 조건과 예산을 기준으로 맞춤 안내를 받을 수 있습니다. 원하는 조건을 구체적으로 전달할수록 상담 기준을 정하기 쉽습니다.",
      },
      {
        question: "롤 계정 가격은 어떻게 확인하나요?",
        answer:
          "계정은 원하는 티어·챔피언·스킨과 예산 조건을 먼저 확인한 뒤 상담을 통해 가격과 진행 가능 여부를 안내합니다.",
      },
      {
        question: "롤 계정 구매 전 확인 항목도 안내받을 수 있나요?",
        answer:
          "상담에서 원하는 계정 조건을 확인한 뒤 구매 전에 살펴봐야 할 항목을 함께 안내합니다.",
      },
      {
        question: "원하는 티어의 계정을 바로 구할 수 있나요?",
        answer:
          "재고 상황과 요청 조건에 따라 다릅니다. 원하는 티어·챔피언·스킨 조건을 알려주시면 보유 여부와 예상 대기 시간을 안내합니다.",
      },
      {
        question: "계정 구매 후 문제가 생기면 어떻게 하나요?",
        answer:
          "구매 전 확인 항목과 보상 기준을 상담에서 안내합니다. 조건과 상황에 따라 대응이 달라질 수 있어 구매 전에 반드시 확인하시길 권장합니다.",
      },
    ],
  },
  {
    id: "payment",
    label: "결제·진행",
    title: "견적부터 완료까지",
    description:
      "상담과 가격 산정, 남은 시간, 기사 교체와 환불처럼 진행 전후에 자주 생기는 질문입니다.",
    detailHref: "#price",
    detailLabel: "예상 견적 계산하기",
    items: [
      {
        question: "상담은 어떻게 신청하나요?",
        answer:
          "카카오톡 상담에서 현재 티어와 원하는 서비스, 희망 시간대를 알려주시면 견적과 진행 가능 여부를 안내합니다.",
      },
      {
        question: "롤 대리·듀오 가격은 어떻게 정해지나요?",
        answer:
          "현재 티어, 진행 구간과 신청 시간, 라인·챔피언 요청, 기사 지정 여부 등에 따라 달라질 수 있습니다. 화면의 견적 계산기는 예상 금액이며 실제 금액은 상담 후 확정됩니다.",
      },
      {
        question: "시간제 결제 후 시간이 남으면 어떻게 되나요?",
        answer:
          "남은 시간만으로 다음 게임을 시작하기 어려우면 우선 진행이 종료될 수 있습니다. 사용하지 못한 시간은 적립되며 다음 작업에서 사용할 수 있습니다.",
      },
      {
        question: "남은 시간보다 다음 게임이 길어질 것 같으면 어떻게 하나요?",
        answer:
          "다음 게임에서 결제 시간을 초과할 것으로 예상되면 추가 진행 여부와 비용이 달라질 수 있습니다. 시작 전에 상담원 또는 기사와 진행 여부를 먼저 상의해 주세요.",
      },
      {
        question: "진행 중 기사 교체를 요청할 수 있나요?",
        answer:
          "작업 속도나 플레이 스타일이 맞지 않거나 일정 조율이 필요하면 상담원에게 문의해 주세요. 현재 상황과 대체 가능한 기사를 확인한 뒤 가능한 범위에서 교체를 안내합니다.",
      },
      {
        question: "결제 후 환불은 가능한가요?",
        answer:
          "진행이 시작되기 전에는 환불이 가능하며, 진행이 시작된 이후에는 환불이 불가합니다.",
      },
      {
        question: "어떤 결제 수단을 사용할 수 있나요?",
        answer:
          "이용 가능한 결제 수단은 카카오톡 상담에서 안내합니다. 진행 방식과 금액에 따라 결제 방법을 함께 확정합니다.",
      },
      {
        question: "상담은 몇 시까지 가능한가요?",
        answer:
          "카카오톡 상담은 24시간 접수하며, 접수 순서와 기사 일정에 따라 순차적으로 답변드립니다.",
      },
    ],
  },
];

const faqs = faqCategories.flatMap((category) => category.items);

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  })),
};

// AEO: 진행 과정을 답변 엔진이 단계형으로 추출할 수 있게 HowTo로 마크업
const howToJsonLd = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "롤 대리 · 롤 듀오 진행 과정",
  description:
    "상담 접수부터 작업 완료까지 XYZ의 롤 대리·롤 듀오 서비스 진행 5단계입니다.",
  step: [
    { name: "상담 접수", text: "카카오톡으로 현재 티어, 목표 티어, 희망 일정을 알려주세요." },
    { name: "계정 분석", text: "현재 티어와 MMR을 확인해 최적의 진행 방식을 정합니다." },
    { name: "기사 배정", text: "조건에 맞는 상위 티어 검증 기사를 1:1로 배정합니다." },
    { name: "작업 진행", text: "100% 수동으로 진행하며 카카오톡으로 실시간 상황을 공유합니다." },
    { name: "작업 완료", text: "목표 달성 확인 후 승률과 게임별 KDA 기록을 제공합니다." },
  ].map((step, i) => ({ "@type": "HowToStep", position: i + 1, ...step })),
};

export default async function Home() {
  let boosterList: Booster[] = [];
  try {
    boosterList = (await getBoosterList(true, true)).slice(0, 3);
  } catch (error) {
    console.error("Failed to load home booster", error);
  }

  return (
    <>
      <JsonLd />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToJsonLd) }}
      />
      <HeroSlider />

      <section className="border-y border-gold/10 bg-black/24 py-9 sm:py-10">
        <Container>
          <Reveal>
            <dl className="grid grid-cols-2 gap-y-8 sm:grid-cols-4">
              {stats.map(({ value, label, icon: Icon }, i) => (
                <div
                  key={value}
                  className={`relative flex flex-col items-center gap-1.5 text-center ${
                    i > 0
                      ? "sm:before:absolute sm:before:left-0 sm:before:top-1/2 sm:before:h-10 sm:before:w-px sm:before:-translate-y-1/2 sm:before:bg-white/8"
                      : ""
                  }`}
                >
                  <dd className="flex items-center gap-2.5 text-2xl font-black tracking-tight text-gold sm:text-3xl">
                    <Icon size={22} aria-hidden="true" className="text-gold/70" />
                    {value}
                  </dd>
                  <dt className="text-sm font-bold text-zinc-400">{label}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <Reveal>
            <SectionTitle
              eyebrow="services"
              title="롤 대리 · 듀오 · 계정 서비스"
              desc="대리, 듀오, 계정까지 목적에 맞는 서비스를 빠르게 선택할 수 있습니다."
            />
          </Reveal>
          <div className="grid items-stretch gap-6 lg:grid-cols-3">
            {services.map((service, i) => (
              <Reveal key={service.href} delay={i * 0.08} className="h-full">
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
              title="롤 대리 · 듀오 진행 과정"
              desc="롤 대리 및 롤 듀오 서비스 작업 진행 과정입니다. 상담부터 결제, 작업, 완료 확인까지 한눈에 확인 해보세요."
            />
          </Reveal>
          <Reveal delay={0.12}>
            {/* 모바일·태블릿: 가로 스냅 스크롤(카드 5개 전부 동일 크기), 데스크톱: 5열 그리드 */}
            <ol className="mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 scrollbar-none lg:grid lg:grid-cols-5 lg:gap-4 lg:overflow-visible lg:pb-0">
              {process.map(({ title, image }, i) => (
                <li
                  key={title}
                  className="relative flex w-[44vw] shrink-0 snap-start flex-col items-center gap-3 rounded-3xl border border-gold/12 bg-white/3.5 p-5 pt-6 text-center transition hover:border-gold/30 sm:w-[30vw] lg:w-auto lg:shrink"
                >
                  <span className="absolute left-4 top-4 text-[11px] font-black tracking-[0.18em] text-gold/80">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20">
                    <Image
                      src={image}
                      alt=""
                      width={96}
                      height={96}
                      className="h-full w-full object-contain"
                    />
                  </span>
                  <b className="text-base text-white sm:text-lg">{title}</b>
                </li>
              ))}
            </ol>
          </Reveal>
        </Container>
      </section>

      <ServiceGuide />

      <section className="py-20">
        <Container>
          <Reveal>
            <SectionTitle
              eyebrow="booster"
              title="BEST 기사"
              desc="XYZ에서 가장 인기있는 기사 3명을 소개합니다."
            />
          </Reveal>
          <div className="grid items-stretch gap-6 lg:grid-cols-3">
            {boosterList.map((booster, i) => (
              <Reveal key={booster.name} delay={i * 0.08} className="h-full">
                <BoosterCard booster={booster} placement={i + 1} />
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="mt-9 text-center">
              <Link
                href="/booster"
                prefetch={false}
                className="inline-flex items-center gap-2 rounded-full border border-gold/20 px-6 py-3 font-bold text-white transition hover:border-gold/60"
              >
                기사 전체 보기 <ArrowRight size={18} />
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="border-y border-white/6 bg-black/20 py-20">
        <Container>
          <Reveal>
            <SectionTitle
              eyebrow="review"
              title="롤 대리 · 듀오 진행 후기"
              desc="롤 대리·롤 듀오·롤 계정 이용 후기를 살펴보세요. 후기 게시판에서는 작성일, 이용 서비스와 연결된 작업 기사 정보를 함께 확인할 수 있습니다."
            />
          </Reveal>
          <Reveal>
            <div className="review-marquee-mask mt-10 space-y-5">
              {[reviewList.slice(0, 5), reviewList.slice(5, 10)].map(
                (row, rowIndex) => (
                  <div
                    key={rowIndex === 0 ? "top" : "bottom"}
                    className={`review-marquee-track ${
                      rowIndex === 0
                        ? "animate-review-marquee-ltr"
                        : "animate-review-marquee-rtl"
                    }`}
                  >
                    {[...row, ...row].map(([text, tag], i) => {
                      const isMarqueeClone = i >= row.length;

                      return (
                        <article
                          key={`${tag}-${isMarqueeClone ? "clone" : "original"}-${i % row.length}`}
                          aria-hidden={isMarqueeClone || undefined}
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
                      );
                    })}
                  </div>
                ),
              )}
            </div>
          </Reveal>
          <Reveal>
            <div className="mt-9 text-center">
              <Link
                href="/review"
                prefetch={false}
                className="inline-flex items-center gap-2 rounded-full border border-gold/20 px-6 py-3 font-bold text-white transition hover:border-gold/60"
              >
                전체 작업 후기 확인하기 <ArrowRight size={18} />
              </Link>
            </div>
          </Reveal>
        </Container>
      </section>

      <section className="py-20">
        <Container>
          <Reveal>
            <SectionTitle
              eyebrow="why xyz"
              title="XYZ를 이용해야 하는 이유"
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
                "상위 티어 검증 기사 중에서 서비스별로 가장 적합한 기사를 배정합니다.",
              ],
              [
                BadgeCheck,
                "투명한 상담",
                "목표와 조건을 확인한 뒤 진행 가능 여부와 견적을 명확하게 안내합니다.",
              ],
            ].map(([Icon, title, desc]) => {
              const I = Icon as typeof ShieldCheck;
              return (
                <Reveal key={String(title)} className="h-full">
                  <div className="card-premium h-full rounded-4xl p-8">
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

      <section id="price" className="scroll-mt-20 py-20">
        <Container>
          <Reveal>
            <SectionTitle
              eyebrow="price"
              title="롤 대리 · 듀오 견적 계산기"
              desc="서비스, 진행 방식, 구간을 선택하면 예상 금액을 바로 확인할 수 있습니다. 실제 견적은 상담 후 확정됩니다."
            />
          </Reveal>
          <Reveal>
            <QuoteCalculator />
          </Reveal>
        </Container>
      </section>

      <section id="faq" className="scroll-mt-20 py-20">
        <Container>
          <Reveal>
            <SectionTitle
              eyebrow="faq"
              title="궁금한 서비스부터 확인하세요"
              desc="롤 대리, 롤 듀오, 롤 계정과 결제·진행 질문을 주제별로 모았습니다. 카테고리를 선택해 필요한 답변을 빠르게 찾아보세요."
            />
          </Reveal>
          <HomeFaq categories={faqCategories} />
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
              <h2 className="max-w-3xl text-3xl font-black tracking-tighter text-balance sm:text-5xl">
                목표 티어까지, 지금 XYZ에서 상담받으세요
              </h2>
              <p className="mt-5 max-w-2xl text-lg font-semibold text-black/70">
                현재 티어와 목표만 알려주면 가장 적합한 방식으로 안내해드립니다.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={site.kakaoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-black px-7 py-4 font-black text-white transition hover:bg-zinc-900"
                >
                  <MessageCircle size={18} />
                  카카오톡 상담하기
                </a>
                <a
                  href="#price"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-black/25 px-7 py-3.5 font-black text-black transition hover:border-black/60"
                >
                  예상 견적 먼저 보기
                </a>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
