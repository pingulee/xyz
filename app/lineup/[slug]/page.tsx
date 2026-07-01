import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Clock, Star } from "lucide-react";
import Container from "@/components/Container";
import KnightAvatar from "@/components/KnightAvatar";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import LineupReviews from "@/components/LineupReviews";
import { getLineupBySlug, getLineupReviewStats, getLineupWinStats } from "@/lib/lineups";
import { getReviewsByLineupId } from "@/lib/reviews";
import { KNIGHT_SESSION_COOKIE, validateKnightSession } from "@/lib/knightSession";

export const dynamic = "force-dynamic";

const tierIconByName: Record<string, string> = {
  아이언: "/images/tier/1-iron.png",
  브론즈: "/images/tier/2-bronze.png",
  실버: "/images/tier/3-silver.png",
  골드: "/images/tier/4-gold.png",
  플래티넘: "/images/tier/5-platinum.png",
  에메랄드: "/images/tier/6-emerald.png",
  다이아몬드: "/images/tier/7-diamond.png",
  마스터: "/images/tier/8-master.png",
  그랜드마스터: "/images/tier/9-grandmaster.png",
  챌린저: "/images/tier/10-challenger.png",
};

function nationalityFlag(code: number) {
  return code === 2 ? "/images/flags/cn.svg" : "/images/flags/kr.svg";
}

function nationalityLabel(code: number) {
  return code === 2 ? "중국" : "대한민국";
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const lineup = await getLineupBySlug(slug);

  if (!lineup) {
    return { title: "기사 정보를 찾을 수 없습니다" };
  }

  return {
    title: `${lineup.name} | 기사 라인업`,
    description: lineup.description,
    alternates: { canonical: `/lineup/${slug}` },
  };
}

