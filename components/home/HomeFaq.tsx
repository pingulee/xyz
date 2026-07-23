"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronDown, MessagesSquare } from "lucide-react";
import { useState } from "react";

type HomeFaqItem = {
  question: string;
  answer: string;
};

export type HomeFaqCategory = {
  id: string;
  label: string;
  title: string;
  description: string;
  detailHref: string;
  detailLabel: string;
  items: HomeFaqItem[];
};

export default function HomeFaq({
  categories,
}: {
  categories: HomeFaqCategory[];
}) {
  const [activeId, setActiveId] = useState(categories[0]?.id ?? "");

  return (
    <div className="mx-auto max-w-6xl">
      {/* 카테고리 탭 */}
      <div
        role="tablist"
        aria-label="자주 묻는 질문 카테고리"
        className="grid grid-cols-2 gap-1.5 rounded-3xl border border-white/8 bg-black/30 p-1.5 sm:grid-cols-4"
      >
        {categories.map((category) => {
          const isActive = category.id === activeId;

          return (
            <button
              key={category.id}
              id={`faq-tab-${category.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`faq-panel-${category.id}`}
              onClick={() => setActiveId(category.id)}
              className={`flex items-center justify-center gap-1.5 rounded-[18px] px-4 py-3.5 text-sm font-black transition sm:px-5 ${
                isActive
                  ? "bg-gold-gradient text-black shadow-gold-sm"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {category.label}
              <span
                className={`hidden rounded-full px-1.5 text-[10px] font-black tabular-nums sm:inline ${
                  isActive ? "bg-black/15 text-black/70" : "bg-white/8 text-zinc-500"
                }`}
              >
                {category.items.length}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 sm:mt-8">
        {categories.map((category) => {
          const isActive = category.id === activeId;

          return (
            <section
              key={category.id}
              id={`faq-panel-${category.id}`}
              role="tabpanel"
              aria-labelledby={`faq-tab-${category.id}`}
              hidden={!isActive}
              className="grid items-start gap-4 lg:grid-cols-[0.36fr_0.64fr] lg:gap-6"
            >
              {/* 좌측 소개 카드 */}
              <div className="relative overflow-hidden rounded-4xl border border-gold/15 bg-[linear-gradient(150deg,rgba(222,176,67,0.14),rgba(255,255,255,0.02)_60%)] p-7 sm:p-8 lg:sticky lg:top-24">
                <div
                  aria-hidden="true"
                  className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/10 blur-3xl"
                />
                <div className="relative">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10 text-gold">
                    <MessagesSquare size={22} aria-hidden="true" />
                  </span>
                  <span className="mt-6 inline-flex rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-gold">
                    {category.label}
                  </span>
                  <h3 className="mt-4 text-2xl font-black tracking-tighter text-balance text-white sm:text-3xl">
                    {category.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-pretty text-zinc-400 sm:text-base">
                    {category.description}
                  </p>
                  <Link
                    href={category.detailHref}
                    prefetch={false}
                    className="group mt-7 inline-flex items-center gap-2 text-sm font-black text-gold transition hover:text-gold-soft"
                  >
                    {category.detailLabel}
                    <ArrowUpRight
                      size={16}
                      aria-hidden="true"
                      className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </Link>
                </div>
              </div>

              {/* 우측 아코디언 (네이티브 details — JS 없이 열림, 전문 크롤 가능) */}
              <div className="grid content-start gap-2.5">
                {category.items.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-3xl border border-white/8 bg-white/3.5 transition-colors open:border-gold/30 open:bg-gold/5"
                  >
                    <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4.5 text-left marker:content-none sm:px-6 [&::-webkit-details-marker]:hidden">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold/12 text-xs font-black text-gold transition-colors group-open:bg-gold group-open:text-black">
                        Q
                      </span>
                      <span className="flex-1 font-black leading-6 text-white">
                        {item.question}
                      </span>
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 text-gold transition-transform duration-300 group-open:rotate-180 group-open:border-gold/40">
                        <ChevronDown size={16} aria-hidden="true" />
                      </span>
                    </summary>
                    {/* grid-rows 0fr→1fr 트릭: 순수 CSS 높이 애니메이션 */}
                    <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-open:grid-rows-[1fr]">
                      <div className="overflow-hidden">
                        <div className="flex gap-4 px-5 pb-5 sm:px-6">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/6 text-xs font-black text-zinc-400">
                            A
                          </span>
                          <p className="flex-1 whitespace-pre-line pt-0.5 text-sm leading-7 text-zinc-300">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
