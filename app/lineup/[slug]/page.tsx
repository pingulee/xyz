import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Star } from "lucide-react";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import LineupReviews from "@/components/LineupReviews";
import { getLineupBySlug, getLineupReviewStats } from "@/lib/lineups";
import { getReviewsByLineupId } from "@/lib/reviews";

export const dynamic = "force-dynamic";

const positionColors: Record<string, string> = {
  정글: "bg-emerald-500/15 text-emerald-400",
  미드: "bg-blue-500/15 text-blue-400",
  바텀: "bg-purple-500/15 text-purple-400",
  서포터: "bg-pink-500/15 text-pink-400",
  서폿: "bg-pink-500/15 text-pink-400",
  탑: "bg-orange-500/15 text-orange-400",
};

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

  const [stats, reviews] = await Promise.all([
    getLineupReviewStats(Number(lineup.id)),
    getReviewsByLineupId(Number(lineup.id)),
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
          <div className="card-premium overflow-hidden rounded-[32px] p-6 md:p-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
              {lineup.image && (
                <div className="shrink-0">
                  <div className="relative mx-auto overflow-hidden rounded-[28px] bg-black"
                    style={{ width: 300, height: 300, maxWidth: "100%" }}
                  >
                    <Image
                      src={lineup.image}
                      alt={lineup.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </div>
              )}

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {lineup.positions.map((pos) => (
                    <span
                      key={pos}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-black ${positionColors[pos] ?? "bg-gold/10 text-gold"}`}
                    >
                      {pos}
                    </span>
                  ))}
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

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-white/[.04] p-4">
                    <div className="flex items-center gap-2 text-sm font-black text-gold">
                      <Clock size={16} />
                      평일 작업 가능 시간
                    </div>
                    <p className="mt-2 text-sm text-zinc-300">{lineup.weekdayHours}</p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[.04] p-4">
                    <div className="flex items-center gap-2 text-sm font-black text-gold">
                      <Clock size={16} />
                      주말 작업 가능 시간
                    </div>
                    <p className="mt-2 text-sm text-zinc-300">{lineup.weekendHours}</p>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl border border-gold/15 bg-white/[.04] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-black text-zinc-500">Average Rating</div>
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
                      <div className="text-sm font-black text-zinc-500">Total Reviews</div>
                      <div className="mt-2 text-3xl font-black text-white">
                        {stats.reviewCount}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="text-sm font-black text-zinc-500">Rating Distribution</div>
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

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <div className="text-sm font-black text-zinc-500">대표 챔피언</div>
                    <div className="mt-3 flex flex-wrap gap-2">
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
                    <div className="mt-3 flex flex-wrap gap-2">
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
            <LineupReviews reviews={reviews} />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
