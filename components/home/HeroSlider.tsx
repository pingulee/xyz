"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { levelingPrice, services } from "@/lib/site";

const slides = [
  {
    eyebrow: "PREMIUM BOOSTING",
    title: "목표를 높이고,",
    highlight: "티어를 바꾸다.",
    service: "롤 대리",
    desc: "현재 티어부터 목표 티어까지. 상위 티어 기사와 1:1 전담 배정으로, 나에게 맞는 진행을 시작하세요.",
    image: services[0].image,
    alt: services[0].imageAlt,
    href: "/boosting",
    tags: ["1:1 전담 배정", "진행 상황 공유"],
  },
  {
    eyebrow: "PREMIUM DUO",
    title: "함께 플레이하고,",
    highlight: "달라지는 결과.",
    service: "롤 듀오",
    desc: "혼자보다 함께, 라인전부터 한타까지. 상위 티어 기사와 호흡을 맞추며 실전 피드백을 받아보세요.",
    image: services[1].image,
    alt: services[1].imageAlt,
    href: "/duo",
    tags: ["듀오 플레이", "실시간 피드백"],
  },
  {
    eyebrow: "CUSTOM ACCOUNT",
    title: "나의 취향으로,",
    highlight: "새로운 시작.",
    service: "롤 계정",
    desc: "원하는 티어, 챔피언, 스킨까지. 다양한 조건을 확인하고 나에게 맞는 계정을 상담해보세요.",
    image: services[2].image,
    alt: services[2].imageAlt,
    href: "/account",
    tags: ["조건별 상담", "맞춤 계정 추천"],
  },
  {
    eyebrow: "MANUAL LEVELING",
    title: "처음부터 차근차근,",
    highlight: "30레벨까지.",
    service: "롤 육성",
    desc: `${levelingPrice.fromLevel}레벨부터 ${levelingPrice.toLevel}레벨까지 ${levelingPrice.price.toLocaleString("ko-KR")}원. 매크로·봇 없이 모든 과정을 100% 수동으로 진행합니다.`,
    image: "/images/lol/leveling-uniform.webp",
    alt: "XYZ 롤 육성 · 100% 수동 육성 — 가렌을 활용한 브랜드 배너",
    href: "/leveling",
    tags: ["100% 수동 육성", "매크로·봇 미사용"],
  },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const slide = slides[index];
  const goTo = (next: number) => setIndex((next + slides.length) % slides.length);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: ReturnType<typeof setInterval> | undefined;
    const update = () => {
      clearInterval(timer);
      if (!paused && !interacting && !motion.matches) {
        timer = setInterval(() => setIndex((value) => (value + 1) % slides.length), 6500);
      }
    };
    update();
    motion.addEventListener("change", update);
    return () => {
      clearInterval(timer);
      motion.removeEventListener("change", update);
    };
  }, [paused, interacting]);

  return (
    <section
      aria-label="XYZ 리그 오브 레전드 서비스"
      aria-roledescription="슬라이드 쇼"
      className="relative isolate overflow-hidden border-b border-gold/15 bg-[#0c0b08]"
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocusCapture={() => setInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteracting(false);
      }}
    >
      <div
        className="relative mx-5 mt-6 aspect-3/2 touch-pan-y overflow-hidden rounded-2xl border border-gold/20 shadow-[0_20px_80px_rgba(0,0,0,0.4)] sm:mx-8 lg:absolute lg:right-8 lg:top-1/2 lg:mx-0 lg:mt-0 lg:w-[56%] lg:-translate-y-1/2 2xl:right-[calc((100%-1280px)/2)] 2xl:w-[740px]"
        onPointerDown={(event) => { pointerStart.current = { x: event.clientX, y: event.clientY }; }}
        onPointerCancel={() => { pointerStart.current = null; }}
        onPointerUp={(event) => {
          const start = pointerStart.current;
          pointerStart.current = null;
          if (!start) return;
          const dx = event.clientX - start.x;
          if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(event.clientY - start.y)) goTo(index + (dx < 0 ? 1 : -1));
        }}
      >
        <Image
          key={slide.image}
          src={slide.image}
          alt={slide.alt}
          fill
          priority={index === 0}
          sizes="(min-width: 1536px) 740px, (min-width: 1024px) 56vw, calc(100vw - 40px)"
          className="object-contain"
        />

      </div>

      <div className="relative mx-auto max-w-7xl px-5 pb-7 sm:px-8 lg:flex lg:min-h-[700px] lg:flex-col lg:justify-end lg:pb-10 lg:pt-24 xl:min-h-[760px]">
        <div className="relative mt-7 max-w-xl pb-10 lg:mt-0 lg:max-w-[40%] lg:pb-20">
          <p className="mb-5 flex items-center gap-3 text-[10px] font-bold tracking-[0.25em] text-gold sm:text-xs">
            <span className="h-px w-9 bg-gold/65" /> {slide.eyebrow}
          </p>
          <h1 className="text-[clamp(1.8rem,3.3vw,3.35rem)] font-black leading-[1.22] tracking-[-0.055em] text-white">
            <span className="mb-3 block text-sm font-semibold tracking-[0.08em] text-zinc-300">XYZ {slide.service}</span>
            <span className="block whitespace-nowrap">{slide.title}</span>
            <span className="gold-text block whitespace-nowrap">{slide.highlight}</span>
          </h1>
          <p className="mt-5 min-h-24 max-w-md text-sm leading-7 text-zinc-300 sm:text-base sm:leading-8">{slide.desc}</p>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
            {slide.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-2 text-xs text-zinc-400"><span className="h-1 w-1 rotate-45 bg-gold/70" />{tag}</span>
            ))}
          </div>
          <Link href={slide.href} className="mt-8 inline-flex min-h-12 items-center gap-8 rounded-full bg-gold-gradient px-7 py-3.5 text-sm font-black text-black transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">
            {slide.service} 가격 보기 <ArrowRight size={18} />
          </Link>
        </div>

        <div className="relative flex items-end justify-between gap-4 border-t border-white/15 pt-5">
          <div className="flex flex-wrap items-center gap-4 sm:gap-8">
            <div className="grid grid-cols-4 gap-1" aria-label="서비스 선택">
              {slides.map((item, i) => (
                <button key={item.service} type="button" onClick={() => goTo(i)} aria-label={`${i + 1}번째 슬라이드 보기: ${item.service}`} aria-current={index === i ? "true" : undefined} className={`flex min-h-11 items-center gap-1.5 whitespace-nowrap border-b px-1.5 text-xs transition sm:px-3 ${index === i ? "border-gold text-gold" : "border-transparent text-zinc-500 hover:text-white"}`}>
                  <span className="text-[10px] tabular-nums">0{i + 1}</span><span className="font-bold">{item.service}</span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => goTo(index - 1)} aria-label="이전 슬라이드" className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-zinc-300 hover:border-gold hover:text-gold"><ChevronLeft size={16} /></button>
              <button type="button" onClick={() => setPaused(!paused)} aria-label={paused ? "슬라이드 자동 재생" : "슬라이드 일시 정지"} aria-pressed={paused} className="grid h-9 w-9 place-items-center rounded-full text-zinc-300 hover:text-gold">{paused ? <Play size={13} /> : <Pause size={13} />}</button>
              <button type="button" onClick={() => goTo(index + 1)} aria-label="다음 슬라이드" className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-zinc-300 hover:border-gold hover:text-gold"><ChevronRight size={16} /></button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
