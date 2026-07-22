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
    <div className="mx-auto max-w-6xl">
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
              className={`rounded-[18px] px-4 py-3.5 text-sm font-black transition sm:px-5 ${
                isActive
                  ? "bg-gold text-black shadow-gold-sm"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {category.label}
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
              className="grid items-start gap-4 lg:grid-cols-[0.34fr_0.66fr] lg:gap-5"
            >
              <div className="relative overflow-hidden rounded-4xl border border-gold/15 bg-[linear-gradient(145deg,rgba(222,176,67,0.12),rgba(255,255,255,0.025)_58%)] p-7 sm:p-8 lg:sticky lg:top-24">
                <div
                  aria-hidden="true"
                  className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/10 blur-3xl"
                />
                <div className="relative">
                  <span className="inline-flex rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-gold">
                    {category.label}
                  </span>
                  <h3 className="mt-6 text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">
                    {category.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
                    {category.description}
                  </p>
                  <Link
                    href={category.detailHref}
                    prefetch={false}
                    className="mt-7 inline-flex items-center gap-2 text-sm font-black text-gold transition hover:text-gold-soft"
                  >
                    {category.detailLabel}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </div>

              <div className="grid content-start gap-3">
                {category.items.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-3xl border border-white/8 bg-white/3.5 open:border-gold/25 open:bg-gold/5"
                  >
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-5 py-5 text-left font-black leading-6 text-white marker:content-none sm:px-6 [&::-webkit-details-marker]:hidden">
                      <span className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-0.5 text-gold/70"
                        >
                          Q.
                        </span>
                        {item.question}
                      </span>
                      <ChevronDown
                        size={18}
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-gold transition-transform duration-200 group-open:rotate-180"
                      />
                    </summary>
                    <div className="border-t border-white/7 px-5 py-5 sm:px-6">
                      <p className="whitespace-pre-line text-sm leading-7 text-zinc-400">
                        {item.answer}
                      </p>
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
