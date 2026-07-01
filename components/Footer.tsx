import Link from "next/link";
import Image from "next/image";
import { MessageCircle, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import Container from "@/components/Container";
import { navItems, services, site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-gold/10 bg-black">
      <Container className="grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="group">
            <div className="relative h-14 w-48">
              <Image
                src="/images/logo.webp"
                alt="XYZ 롤 대리, 롤 듀오, 롤 계정"
                fill
                sizes="192px"
                className="object-contain object-left transition duration-300 group-hover:scale-105"
              />
            </div>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-7 text-zinc-400">
            검증된 기사, 체계적인 관리, 빠른 상담을 중심으로 운영하는 프리미엄
            리그 오브 레전드 서비스입니다.
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {[ShieldCheck, Trophy, Sparkles].map((Icon, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 rounded-full border border-gold/15 bg-white/3 px-4 py-2 text-xs font-bold text-zinc-300"
              >
                <Icon size={15} className="text-gold" />
                {i === 0
                  ? "안전 진행"
                  : i === 1
                    ? "상위 기사"
                    : "프리미엄 관리"}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-black text-white">메뉴</h3>
          <ul className="mt-5 space-y-3 text-sm text-zinc-400">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link className="hover:text-gold" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-black text-white">서비스</h3>
          <ul className="mt-5 space-y-3 text-sm text-zinc-400">
            {services.map((service) => (
              <li key={service.href}>
                <Link className="hover:text-gold" href={service.href}>
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-black text-white">문의</h3>
          <p className="mt-5 text-sm leading-7 text-zinc-400">
            현재 티어, 목표 티어, 원하는 서비스를 알려주시면 빠르게
            안내해드립니다.
          </p>
          <div className="mt-5">
            <a
              href={site.kakaoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-700"
            >
              <MessageCircle size={17} />
              카카오톡 상담
            </a>
          </div>
        </div>
      </Container>
      <div className="border-t border-gold/10 py-6 text-center text-xs text-zinc-400">
        © 2025 XYZ. All rights reserved.
      </div>
    </footer>
  );
}
