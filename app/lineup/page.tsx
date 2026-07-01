import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Clock, Medal, Shield } from "lucide-react";
import Container from "@/components/Container";
import AdminLineupBoard from "@/components/AdminLineupBoard";
import LineupCard from "@/components/LineupCard";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import { getLineups } from "@/lib/lineups";
import { validateSession, SESSION_COOKIE } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "기사 라인업",
  description: "xyz의 검증된 상위 티어 롤 기사 라인업 안내 페이지입니다.",
  alternates: { canonical: "/lineup" },
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
          />
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {lineups.map((knight, i) => (
            <Reveal key={knight.name} delay={i * 0.04}>
              <LineupCard knight={knight} placement={i + 1} />
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
                className="rounded-3xl border border-gold/15 bg-white/[.035] p-6"
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
