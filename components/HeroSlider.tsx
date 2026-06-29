"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";

const slides = [
  {
    eyebrow: "boosting service",
    kicker: "Premium League Service",
    title: "프리미엄 롤 대리 서비스",
    desc: "검증된 상위 티어 기사와 체계적인 진행 리포트로 목표 티어까지 안정적으로 관리합니다.",
    image: "/images/hero/boosting.webp",
    alt: "롤 대리 서비스를 상징하는 프리미엄 게임 이미지",
    primary: "상담하기",
    primaryHref: site.kakaoUrl,
    secondary: "가격 보기",
    secondaryHref: "/price/boosting",
  },
  {
    eyebrow: "duo queue",
    kicker: "Verified Duo Partner",
    title: "롤 듀오 서비스",
    desc: "기사와 함께 플레이하며 승률, 라인전 운영, 피드백까지 한 번에 챙기는 듀오 서비스입니다.",
    image: "/images/hero/duo.webp",
    alt: "롤 듀오 서비스를 상징하는 프리미엄 게임 이미지",
    primary: "듀오 상담",
    primaryHref: site.kakaoUrl,
    secondary: "듀오 가격",
    secondaryHref: "/price/duo",
  },
  {
    eyebrow: "account service",
    kicker: "Custom Account Care",
    title: "롤 계정 상담",
    desc: "예산, 티어, 챔피언, 일정 조건에 맞춰 운영 가능한 계정 서비스를 섬세하게 안내합니다.",
    image: "/images/hero/account.webp",
    alt: "롤 계정 서비스를 상징하는 프리미엄 게임 이미지",
    primary: "계정 문의",
    primaryHref: site.kakaoUrl,
    secondary: "서비스 보기",
    secondaryHref: "/price/account",
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
      className="noise relative h-205 overflow-hidden bg-background sm:h-215 lg:h-[calc(100svh-80px)] lg:min-h-180"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="grid-bg absolute inset-0 opacity-70" />
      <div className="absolute left-[12%] top-20 h-72 w-72 rounded-full bg-gold/18 blur-[110px]" />
      <div className="absolute bottom-8 right-[10%] h-96 w-96 rounded-full bg-gold-soft/12 blur-[130px]" />

      <div className="relative mx-auto grid h-full max-w-7xl items-center gap-8 px-5 py-12 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10 lg:px-8 lg:py-14">
        <div className="flex h-full max-w-3xl flex-col justify-center">
          <div className="h-97.5 sm:h-107.5 lg:h-113.75">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.title}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.55, ease: [0.21, 0.47, 0.32, 0.98] }}
              >
                <p className="inline-flex rounded-full border border-gold/25 bg-gold/10 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-gold">
                  {slide.eyebrow}
                </p>
                <p className="mt-8 text-sm font-black uppercase tracking-[0.28em] text-zinc-400">
                  XYZ
                </p>
                <h1 className="mt-3 text-4xl font-black leading-[1.02] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl xl:text-8xl">
                  {slide.kicker}
                  <span className="mt-4 block gold-text">{slide.title}</span>
                </h1>
                <p className="mt-7 max-w-2xl text-lg leading-9 text-zinc-300">
                  {slide.desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href={slide.primaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-gradient px-7 py-4 font-black text-black shadow-gold transition hover:-translate-y-1"
            >
              <MessageCircle size={18} />
              {slide.primary}
            </a>
            <Link
              href={slide.secondaryHref}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/20 bg-white/4 px-7 py-4 font-bold text-white transition hover:border-gold/60"
            >
              {slide.secondary}
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-5">
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
          className="relative mx-auto w-full max-w-150 cursor-grab active:cursor-grabbing"
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
        className="absolute left-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-gold/20 bg-black/35 text-white backdrop-blur transition hover:border-gold hover:text-gold sm:left-8 lg:left-10"
        aria-label="이전 슬라이드"
      >
        <ChevronLeft />
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-gold/20 bg-black/35 text-white backdrop-blur transition hover:border-gold hover:text-gold sm:right-8 lg:right-10"
        aria-label="다음 슬라이드"
      >
        <ChevronRight />
      </button>
    </section>
  );
}
