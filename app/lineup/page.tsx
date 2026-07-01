import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Clock, Medal, Shield, Star } from "lucide-react";
import Container from "@/components/Container";
import AdminLineupBoard from "@/components/AdminLineupBoard";
import KnightAvatar from "@/components/KnightAvatar";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import { getLineups, getLineupPath } from "@/lib/lineups";
import { validateSession, SESSION_COOKIE } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "기사 라인업",
  description: "xyz의 검증된 상위 티어 롤 기사 라인업 안내 페이지입니다.",
  alternates: { canonical: "/lineup" },
};

const positionColors: Record<string, string> = {
  정글: "bg-emerald-500/15 text-emerald-400",
  미드: "bg-blue-500/15 text-blue-400",
  바텀: "bg-purple-500/15 text-purple-400",
  서포터: "bg-pink-500/15 text-pink-400",
  서폿: "bg-pink-500/15 text-pink-400",
  탑: "bg-orange-500/15 text-orange-400",
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
              eyebrow="admin"
              title="기사 라인업 관리"
              desc="관리자 모드 — 추가, 수정, 삭제가 가능합니다."
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
              <Link href={getLineupPath(knight)} className="block">
                <article className="card-premium overflow-hidden rounded-[28px] transition-transform duration-200 hover:-translate-y-1">
                  <div className="flex gap-4 p-5">
                    <KnightAvatar
                      availability={knight}
                      image={knight.image}
                      name={knight.name}
                      size={80}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {knight.positions.map((pos) => (
                          <span
                            key={pos}
                            className={`rounded-full px-2.5 py-0.5 text-xs font-black ${positionColors[pos] ?? "bg-gold/10 text-gold"}`}
                          >
                            {pos}
                          </span>
                        ))}
                        <div className="flex items-center gap-1">
                          <Image
                            src={knight.tier}
                            alt={knight.rank}
                            width={18}
                            height={18}
                            className="rounded-full bg-zinc-800"
                          />
                          <span className="text-xs font-black text-gold">
                            {knight.rank}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1.5 font-black text-white">
                        {knight.name}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-sm text-zinc-400">
                        <Star size={14} className="fill-gold text-gold" />
                        <span>
                          {knight.averageRating
                            ? knight.averageRating.toFixed(1)
                            : "0.0"}
                        </span>
                        <span className="text-zinc-500">
                          ({knight.reviewCount ?? 0}개 리뷰)
                        </span>
                      </div>
                      <div className="mt-1 grid gap-0.5 text-xs text-zinc-500">
                        <div className="flex items-center gap-1.5">
                          <Clock size={10} />
                          <span>평일 {knight.weekdayHours}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={10} />
                          <span>주말 {knight.weekendHours}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/6 px-5 pb-5 pt-4">
                    <p className="text-sm leading-6 text-zinc-400">
                      {knight.description}
                    </p>

                    <div className="mt-4 grid gap-2.5">
                      {knight.champions && knight.champions.length > 0 && (
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5 w-12 shrink-0 text-xs font-black text-zinc-500">
                            챔피언
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {knight.champions.map((c) => (
                              <span
                                key={c}
                                className="rounded-full border border-white/8 bg-white/4 px-2.5 py-0.5 text-xs font-bold text-zinc-300"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 w-12 shrink-0 text-xs font-black text-zinc-500">
                          작업
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {knight.services.map((s) => (
                            <span
                              key={s}
                              className="rounded-full border border-white/8 bg-white/4 px-2.5 py-0.5 text-xs font-bold text-zinc-300"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
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
