"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const slides = [
  {
    eyebrow: "PREMIUM BOOSTING",
    title: "프리미엄 롤 대리",
    titlePrefix: "프리미엄 ",
    titleHighlight: "롤 대리",
    desc: "현재 시즌 기준 챌린저 티어 기사가 목표 티어까지 직접 달성해드립니다. 일부 업체처럼 무작위로 저티어 기사를 배정하는 방식이 아닌, 전담 1:1 기사 배정 시스템을 운영하여 더욱 안전하고 빠른 롤 대리 서비스를 제공합니다.",
    image: "/images/slider/01.webp",
    alt: "롤 대리 서비스를 상징하는 프리미엄 게임 이미지",
    secondary: "롤 대리 가격 확인",
    secondaryHref: "/boosting",
    cardEyebrow: "BOOSTING PLAN",
    cardTitle: "목표 티어까지 전담 관리",
    cardDesc: "계정 상태와 일정에 맞춰 무리 없는 진행 루트를 잡습니다.",
    cardTags: ["1:1 배정", "상황 공유"],
  },
  {
    eyebrow: "PREMIUM DUO",
    title: "프리미엄 롤 듀오",
    titlePrefix: "프리미엄 ",
    titleHighlight: "롤 듀오",
    desc: "현재 시즌 기준 챌린저 티어 기사와 함께 플레이하며 승률 향상은 물론, 라인전 운영과 오브젝트 판단, 실시간 피드백까지 제공합니다. 일부 업체처럼 무작위로 저티어 기사를 배정하는 방식이 아닌, 전담 1:1 기사 배정 시스템으로 더욱 만족도 높은 롤 듀오 서비스를 제공합니다.",
    image: "/images/slider/02.webp",
    alt: "롤 듀오 서비스를 상징하는 프리미엄 게임 이미지",
    secondary: "롤 듀오 가격 확인",
    secondaryHref: "/duo",
    cardEyebrow: "DUO SESSION",
    cardTitle: "같이 뛰면서 바로 피드백",
    cardDesc: "라인전, 합류 타이밍, 오브젝트 판단을 실시간으로 맞춥니다.",
    cardTags: ["실시간 피드백", "승률 케어"],
  },
  {
    eyebrow: "CUSTOM ACCOUNT",
    title: "맞춤형 롤 계정",
    titlePrefix: "맞춤형 ",
    titleHighlight: "롤 계정",
    desc: "일부 업체처럼 준비된 계정만 판매하지 않습니다. 원하는 티어, 서버, 챔피언, 스킨, 명의 여부 등 다양한 조건에 맞춰 검수된 맞춤형 롤 계정을 안전하게 공수해드립니다.",
    image: "/images/slider/03.webp",
    alt: "롤 계정 서비스를 상징하는 프리미엄 게임 이미지",
    secondary: "롤 계정 가격 확인",
    secondaryHref: "/account",
    cardEyebrow: "ACCOUNT MATCH",
    cardTitle: "원하는 조건만 골라 추천",
    cardDesc: "티어, 서버, 챔피언, 스킨 조건을 기준으로 계정을 검수합니다.",
    cardTags: ["조건 검수", "맞춤 추천"],
  },
];

