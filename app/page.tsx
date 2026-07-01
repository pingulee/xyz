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
import Container from "@/components/Container";
import FaqItem from "@/components/FaqItem";
import HeroSlider from "@/components/HeroSlider";
import LineupCard from "@/components/LineupCard";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import ServiceCard from "@/components/ServiceCard";
import PriceTable from "@/components/PriceTable";
import JsonLd from "@/components/JsonLd";
import { services, site } from "@/lib/site";
import { getLineups } from "@/lib/lineups";

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
  ["다이아 목표였는데 일정 맞춰서 깔끔하게 끝났어요.", "boosting"],
  ["듀오로 하니까 피드백이 바로 와서 훨씬 편했습니다.", "duo"],
  ["상담이 빠르고 조건 설명이 투명해서 믿고 진행했어요.", "account"],
];

const faqs = [
  [
    "롤 대리 진행 방식은 어떻게 되나요?",
    "현재 티어, 목표 티어, 포지션, 선호 챔피언, 일정 등을 확인한 뒤 조건에 맞는 기사로 배정하여 진행합니다.",
  ],
  [
    "상담은 어떻게 신청하나요?",
    "카카오톡 상담을 통해 현재 티어와 목표 티어를 알려주시면 빠르게 견적과 진행 가능 여부를 안내드립니다.",
  ],
  [
    "가격은 고정인가요?",
    "가격은 현재 티어, 목표 티어, MMR, 승급전 여부, 챔피언 제한, 진행 속도에 따라 달라질 수 있습니다.",
  ],
  [
    "진행 전에 견적만 받아볼 수 있나요?",
    "네, 신청하지 않아도 견적 상담은 가능합니다.",
  ],
  [
    "롤 대리와 롤 듀오는 어떤 차이가 있나요?",
    "롤 대리는 기사님이 계정에 접속해 진행하는 방식이고, 롤 듀오는 고객님과 기사님이 함께 게임하는 방식입니다.",
  ],
  [
    "듀오는 어느 티어까지 가능한가요?",
    "가능 티어는 시즌 상황과 기사 배정 가능 여부에 따라 달라질 수 있어 상담 시 확인이 필요합니다.",
  ],
  [
    "원하는 챔피언으로 진행할 수 있나요?",
    "가능합니다. 다만 챔피언 제한이 많거나 특정 챔피언만 요청하는 경우 견적이 달라질 수 있습니다.",
  ],
  [
    "원하는 포지션으로 진행할 수 있나요?",
    "가능합니다. 정글, 미드, 원딜 등 원하는 포지션을 알려주시면 최대한 맞춰 배정합니다.",
  ],
  [
    "진행 중 상황을 확인할 수 있나요?",
    "진행 상황은 상담 채널을 통해 안내받을 수 있습니다.",
  ],
  [
    "진행 시간은 얼마나 걸리나요?",
    "구간, 목표 티어, 기사 일정, 계정 상태에 따라 다르며 상담 시 예상 시간을 안내드립니다.",
  ],
  [
    "빠른 진행도 가능한가요?",
    "가능한 경우 빠른 진행으로 배정할 수 있지만, 기사 상황과 구간에 따라 추가 비용이 발생할 수 있습니다.",
  ],
  [
    "승률 보장 서비스가 있나요?",
    "일정 조건 이상 신청 시 승률 보장 옵션을 안내드릴 수 있습니다.",
  ],
  [
    "패배하면 어떻게 되나요?",
    "일반 진행은 게임 특성상 패배가 발생할 수 있습니다. 승률 보장 조건이 있는 경우 해당 기준에 따라 처리됩니다.",
  ],
  [
    "기사 과실 기준은 어떻게 되나요?",
    "기사 과실 여부는 KDA, 게임 내용, 진행 상황 등을 기준으로 검토합니다.",
  ],
  [
    "마스터 이상도 가능한가요?",
    "가능 여부는 시즌, 서버, 계정 상태, 기사 배정 상황에 따라 상담 후 안내드립니다.",
  ],
  ["배치고사도 가능한가요?", "네, 배치고사 진행도 상담 가능합니다."],
  [
    "승급전만 신청할 수 있나요?",
    "가능합니다. 승급전, 승격전, 단기 구간 모두 상담 가능합니다.",
  ],
  [
    "1승만 신청할 수 있나요?",
    "가능 여부는 티어와 기사 일정에 따라 달라질 수 있습니다.",
  ],
  [
    "MMR이 낮아도 가능한가요?",
    "가능합니다. 다만 MMR이 낮으면 필요한 판 수가 많아질 수 있어 견적이 달라질 수 있습니다.",
  ],
  [
    "연패 계정도 가능한가요?",
    "가능합니다. 계정 상태 확인 후 진행 방향을 안내드립니다.",
  ],
  [
    "휴면 계정도 가능한가요?",
    "가능합니다. 휴면 강등, 휴면 해제, 티어 복구 모두 상담 가능합니다.",
  ],
  [
    "계정 정지를 당할 위험은 없나요?",
    "게임 정책상 계정 공유 방식은 위험이 있을 수 있습니다. 무리한 진행보다 안전한 방식으로 안내드립니다.",
  ],
  [
    "VPN을 사용하나요?",
    "필요한 경우 계정 상태와 접속 환경을 고려해 안전한 방식으로 진행합니다.",
  ],
  [
    "작업 중 접속해도 되나요?",
    "진행 중에는 중복 접속으로 문제가 생길 수 있으니 사전에 안내받은 시간에는 접속하지 않는 것을 권장합니다.",
  ],
  [
    "작업 중 닉네임이나 친구 목록이 보이나요?",
    "계정 진행에 필요한 최소 정보 외에는 불필요한 확인을 하지 않습니다.",
  ],
  [
    "채팅을 사용하나요?",
    "불필요한 채팅은 최대한 하지 않고 게임 진행에 집중합니다.",
  ],
  [
    "스펠 위치나 설정은 바뀌나요?",
    "진행에 필요한 경우 설정이 변경될 수 있어, 원하시는 설정이 있다면 미리 알려주시면 됩니다.",
  ],
  [
    "스킨이나 RP를 사용하나요?",
    "고객 동의 없이 스킨, RP, BE 등 재화는 사용하지 않습니다.",
  ],
  [
    "친구 추가나 듀오 기록이 남나요?",
    "듀오 진행 시에는 게임 기록과 듀오 기록이 남을 수 있습니다.",
  ],
  [
    "롤 계정 구매도 가능한가요?",
    "맞춤형 롤 계정 상담이 가능합니다. 원하는 티어, 챔피언, 스킨, 서버 조건을 알려주시면 됩니다.",
  ],
  [
    "계정은 즉시 받을 수 있나요?",
    "보유 계정 여부에 따라 즉시 안내 가능한 경우도 있고, 조건에 맞는 계정을 찾는 시간이 필요할 수 있습니다.",
  ],
  [
    "원하는 챔피언이 많은 계정도 가능한가요?",
    "가능합니다. 챔피언 보유 수, 스킨 수, 티어 조건에 따라 가격이 달라질 수 있습니다.",
  ],
  [
    "환불은 가능한가요?",
    "진행 전 상태와 진행 후 상태에 따라 환불 가능 여부가 달라질 수 있어 상담 시 기준을 안내드립니다.",
  ],
  [
    "결제 후 바로 시작되나요?",
    "기사 배정과 일정 확인 후 시작됩니다. 빠른 시작이 가능한 경우 바로 안내드립니다.",
  ],
  [
    "상담 가능 시간은 언제인가요?",
    "상담은 가능한 빠르게 확인하며, 상황에 따라 답변 시간이 달라질 수 있습니다.",
  ],
  ["비밀 보장은 되나요?", "상담 내용과 계정 정보는 외부에 공개하지 않습니다."],
  [
    "어떤 정보를 알려줘야 하나요?",
    "현재 티어, 목표 티어, 서버, 포지션, 원하는 챔피언, 진행 방식, 희망 일정을 알려주시면 됩니다.",
  ],
  [
    "기사님 실력은 믿을 수 있나요?",
    "상위 티어 경험이 있는 검증된 기사 기준으로 배정합니다.",
  ],
  [
    "진행 도중 목표를 변경할 수 있나요?",
    "가능합니다. 다만 목표 티어 변경 시 추가 견적이 발생할 수 있습니다.",
  ],
  [
    "중간에 멈출 수 있나요?",
    "가능합니다. 진행 상황에 따라 정산 기준을 안내드립니다.",
  ],
  ["모바일로도 상담 가능한가요?", "네, 카카오톡으로 모바일 상담이 가능합니다."],
  [
    "해외 서버도 가능한가요?",
    "서버와 핑, 기사 배정 가능 여부에 따라 상담이 필요합니다.",
  ],
  ["롤토체스도 가능한가요?", "가능 여부는 별도 상담이 필요합니다."],
  [
    "일반 게임이나 칼바람도 가능한가요?",
    "주 서비스는 랭크 중심이며, 일반 게임이나 칼바람은 상담 후 가능 여부를 안내드립니다.",
  ],
  [
    "후기 게시판은 실제 후기인가요?",
    "후기 게시판은 사이트 운영 방식에 따라 등록되며, 실제 후기 기반으로 관리하는 것을 권장합니다.",
  ],
  [
    "왜 xyz를 선택해야 하나요?",
    "상담, 견적, 기사 배정, 진행 보고까지 체계적으로 관리하는 것을 목표로 운영합니다.",
  ],
];

export default async function Home() {
  const lineups = (await getLineups(true, true)).slice(0, 3);

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
                  className="rounded-3xl border border-gold/12 bg-white/[.035] p-5 text-center"
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
                  <div className="flex min-w-45 flex-col items-center gap-3 rounded-3xl border border-gold/15 bg-white/[.035] p-5 text-center">
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
                <LineupCard knight={lineup} />
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
