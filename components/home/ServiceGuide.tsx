import Link from "next/link";
import { ArrowRight, ShieldCheck, Users } from "lucide-react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";

const options = [
  {
    icon: ShieldCheck,
    name: "롤 대리",
    tag: "목표 티어 중심",
    tagClass: "bg-gold/10 text-gold",
    desc: "검증된 기사가 고객님의 계정으로 랭크를 진행합니다. 현재 티어와 MMR을 확인한 뒤 목적에 맞는 방식으로 목표 티어까지 관리합니다.",
    points: ["시간제 · 승리 보장제 · 점수 보장제", "구간별 승률 보장", "100% 수동 진행"],
    href: "/boosting",
    linkLabel: "롤 대리 가격 보기",
  },
  {
    icon: Users,
    name: "롤 듀오",
    tag: "직접 플레이 + 피드백",
    tagClass: "bg-white/8 text-zinc-200",
    desc: "고객님이 직접 플레이하며 상위 티어 기사와 함께 랭크를 올립니다. 계정을 맡기지 않고 실전 피드백까지 받을 수 있습니다.",
    points: ["계정 공유 없이 안전", "라인전 · 오브젝트 실시간 코칭", "승급전 · 연패 구간에 강함"],
    href: "/duo",
    linkLabel: "롤 듀오 가격 보기",
  },
];

export default function ServiceGuide() {
  return (
    <section
      aria-labelledby="service-guide-title"
      className="relative isolate overflow-hidden border-y border-white/6 bg-[#0d0b08] py-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(222,176,67,0.12),transparent_36%),radial-gradient(circle_at_92%_92%,rgba(250,219,116,0.06),transparent_32%)]"
      />

      <Container className="relative">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-[0.24em] text-gold">
              <span className="h-px w-8 bg-gold/60" />
              Start here
              <span className="h-px w-8 bg-gold/60" />
            </div>
            <h2
              id="service-guide-title"
              className="mt-5 text-3xl font-black tracking-tighter text-balance text-white sm:text-4xl lg:text-5xl"
            >
              롤 대리와 롤 듀오,
              <br className="sm:hidden" /> <span className="gold-text">무엇이 다를까요?</span>
            </h2>
            <p className="mt-4 text-base leading-8 text-pretty text-zinc-300 sm:text-lg">
              계정을 맡길지, 함께 플레이할지 목표와 참여 방식에 맞춰 선택하세요.
            </p>
          </div>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-4xl items-stretch gap-4 sm:grid-cols-2 sm:gap-5">
          {options.map((option, i) => {
            const Icon = option.icon;
            return (
              <Reveal key={option.name} delay={i * 0.08} className="h-full">
                <article className="flex h-full flex-col rounded-4xl border border-gold/12 bg-[linear-gradient(150deg,rgba(222,176,67,0.08),rgba(255,255,255,0.02)_55%)] p-6 transition hover:border-gold/30 sm:p-8">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 text-gold">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-black text-white">{option.name}</h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-black ${option.tagClass}`}
                      >
                        {option.tag}
                      </span>
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-pretty text-zinc-400">
                    {option.desc}
                  </p>

                  <ul className="mt-5 space-y-2">
                    {option.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2 text-sm font-semibold leading-6 text-zinc-300"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={option.href}
                    className="group mt-auto inline-flex items-center gap-2 pt-7 text-sm font-black text-gold transition hover:text-gold-soft"
                  >
                    {option.linkLabel}
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </Link>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