const AUTOPLAY_MS = 5200;
const SWIPE_THRESHOLD = 70;

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // 첫 렌더(SSR)는 애니메이션 없이 즉시 표시 → LCP 렌더 지연 제거.
  // 슬라이드가 한 번이라도 바뀌면 그때부터 텍스트 진입 애니메이션 적용.
  const [animate, setAnimate] = useState(false);
  const pointerStartX = useRef<number | null>(null);

  const slide = slides[index];
  const count = slides.length;
  // 페이지당 h1 1개: 첫 슬라이드(주력 키워드 "롤 대리")만 h1, 나머지는 h2.
  // SSR 초기 렌더가 항상 index 0이라 크롤러는 h1 "프리미엄 롤 대리"를 본다.
  const TitleTag = index === 0 ? ("h1" as const) : ("h2" as const);

  const goTo = (nextIndex: number) => {
    setAnimate(true);
    setIndex((nextIndex + count) % count);
  };

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setAnimate(true);
      setIndex((current) => (current + 1) % count);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [count, paused]);

  const onPointerDown = (event: React.PointerEvent) => {
    pointerStartX.current = event.clientX;
  };

  const onPointerUp = (event: React.PointerEvent) => {
    if (pointerStartX.current === null) return;
    const dx = event.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (dx < -SWIPE_THRESHOLD) next();
    else if (dx > SWIPE_THRESHOLD) prev();
  };

  const progressLabel = `${String(index + 1).padStart(2, "0")} / ${String(
    count,
  ).padStart(2, "0")}`;

  return (
    <section
      className="noise relative h-155 overflow-hidden bg-background sm:h-170 lg:h-[calc(100svh-80px)] lg:min-h-180"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute left-[12%] top-20 h-72 w-72 rounded-full bg-gold/18 blur-[110px] animate-background-float" />
      <div className="absolute bottom-8 right-[10%] h-96 w-96 rounded-full bg-gold-soft/12 blur-[130px] animate-background-float-alt" />

      <div className="relative mx-auto grid h-full max-w-7xl items-center gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:px-8 lg:py-14">
        <div className="relative z-10 flex h-full max-w-3xl flex-col justify-center">
          <div className="flex h-92 flex-col sm:h-100 lg:h-108">
            <div
              key={index}
              className={`flex min-h-0 w-full flex-1 flex-col ${
                animate ? "animate-hero-in" : ""
              }`}
            >
              <div className="flex flex-1 flex-col justify-center py-5">
                {/* 영문 eyebrow 키커 (라인 액센트) */}
                <p className="mb-5 inline-flex w-fit items-center gap-2.5 text-[11px] font-black uppercase tracking-[0.26em] text-gold">
                  <span className="h-px w-7 bg-gold/60" />
                  {slide.eyebrow}
                </p>
                <TitleTag className="text-4xl font-black leading-[1.14] tracking-[-0.03em] text-zinc-50 [text-shadow:0_0_28px_rgba(255,255,255,0.16)] sm:text-5xl lg:text-6xl">
                  {slide.titlePrefix}
                  <span className="relative inline-block">
                    <span className="absolute -inset-x-1 bottom-1 h-[0.24em] rounded-md bg-gold/35 shadow-gold-sm" />
                    <span className="gold-text relative [text-shadow:0_0_30px_rgba(222,176,67,0.38)]">
                      {slide.titleHighlight}
                    </span>
                  </span>
                </TitleTag>
                <p className="mt-6 h-24 max-w-xl text-base font-medium leading-8 text-pretty text-zinc-100/95 [text-shadow:0_0_18px_rgba(222,176,67,0.14)] sm:h-28 sm:text-lg">
                  {slide.desc}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 flex">
            <Link
              href={slide.secondaryHref}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-6 py-3.5 font-bold text-zinc-100 transition hover:border-gold/45 hover:text-white"
            >
              {slide.secondary}
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-5">
            <div className="flex items-center gap-2">
              {slides.map((item, i) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => goTo(i)}
                  className="group flex h-6 items-center px-2"
                  aria-label={`${i + 1}번째 슬라이드 보기`}
                  aria-current={i === index}
                >
                  <span
                    className={`h-2 rounded-full transition-all ${
                      i === index
                        ? "w-9 bg-gold"
                        : "w-2 bg-white/25 group-hover:bg-white/50"
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-black tracking-[0.24em] text-zinc-500">
              {progressLabel}
            </span>
          </div>
        </div>

        <div
          className="absolute inset-0 z-0 mx-auto w-full touch-pan-y lg:relative lg:inset-auto lg:z-auto lg:max-w-150"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <div className="absolute inset-8 hidden rounded-full bg-gold/25 blur-[90px] lg:block" />
          <div className="card-premium contents lg:relative lg:block lg:overflow-hidden lg:rounded-[44px] lg:p-4">
            <div className="absolute inset-0 overflow-hidden bg-black lg:relative lg:inset-auto lg:h-140 lg:rounded-[34px]">
              {/* 뷰포트와 관계없이 단일 priority 이미지 요청만 생성 */}
              <Image
                key={slide.image}
                src={slide.image}
                alt={slide.alt}
                fill
                priority
                fetchPriority="high"
                sizes="(max-width: 1023px) 100vw, 48vw"
                className="object-cover opacity-50 lg:opacity-95"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black via-black/55 to-black/30 lg:from-black/85 lg:via-black/15 lg:to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 hidden rounded-[26px] border border-gold/20 bg-black/58 p-5 backdrop-blur-xl lg:block">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-gold">
                  {slide.cardEyebrow}
                </p>
                <h2 className="mt-2 text-2xl font-black text-white [text-shadow:0_0_22px_rgba(222,176,67,0.28)]">
                  {slide.cardTitle}
                </h2>
                <p className="mt-2 leading-6 text-zinc-300">{slide.cardDesc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {slide.cardTags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-xs font-bold text-gold-soft"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={prev}
        className="absolute left-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-gold/20 bg-black/35 text-white backdrop-blur transition hover:border-gold hover:text-gold cursor-pointer sm:left-8 lg:left-10"
        aria-label="이전 슬라이드"
      >
        <ChevronLeft />
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-gold/20 bg-black/35 text-white backdrop-blur transition hover:border-gold hover:text-gold cursor-pointer sm:right-8 lg:right-10"
        aria-label="다음 슬라이드"
      >
        <ChevronRight />
      </button>
    </section>
  );
}
