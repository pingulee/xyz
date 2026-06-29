"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { navItems, site } from "@/lib/site";

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-gold/10 bg-[#161b22]/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group flex items-center"
          onClick={() => setOpen(false)}
        >
          <div className="relative h-12 w-40 sm:w-44">
            <Image
              src="/images/logo.webp"
              alt="xyz 프리미엄 롤 대리"
              fill
              priority
              sizes="176px"
              className="object-contain object-left"
            />
          </div>
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "relative text-sm font-bold transition",
                  active ? "text-gold" : "text-zinc-300 hover:text-white",
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute -bottom-7 left-0 h-px w-full bg-gold shadow-gold-sm" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/contact"
            className="rounded-full border border-gold/20 px-5 py-3 text-sm font-bold text-zinc-200 transition hover:border-gold/60 hover:text-white"
          >
            문의 페이지
          </Link>
          <a
            href={site.kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-gold-gradient px-6 py-3 text-sm font-black text-black shadow-gold transition hover:-translate-y-0.5"
          >
            빠른 상담
          </a>
        </div>

        <button
          type="button"
          aria-label="메뉴 열기"
          onClick={() => setOpen((v) => !v)}
          className="grid h-11 w-11 place-items-center rounded-2xl border border-gold/20 text-white lg:hidden"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      <div
        className={clsx(
          "overflow-hidden border-gold/10 bg-void/95 transition-all duration-300 lg:hidden",
          open ? "max-h-130 border-t" : "max-h-0",
        )}
      >
        <div className="space-y-2 px-5 py-5">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "block rounded-2xl px-4 py-4 text-base font-bold",
                  active
                    ? "bg-gold/12 text-gold"
                    : "text-zinc-300 hover:bg-white/5",
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <a
            href={site.kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block rounded-2xl bg-gold-gradient px-4 py-4 text-center font-black text-black"
          >
            빠른 상담
          </a>
        </div>
      </div>
    </header>
  );
}
