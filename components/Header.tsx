"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { navItems, services, site } from "@/lib/site";

const menuItems = navItems.map((item) =>
  item.href === "/price"
    ? {
        ...item,
        children: services.map(({ title, href }) => ({ label: title, href })),
      }
    : item,
);

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-gold/10 bg-void/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="relative h-12 w-40 sm:w-44"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/images/logo.webp"
            alt="XYZ 프리미엄 롤 서비스"
            fill
            priority
            sizes="176px"
            className="object-contain object-left"
          />
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {menuItems.map((item) => {
            const active = isActive(item.href);

            if (item.children) {
              return (
                <div key={item.href} className="group relative">
                  <Link
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-1 text-sm font-bold transition",
                      active ? "text-gold" : "text-zinc-300 hover:text-white",
                    )}
                  >
                    {item.label}
                    <ChevronDown
                      size={15}
                      className="transition group-hover:rotate-180"
                    />
                  </Link>

                  <div className="invisible absolute left-1/2 top-8 w-48 -translate-x-1/2 rounded-2xl border border-gold/10 bg-[#090806]/95 p-2 opacity-0 shadow-2xl backdrop-blur-xl transition-all duration-200 group-hover:visible group-hover:top-10 group-hover:opacity-100">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={clsx(
                          "block rounded-xl px-4 py-3 text-sm font-bold transition",
                          pathname === child.href
                            ? "bg-gold/12 text-gold"
                            : "text-zinc-300 hover:bg-white/5 hover:text-white",
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>

                  {active && (
                    <span className="absolute -bottom-7 left-0 h-px w-full bg-gold shadow-gold-sm" />
                  )}
                </div>
              );
            }

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
          {menuItems.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "block rounded-2xl px-4 py-4 text-base font-bold",
                  isActive(item.href)
                    ? "bg-gold/12 text-gold"
                    : "text-zinc-300 hover:bg-white/5",
                )}
              >
                {item.label}
              </Link>

              {item.children && (
                <div className="ml-4 mt-1 space-y-1 border-l border-gold/10 pl-3">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={() => setOpen(false)}
                      className={clsx(
                        "block rounded-xl px-4 py-3 text-sm font-bold",
                        pathname === child.href
                          ? "bg-gold/12 text-gold"
                          : "text-zinc-400 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

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
