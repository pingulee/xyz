"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import type { MouseEvent } from "react";
import clsx from "clsx";
import { navItems, services, site } from "@/lib/site";
import BoosterAuthControls from "@/components/lineup/BoosterAuthControls";

type MenuItem = {
  label: string;
  href: string;
  children?: Array<{
    label: string;
    href: string;
  }>;
};

const menuItems: MenuItem[] = navItems.map((item) =>
  item.href === "#price"
    ? {
        ...item,
        children: services.map(({ title, href }) => ({ label: title, href })),
      }
    : item,
);

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mobileOpenItem, setMobileOpenItem] = useState("");

  const handleNavClick = (
    href: string,
    event?: MouseEvent<HTMLAnchorElement>,
  ) => {
    setOpen(false);
    setMobileOpenItem("");
    const currentPath = window.location.pathname;
    const samePath = currentPath === href;
    if (samePath) {
      event?.preventDefault();
      window.location.assign(href);
      return;
    }
    if (
      href !== "/" &&
      currentPath.startsWith(href) &&
      href.split("/").length >= currentPath.split("/").length
    ) {
      router.push(href);
    }
  };

  const isActive = (href: string) => {
    if (href === "#price")
      return ["/boosting", "/duo", "/account"].some((p) =>
        pathname.startsWith(p),
      );
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  };

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-gold/10 bg-void/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="relative block h-12 aspect-20/9"
          onClick={(event) => {
            setOpen(false);
            setMobileOpenItem("");
            if (pathname === "/") {
              event.preventDefault();
              window.location.assign("/");
            }
          }}
        >
          <Image
            src="/images/logo.webp"
            alt="XYZ 롤 대리, 롤 듀오, 롤 계정"
            fill
            priority
            sizes="107px"
            className="object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {menuItems.map((item) => {
            const active = isActive(item.href);

            if (item.children) {
              return (
                <div key={item.href} className="group relative">
                  <button
                    type="button"
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
                  </button>

                  <div className="invisible absolute left-1/2 top-8 w-48 -translate-x-1/2 rounded-2xl border border-gold/10 bg-[#090806]/95 p-2 opacity-0 shadow-2xl backdrop-blur-xl transition-all duration-200 group-hover:visible group-hover:top-10 group-hover:opacity-100">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={(event) => handleNavClick(child.href, event)}
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
                prefetch={false}
                onClick={(event) => handleNavClick(item.href, event)}
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
          <a
            href={site.kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-gold-gradient px-6 py-3 text-sm font-black text-black transition hover:brightness-110"
          >
            빠른 상담
          </a>
          <BoosterAuthControls />
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
          "overflow-y-auto border-gold/10 bg-void/95 transition-all duration-300 lg:hidden",
          open ? "max-h-[calc(100svh-80px)] border-t" : "hidden max-h-0",
        )}
      >
        <div className="space-y-2 px-5 py-5">
          {menuItems.map((item) => (
            <div key={item.href}>
              {item.children ? (
                <button
                  type="button"
                  onClick={() =>
                    setMobileOpenItem((current) =>
                      current === item.href ? "" : item.href,
                    )
                  }
                  className={clsx(
                    "flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left text-base font-bold",
                    isActive(item.href)
                      ? "bg-gold/12 text-gold"
                      : "text-zinc-300 hover:bg-white/5",
                  )}
                  aria-expanded={mobileOpenItem === item.href}
                >
                  {item.label}
                  <ChevronDown
                    size={18}
                    className={clsx(
                      "transition",
                      mobileOpenItem === item.href && "rotate-180",
                    )}
                  />
                </button>
              ) : (
                <Link
                  href={item.href}
                  prefetch={false}
                  onClick={(event) => handleNavClick(item.href, event)}
                  className={clsx(
                    "block rounded-2xl px-4 py-4 text-base font-bold",
                    isActive(item.href)
                      ? "bg-gold/12 text-gold"
                      : "text-zinc-300 hover:bg-white/5",
                  )}
                >
                  {item.label}
                </Link>
              )}

              {item.children && mobileOpenItem === item.href && (
                <div className="ml-4 mt-1 space-y-1 border-l border-gold/10 pl-3">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={(event) => handleNavClick(child.href, event)}
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

          <BoosterAuthControls className="mt-4 block w-full" />
          <a
            href={site.kakaoUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              setOpen(false);
              setMobileOpenItem("");
            }}
            className="mt-4 block rounded-2xl bg-gold-gradient px-4 py-4 text-center font-black text-black"
          >
            빠른 상담
          </a>
        </div>
      </div>
    </header>
  );
}
