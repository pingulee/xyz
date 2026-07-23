import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";

const safetyChecks = [
  "구간별 가격과 승률 보장 기준을 공개하는지",
  "실제 기사의 티어와 최근 전적을 확인할 수 있는지",
  "작업 기록이 연결된 후기가 꾸준히 쌓여 있는지",
  "진행 중에도 상담 채널로 소통할 수 있는지",
];

export default function ServiceGuide() {
  return (
    <section
      aria-labelledby="service-guide-title"
      className="relative isolate overflow-hidden border-y border-white/6 bg-[#0d0b08] py-24 sm:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_10%,rgba(222,176,67,0.12),transparent_34%),radial-gradient(circle_at_92%_88%,rgba(250,219,116,0.07),transparent_30%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-16 h-80 w-80 rounded-full border border-gold/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-28 h-56 w-56 rounded-full border border-gold/8"
      />

      <Container className="relative">
        <Reveal>
          <header className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-16">
            <div>
              <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.24em] text-gold">
                <span className="h-px w-10 bg-gold/60" />
                Start here
              </div>
              <h2
                id="service-guide-title"
                className="mt-6 text-3xl font-black leading-[1.08] tracking-tighter text-white sm:text-4xl lg:text-5xl"
              >
                롤 대리와 듀오,
                <br />
                <span className="gold-text">어떤 방식이</span>
                <br className="hidden lg:block" /> 맞을까요?
              </h2>
            </div>

            <div className="max-w-2xl lg:justify-self-end">
              <p className="text-base font-medium leading-8 text-zinc-300 sm:text-lg">
                롤 대리와 롤 듀오 중 어떤 방식이 맞는지부터 업체 검증 기준과
                XYZ의 진행 방식까지, 결정에 필요한 정보만 정리했습니다.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold">
                <Link
                  href="/boosting"
                  className="group inline-flex items-center gap-2 text-white transition hover:text-gold"
                >
                  롤 대리 가격
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  href="/duo"
                  className="group inline-flex items-center gap-2 text-white transition hover:text-gold"
                >
                  롤 듀오 가격
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>
            </div>
          </header>
        </Reveal>

        <div className="mt-14 grid gap-4 lg:grid-cols-12">
          <Reveal className="h-full lg:col-span-7">
            <article className="relative h-full overflow-hidden rounded-4xl border border-gold/15 bg-[linear-gradient(145deg,rgba(222,176,67,0.10),rgba(255,255,255,0.025)_48%,rgba(255,255,255,0.015))] p-6 sm:p-8 lg:p-10">
              <div
                aria-hidden="true"
                className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-gold/8 blur-3xl"
              />
              <div className="relative">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 text-gold">
                    <Sparkles size={20} aria-hidden="true" />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.22em] text-zinc-500">
                    01 · Service choice
                  </span>
                </div>

                <h3 className="mt-8 max-w-xl text-2xl font-black tracking-[-0.035em] text-white sm:text-3xl">
                  맡길지, 함께할지부터 결정하세요
                </h3>
                <p className="mt-3 max-w-2xl leading-7 text-zinc-400">
                  목표는 같아도 플레이 방식은 다릅니다. 원하는 결과와 참여
                  방식에 맞춰 선택하면 됩니다.
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <section className="flex flex-col rounded-3xl border border-white/8 bg-black/24 p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xl font-black text-white">롤 대리</h4>
                      <span className="rounded-full bg-gold/10 px-2.5 py-1 text-[10px] font-black text-gold">
                        목표 티어 중심
                      </span>
                    </div>
                    <p className="mt-4 flex-1 text-sm leading-7 text-zinc-400">
                      검증된 기사가 고객님의 계정으로 랭크를 진행합니다. 현재
                      티어와 MMR을 먼저 확인한 뒤 시간제·승리 보장제·점수 보장제
                      중 목적에 맞는 방식으로 목표 티어까지 관리합니다.
                    </p>
                    <Link
                      href="/boosting"
                      className="group mt-6 inline-flex items-center gap-2 text-sm font-black text-gold"
                    >
                      가격과 진행 방식 보기
                      <ArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  </section>

                  <section className="flex flex-col rounded-3xl border border-white/8 bg-black/24 p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-xl font-black text-white">롤 듀오</h4>
                      <span className="rounded-full bg-white/6 px-2.5 py-1 text-[10px] font-black text-zinc-300">
                        직접 플레이 + 피드백
                      </span>
                    </div>
                    <p className="mt-4 flex-1 text-sm leading-7 text-zinc-400">
                      고객님이 직접 플레이하며 상위 티어 기사와 함께 랭크를
                      올립니다. 계정을 맡기지 않고 라인전 운영, 오브젝트 판단,
                      한타 타이밍에 대한 실전 피드백까지 받을 수 있습니다.
                    </p>
                    <Link
                      href="/duo"
                      className="group mt-6 inline-flex items-center gap-2 text-sm font-black text-gold"
                    >
                      가격과 진행 방식 보기
                      <ArrowRight
                        size={15}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>
                  </section>
                </div>
              </div>
            </article>
          </Reveal>

          <Reveal className="h-full lg:col-span-5" delay={0.08}>
            <article className="flex h-full flex-col rounded-4xl border border-white/8 bg-white/3 p-6 sm:p-8 lg:p-10">
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-gold-soft">
                  <ShieldCheck size={21} aria-hidden="true" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.22em] text-zinc-500">
                  02 · Checklist
                </span>
              </div>

              <h3 className="mt-8 text-2xl font-black tracking-[-0.035em] text-white sm:text-3xl">
                안전한 업체는
                <br />
                감이 아니라 근거로 고릅니다
              </h3>
              <p className="mt-3 leading-7 text-zinc-400">
                저렴한 가격만 보기보다 아래 정보가 실제로 공개되어 있는지 먼저
                확인하세요.
              </p>

              <ul className="mt-7 space-y-3">
                {safetyChecks.map((check) => (
                  <li
                    key={check}
                    className="flex gap-3 rounded-2xl border border-white/6 bg-black/20 px-4 py-3.5 text-sm font-semibold leading-6 text-zinc-200"
                  >
                    <BadgeCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-gold"
                      aria-hidden="true"
                    />
                    {check}
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-7 text-sm font-black">
                <Link
                  href="/booster"
                  prefetch={false}
                  className="text-gold transition hover:text-gold-soft"
                >
                  기사 소개 확인
                </Link>
                <Link
                  href="/review"
                  className="text-gold transition hover:text-gold-soft"
                >
                  실제 작업 후기
                </Link>
              </div>
            </article>
          </Reveal>

        </div>
      </Container>
    </section>
  );
}
