import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Clock, MessageCircle, Star, Swords } from "lucide-react";
import Container from "@/components/Container";
import KnightAvatar from "@/components/KnightAvatar";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import LineupReviews from "@/components/LineupReviews";
import WinStatsCard from "@/components/WinStatsCard";
import { getLineupBySlug, getLineupReviewStats, getLineupWinStats } from "@/lib/lineups";
import { getReviewsByLineupId } from "@/lib/reviews";
import { KNIGHT_SESSION_COOKIE, validateKnightSession } from "@/lib/knightSession";

export const dynamic = "force-dynamic";

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

  const totalGames = winStats.total.wins + winStats.total.losses;
  const hasWinRecords = totalGames > 0;
  const totalWinRate = hasWinRecords
    ? Math.round((winStats.total.wins / totalGames) * 100)
    : 0;

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
          <div className="card-premium relative overflow-hidden rounded-4xl p-6 md:p-8">
            <div
              className="pointer-events-none absolute -top-40 right-0 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
              aria-hidden
            />
            <div className="relative flex flex-col gap-8 md:flex-row md:items-start">
              <div className="mx-auto shrink-0 md:mx-0">
                <KnightAvatar
                  availability={lineup}
                  image={lineup.image}
                  name={lineup.name}
                  priority
                  size={220}
                />
              </div>

              <div className="min-w-0 flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/8 px-3 py-1.5">
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

                <div className="mt-3 flex items-center justify-center gap-2.5 md:justify-start">
                  <span className="text-3xl font-black text-white">
                    {lineup.name}
                  </span>
                  <Image
                    src={nationalityFlag(lineup.nationality)}
                    alt={nationalityLabel(lineup.nationality)}
                    title={nationalityLabel(lineup.nationality)}
                    width={30}
                    height={20}
                    className="rounded-[3px] border border-white/10 object-cover"
                  />
                </div>

                <div className="mt-5 flex flex-wrap justify-center gap-2.5 md:justify-start">
                  <div className="flex items-center gap-2.5 rounded-2xl border border-white/8 bg-white/4 px-4 py-2.5">
                    <Star size={16} className="fill-gold text-gold" />
                    <div className="text-left">
                      <div className="text-[11px] font-bold text-zinc-500">평균 평점</div>
                      <div className="text-sm font-black text-white">
                        {stats.averageRating.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 rounded-2xl border border-white/8 bg-white/4 px-4 py-2.5">
                    <MessageCircle size={16} className="text-gold" />
                    <div className="text-left">
                      <div className="text-[11px] font-bold text-zinc-500">전체 후기</div>
                      <div className="text-sm font-black text-white">
                        {stats.reviewCount}개
                      </div>
                    </div>
                  </div>
                  {hasWinRecords && (
                    <div className="flex items-center gap-2.5 rounded-2xl border border-white/8 bg-white/4 px-4 py-2.5">
                      <Swords size={16} className="text-gold" />
                      <div className="text-left">
                        <div className="text-[11px] font-bold text-zinc-500">전체 승률</div>
                        <div className="text-sm font-black text-white">
                          {totalWinRate}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 grid gap-5 border-t border-white/6 pt-6 text-left md:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-black text-zinc-500">
                      <Clock size={12} />
                      평일 작업 가능 시간
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-zinc-300">
                      {lineup.weekdayHours}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-black text-zinc-500">
                      <Clock size={12} />
                      주말 작업 가능 시간
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-zinc-300">
                      {lineup.weekendHours}
                    </p>
                  </div>
                  <div>
                    <div className="text-xs font-black text-zinc-500">라인</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {lineup.positions.map((position) => (
                        <span
                          key={position}
                          className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs font-bold text-zinc-300"
                        >
                          {position}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-black text-zinc-500">진행 서비스</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {lineup.services.map((service) => (
                        <span
                          key={service}
                          className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs font-bold text-zinc-300"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  {lineup.champions.length > 0 && (
                    <div className="md:col-span-2">
                      <div className="text-xs font-black text-zinc-500">대표 챔피언</div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {lineup.champions.map((champion) => (
                          <span
                            key={champion}
                            className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs font-bold text-zinc-300"
                          >
                            {champion}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <div className={hasWinRecords ? "lg:col-span-2" : "lg:col-span-5"}>
              <div className="card-premium flex h-full flex-col rounded-4xl p-6 md:p-7">
                <div className="flex items-center gap-2 text-sm font-black text-gold">
                  <Star size={16} />
                  후기 평점
                </div>

                <div className="mt-6 flex items-end justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-5xl font-black text-white">
                        {stats.averageRating.toFixed(1)}
                      </span>
                      <span className="text-sm font-bold text-zinc-500">/ 5</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          size={16}
                          className={
                            value <= Math.round(stats.averageRating)
                              ? "fill-gold text-gold"
                              : "fill-zinc-700 text-zinc-700"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-zinc-500">전체 후기</div>
                    <div className="mt-1 text-3xl font-black text-white">
                      {stats.reviewCount}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-2.5 border-t border-white/6 pt-5">
                  {[5, 4, 3, 2, 1].map((value) => {
                    const count = stats.ratingDistribution[value as keyof typeof stats.ratingDistribution];
                    const percentage = stats.reviewCount > 0 ? (count / stats.reviewCount) * 100 : 0;
                    return (
                      <div key={value} className="flex items-center gap-3">
                        <span className="w-8 shrink-0 text-xs font-black text-zinc-400">
                          {value}★
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/8">
                          <div
                            className="h-full rounded-full bg-gold-gradient"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-8 shrink-0 text-right text-xs font-bold text-zinc-400">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {hasWinRecords && (
              <div className="lg:col-span-3">
                <WinStatsCard stats={winStats} />
              </div>
            )}
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