export default async function LineupDetailPage({ params }: Props) {
  const { slug } = await params;
  const lineup = await getLineupBySlug(slug);

  if (!lineup) {
    notFound();
  }

  const cookieStore = await cookies();
  const knightToken = cookieStore.get(KNIGHT_SESSION_COOKIE)?.value ?? "";
  const knightLineupId = validateKnightSession(knightToken);

  const [stats, reviews, winStats] = await Promise.all([
    getLineupReviewStats(Number(lineup.id)),
    getReviewsByLineupId(Number(lineup.id)),
    getLineupWinStats(Number(lineup.id)),
  ]);

  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <div className="mb-8 flex items-center gap-3 text-sm text-zinc-500">
            <Link href="/lineup" className="transition hover:text-gold">
              기사 라인업
            </Link>
            <span>/</span>
            <span className="text-zinc-300">{lineup.name}</span>
          </div>
        </Reveal>

        <Reveal>
          <SectionTitle
            eyebrow="lineup"
            title={lineup.name}
            desc={lineup.description}
          />
        </Reveal>

        <Reveal>
          <div className="card-premium overflow-hidden rounded-4xl p-6 md:p-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
              <div className="mx-auto shrink-0 lg:mx-0">
                <KnightAvatar
                  availability={lineup}
                  image={lineup.image}
                  name={lineup.name}
                  priority
                  size={260}
                />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Image
                      src={lineup.tier}
                      alt={lineup.rank}
                      width={18}
                      height={18}
                      className="rounded-full bg-zinc-800"
                    />
                    <span className="text-xs font-black text-gold">
                      {lineup.rank}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-2xl font-black text-white">
                  <span>{lineup.name}</span>
                  <Image
                    src={nationalityFlag(lineup.nationality)}
                    alt={nationalityLabel(lineup.nationality)}
                    title={nationalityLabel(lineup.nationality)}
                    width={30}
                    height={20}
                    className="rounded-[3px] border border-white/10 object-cover"
                  />
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex items-center gap-2 text-sm font-black text-gold">
                      <Clock size={16} />
                      평일 작업 가능 시간
                    </div>
                    <p className="mt-2 text-sm text-zinc-300">{lineup.weekdayHours}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                    <div className="flex items-center gap-2 text-sm font-black text-gold">
                      <Clock size={16} />
                      주말 작업 가능 시간
                    </div>
                    <p className="mt-2 text-sm text-zinc-300">{lineup.weekendHours}</p>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl border border-gold/15 bg-white/4 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-black text-zinc-500">평균 평점</div>
                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-4xl font-black text-white">
                          {stats.averageRating.toFixed(1)}
                        </span>
                        <div className="flex items-center gap-1 pb-1 text-gold">
                          <Star size={16} fill="currentColor" />
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-zinc-500">전체 후기</div>
                      <div className="mt-2 text-3xl font-black text-white">
                        {stats.reviewCount}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="text-sm font-black text-zinc-500">평점 분포</div>
                    <div className="mt-4 space-y-3">
                      {[5, 4, 3, 2, 1].map((value) => {
                        const count = stats.ratingDistribution[value as keyof typeof stats.ratingDistribution];
                        const percentage = stats.reviewCount > 0 ? (count / stats.reviewCount) * 100 : 0;
                        return (
                          <div key={value} className="flex items-center gap-3">
                            <span className="w-8 text-sm font-bold text-zinc-400">{value}★</span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
                              <div className="h-full rounded-full bg-gold" style={{ width: `${percentage}%` }} />
                            </div>
                            <span className="w-10 text-right text-sm font-semibold text-zinc-400">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {(winStats.total.wins > 0 || winStats.total.losses > 0) && (
                  <div className="mt-6 rounded-3xl border border-gold/15 bg-white/4 p-5">
                    <div className="text-sm font-black text-zinc-500 mb-4">작업 기록</div>
                    <div className="flex items-center gap-4 mb-4">
                      <div>
                        <div className="text-xs text-zinc-500 mb-1">전체 승률</div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-black text-white">
                            {winStats.total.wins + winStats.total.losses > 0
                              ? Math.round((winStats.total.wins / (winStats.total.wins + winStats.total.losses)) * 100)
                              : 0}%
                          </span>
                          <span className="text-sm text-zinc-500">
                            {winStats.total.wins}승 {winStats.total.losses}패
                          </span>
                        </div>
                      </div>
                    </div>
                    {winStats.byTier.length > 0 && (
                      <div className="grid gap-2">
                        {winStats.byTier.map((t) => {
                          const total = t.wins + t.losses;
                          const pct = total > 0 ? Math.round((t.wins / total) * 100) : 0;
                          return (
                            <div key={t.tier} className="flex items-center gap-3">
                              <span className="flex w-28 shrink-0 items-center gap-2 text-xs font-black text-zinc-400">
                                {tierIconByName[t.tier] && (
                                  <Image
                                    src={tierIconByName[t.tier]}
                                    alt={t.tier}
                                    width={24}
                                    height={24}
                                    className="rounded-full bg-zinc-900"
                                  />
                                )}
                                {t.tier}
                              </span>
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
                                <div className="h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="w-24 shrink-0 text-right text-xs text-zinc-400">
                                {t.wins}승 {t.losses}패
                                <span className="ml-1.5 font-black text-white">{pct}%</span>
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <div className="text-sm font-black text-zinc-500">라인</div>
                    <div className="mt-3 flex min-h-8 flex-wrap items-center gap-2">
                      {lineup.positions.map((position) => (
                        <span
                          key={position}
                          className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-sm font-semibold text-zinc-300"
                        >
                          {position}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-black text-zinc-500">대표 챔피언</div>
                    <div className="mt-3 flex min-h-8 flex-wrap items-center gap-2">
                      {lineup.champions.map((champion) => (
                        <span
                          key={champion}
                          className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-sm font-semibold text-zinc-300"
                        >
                          {champion}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-black text-zinc-500">진행 서비스</div>
                    <div className="mt-3 flex min-h-8 flex-wrap items-center gap-2">
                      {lineup.services.map((service) => (
                        <span
                          key={service}
                          className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-sm font-semibold text-zinc-300"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-12">
            <h2 className="mb-6 text-xl font-black text-white">
              후기 <span className="text-gold">{reviews.length}</span>개
            </h2>
            <LineupReviews
              reviews={reviews}
              knightLineupId={knightLineupId}
              knightName={lineup.name}
              knightImage={lineup.image ?? ""}
              knightAvailability={lineup}
            />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
