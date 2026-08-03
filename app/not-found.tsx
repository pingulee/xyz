import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/layout/Container";
import { navItems, services } from "@/lib/site";

/**
 * 404 페이지. Next 기본 404는 링크가 없어 크롤러와 사용자가 모두 막다른 길에
 * 갇힌다. 주요 경로를 노출해 빠져나갈 길을 준다.
 * 상태 코드는 Next가 404로 내려주므로 색인되지 않지만, noindex를 명시해 둔다.
 */
export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다",
  description:
    "요청하신 페이지가 없거나 주소가 변경되었습니다. 롤 대리·롤 듀오·롤 계정 서비스와 작업 후기는 아래에서 확인하세요.",
  robots: { index: false, follow: true },
};

const links = [
  ...services.map((service) => ({
    href: service.href,
    label: service.title,
  })),
  ...navItems.filter((item) => !item.href.startsWith("#")),
];

export default function NotFound() {
  return (
    <section className="py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-gold">
            404
          </p>
          <h1 className="mt-4 text-3xl font-black tracking-tighter text-white sm:text-4xl">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="mt-4 leading-8 text-zinc-400">
            요청하신 주소가 없거나 변경되었습니다. 아래에서 원하는 페이지로
            이동하세요.
          </p>

          <nav
            aria-label="주요 페이지"
            className="mt-10 flex flex-wrap justify-center gap-2.5"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-white/12 px-5 py-2.5 text-sm font-bold text-zinc-300 transition hover:border-gold/40 hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </section>
  );
}
