"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const slides = [
  {
    eyebrow: "PREMIUM BOOSTING",
    title: "프리미엄 롤 대리",
    titlePrefix: "프리미엄 ",
    titleHighlight: "롤 대리",
    desc: "현재 시즌 기준 챌린저 티어 기사가 목표 티어까지 직접 달성해드립니다. 일부 업체처럼 무작위로 저티어 기사를 배정하는 방식이 아닌, 전담 1:1 기사 배정 시스템을 운영하여 더욱 안전하고 빠른 롤 대리 서비스를 제공합니다.",
    image: "/images/hero/boosting.webp",
    alt: "롤 대리 서비스를 상징하는 프리미엄 게임 이미지",
    secondary: "가격 보기",
    secondaryHref: "/boosting",
  },
  {
    eyebrow: "PREMIUM DUO",
    title: "프리미엄 롤 듀오",
    titlePrefix: "프리미엄 ",
    titleHighlight: "롤 듀오",
    desc: "현재 시즌 기준 챌린저 티어 기사와 함께 플레이하며 승률 향상은 물론, 라인전 운영과 오브젝트 판단, 실시간 피드백까지 제공합니다. 일부 업체처럼 무작위로 저티어 기사를 배정하는 방식이 아닌, 전담 1:1 기사 배정 시스템으로 더욱 만족도 높은 롤 듀오 서비스를 제공합니다.",
    image: "/images/hero/duo.webp",
    alt: "롤 듀오 서비스를 상징하는 프리미엄 게임 이미지",
    secondary: "듀오 가격",
    secondaryHref: "/duo",
  },
  {
    eyebrow: "CUSTOM ACCOUNT",
    title: "맞춤형 롤 계정",
    titlePrefix: "맞춤형 ",
    titleHighlight: "롤 계정",
    desc: "일부 업체처럼 준비된 계정만 판매하지 않습니다. 원하는 티어, 서버, 챔피언, 스킨, 명의 여부 등 다양한 조건에 맞춰 검수된 맞춤형 롤 계정을 안전하게 공수해드립니다.",
    image: "/images/hero/account.webp",
    alt: "롤 계정 서비스를 상징하는 프리미엄 게임 이미지",
    secondary: "서비스 보기",
    secondaryHref: "/account",
  },
];

const AUTOPLAY_MS = 5200;

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const slide = slides[index];
  const count = slides.length;

  const goTo = (nextIndex: number) => {
    setIndex((nextIndex + count) % count);
  };

  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [count, paused]);

  const progressLabel = `${String(index + 1).padStart(2, "0")} / ${String(
    count,
  ).padStart(2, "0")}`;

  return (
    <section
      className="noise relative h-155 overflow-hidden bg-background sm:h-170 lg:h-[calc(100svh-80px)] lg:min-h-180"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute inset-0 animate-gradient-wave opacity-40 pointer-events-none" />
      <div className="absolute inset-0 bg-black/30" />
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.image}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-0 lg:hidden"
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            priority={index === 0}
            fetchPriority={index === 0 ? "high" : "auto"}
            sizes="100vw"
            className="object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black via-black/55 to-black/30" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute left-[12%] top-20 h-72 w-72 rounded-full bg-gold/18 blur-[110px] animate-background-float" />
      <div className="absolute bottom-8 right-[10%] h-96 w-96 rounded-full bg-gold-soft/12 blur-[130px] animate-background-float-alt" />

      <div className="relative mx-auto grid h-full max-w-7xl items-center gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:px-8 lg:py-14">
        <div className="flex h-full max-w-3xl flex-col justify-center">
          <div className="h-92 sm:h-100 lg:h-108">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.title}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
                className="flex h-full w-full flex-col"
              >
                <div className="flex flex-1 flex-col justify-center py-7">
                  <p className="inline-flex w-fit rounded-full border border-gold/20 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-gold-soft/90">
                    {slide.eyebrow}
                  </p>
                  <h1 className="mt-6 text-3xl font-bold leading-[1.16] text-zinc-50 sm:text-5xl lg:text-6xl">
                    {slide.titlePrefix}
                    <span className="text-gold-soft">
                      {slide.titleHighlight}
                    </span>
                  </h1>
                  <p className="mt-6 h-24 max-w-xl text-base leading-8 text-zinc-300/90 sm:h-28 sm:text-lg">
                    {slide.desc}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
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
                  className={`h-2 rounded-full transition-all ${
                    i === index
                      ? "w-9 bg-gold"
                      : "w-2 bg-white/25 hover:bg-white/50"
                  }`}
                  aria-label={`${i + 1}번째 슬라이드 보기`}
                />
              ))}
            </div>
            <span className="text-xs font-black tracking-[0.24em] text-zinc-500">
              {progressLabel}
            </span>
          </div>
        </div>

        <motion.div
          className="relative mx-auto hidden w-full max-w-150 cursor-grab active:cursor-grabbing lg:block"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={(_, info) => {
            if (info.offset.x < -70) next();
            if (info.offset.x > 70) prev();
          }}
        >
          <div className="absolute inset-8 rounded-full bg-gold/25 blur-[90px]" />
          <div className="card-premium relative overflow-hidden rounded-[36px] p-3 sm:rounded-[44px] sm:p-4">
            <div className="relative h-90 overflow-hidden rounded-[28px] bg-black sm:h-107.5 sm:rounded-[34px] lg:h-140">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.image}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    priority={index === 0}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    sizes="(max-width: 1024px) 100vw, 48vw"
                    className="object-cover opacity-95"
                  />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/15 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 rounded-[26px] border border-gold/20 bg-black/58 p-5 backdrop-blur-xl">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-gold">
                  verified service
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  {slide.title}
                </h2>
              </div>
            </div>
          </div>
        </motion.div>
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
