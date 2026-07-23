"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";
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
    <div className="w-full">
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
              className={`flex items-center justify-center gap-1.5 rounded-[18px] px-4 py-3 text-sm font-black transition ${
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

      {categories.map((category) => {
        const isActive = category.id === activeId;

        return (
          <section
            key={category.id}
            id={`faq-panel-${category.id}`}
            role="tabpanel"
            aria-labelledby={`faq-tab-${category.id}`}
            hidden={!isActive}
            className="mt-8 sm:mt-10"
          >
            {/* 카테고리 소개 헤더 (제목·설명 좌 / 상세 링크 우 — 키워드·내부링크 SEO 유지) */}
            <div className="mx-auto flex max-w-3xl flex-col gap-4 border-l-2 border-gold/40 pl-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-lg font-black tracking-tighter text-white sm:text-xl">
                  {category.title}
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-pretty text-zinc-400">
                  {category.description}
                </p>
              </div>
              <Link
                href={category.detailHref}
                prefetch={false}
                className="group inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-black text-gold transition hover:text-gold-soft"
              >
                {category.detailLabel}
                <ArrowUpRight
                  size={15}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>

            {/* 아코디언 (네이티브 details — JS 없이 열림, 전문 크롤 가능) */}
            <div className="mx-auto mt-6 grid max-w-3xl gap-2">
              {category.items.map((item) => (
                <details
                  key={item.question}
                  className="group rounded-2xl border border-white/8 bg-white/3.5 transition-colors open:border-gold/30 open:bg-gold/5"
                >
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 text-left marker:content-none sm:px-5 [&::-webkit-details-marker]:hidden">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold/12 text-xs font-black text-gold transition-colors group-open:bg-gold group-open:text-black">
                      Q
                    </span>
                    <span className="flex-1 text-sm font-bold leading-6 text-white sm:text-[15px]">
                      {item.question}
                    </span>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-white/10 text-gold transition-transform duration-300 group-open:rotate-180 group-open:border-gold/40">
                      <ChevronDown size={16} aria-hidden="true" />
                    </span>
                  </summary>
                  {/* grid-rows 0fr→1fr 트릭: 순수 CSS 높이 애니메이션 */}
                  <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-open:grid-rows-[1fr]">
                    <div className="overflow-hidden">
                      <div className="flex gap-3 px-4 pb-4 sm:px-5">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/6 text-xs font-black text-zinc-400">
                          A
                        </span>
                        <p className="flex-1 whitespace-pre-line text-[13px] leading-7 text-zinc-300 sm:text-sm">
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
  );
}
