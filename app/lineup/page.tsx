import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Clock, Medal, Shield } from "lucide-react";
import Container from "@/components/layout/Container";
import AdminLineupBoard from "@/components/lineup/AdminLineupBoard";
import LineupCard from "@/components/lineup/LineupCard";
import Reveal from "@/components/ui/Reveal";
import SectionTitle from "@/components/ui/SectionTitle";
import { getLineups } from "@/lib/lineups";
import { validateSession, SESSION_COOKIE } from "@/lib/adminSession";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

const description = "xyz의 검증된 상위 티어 롤 기사 라인업 안내 페이지입니다.";

export const metadata: Metadata = {
  title: "기사 라인업",
  description,
  alternates: { canonical: "/lineup" },
  openGraph: {
    title: "기사 라인업 | XYZ",
    description,
    url: "/lineup",
    type: "website",
    siteName: site.name,
    images: [{ url: site.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "기사 라인업 | XYZ",
    description,
    images: [site.ogImage],
  },
};

export default async function LineupPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value ?? "";
  const isAdmin = validateSession(token);

  const lineups = await getLineups(isAdmin ? false : true, !isAdmin);

  if (isAdmin) {
    return (
      <section className="py-20">
        <Container>
          <Reveal>
            <SectionTitle
              eyebrow="lineup"
              title="기사 라인업"
              desc="검증된 상위 티어 기사진이 직접 진행합니다."
              as="h1"
            />
          </Reveal>
          <Reveal>
            <AdminLineupBoard initialLineups={lineups} />
          </Reveal>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="lineup"
            title="기사 라인업"
            desc="검증된 상위 티어 기사진이 직접 진행합니다."
            as="h1"
          />
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {lineups.map((booster, i) => (
            <Reveal key={booster.name} delay={i * 0.04}>
              <LineupCard booster={booster} placement={i + 1} />
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: <Shield size={22} />,
                label: "티어 인증",
                desc: "모든 기사는 현 시즌 티어 인증 후 배정됩니다.",
              },
              {
                icon: <Medal size={22} />,
                label: "전적 검토",
                desc: "최근 솔랭 전적 및 챔피언 숙련도를 검토합니다.",
              },
              {
                icon: <Clock size={22} />,
                label: "시간 배정",
                desc: "요청 일정에 맞는 기사를 우선 배정합니다.",
              },
            ].map(({ icon, label, desc }) => (
              <div
                key={label}
                className="rounded-3xl border border-gold/15 bg-white/3.5 p-6"
              >
                <div className="text-gold">{icon}</div>
                <b className="mt-4 block text-white">{label}</b>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
