import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Clock, MessageCircle, Star, Swords } from "lucide-react";
import Container from "@/components/layout/Container";
import BoosterAvatar from "@/components/booster/BoosterAvatar";
import Reveal from "@/components/ui/Reveal";
import BoosterReview from "@/components/review/BoosterReview";
import WinStatsCard from "@/components/booster/WinStatsCard";
import { getBoosterBySlug, getBoosterReviewStats, getBoosterWinStats } from "@/lib/booster";
import { getBoosterReviewPage } from "@/lib/review";
import {
  BOOSTER_SESSION_COOKIE,
  validateBoosterSession,
} from "@/lib/boosterSession";
import { site } from "@/lib/site";

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
  const booster = await getBoosterBySlug(slug);

  if (!booster) {
    return { title: "기사 정보를 찾을 수 없습니다" };
  }

  const description =
    booster.description ||
    `${booster.name} 기사 프로필 — ${booster.rank} 티어, 진행 서비스와 후기를 확인하세요.`;
  const url = `/booster/${slug}`;
  const image = booster.image || site.ogImage;

  return {
    title: `${booster.name} | 기사 부스터`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${booster.name} | 기사 부스터`,
      description,
      url,
      type: "profile",
      siteName: site.name,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary",
      title: `${booster.name} | 기사 부스터`,
      description,
      images: [image],
    },
  };
}

export default async function BoosterDetailPage({ params }: Props) {
  const { slug } = await params;
  const booster = await getBoosterBySlug(slug);

  if (!booster) {
    notFound();
  }

  const cookieStore = await cookies();
  const boosterToken = cookieStore.get(BOOSTER_SESSION_COOKIE)?.value ?? "";
  const boosterId = validateBoosterSession(boosterToken);

  const [stats, reviewPage, winStats] = await Promise.all([
    getBoosterReviewStats(Number(booster.id)),
    getBoosterReviewPage(Number(booster.id), 1, 3),
    getBoosterWinStats(Number(booster.id)),
  ]);
  const { reviewList } = reviewPage;

  const hasWinRecords = winStats.total.wins + winStats.total.losses > 0;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "기사 부스터",
        item: `${site.url}/booster`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: booster.name,
        item: `${site.url}/booster/${encodeURIComponent(slug)}`,
      },
    ],
  };

  return (
    <section className="py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Container>
        <Reveal>
          <div className="mb-6 flex items-center gap-3 text-sm text-zinc-500">
            <Link href="/booster" className="transition hover:text-gold">
              기사 부스터
            </Link>
            <span>/</span>
            <span className="text-zinc-300">{booster.name}</span>
          </div>
        </Reveal>

        {/* ── 프로필 히어로 (배너 + 아바타 오버랩) ── */}
        <Reveal>
          <div className="card-premium relative overflow-hidden rounded-4xl">
            <div className="relative h-32 overflow-hidden md:h-40">
              <div className="absolute inset-0 bg-gold-gradient opacity-16" />
              <div className="noise absolute inset-0" />
              <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
            </div>

            <div className="relative px-6 pb-6 md:px-8 md:pb-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div className="-mt-14 flex flex-col items-center gap-4 md:-mt-16 md:flex-row md:items-end">
                  <BoosterAvatar
                    availability={booster}
                    image={booster.image}
                    name={booster.name}
                    priority
                    size={148}
                  />
                  <div className="text-center md:pb-1 md:text-left">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold/8 px-3 py-1">
                      <Image
                        src={booster.tier}
                        alt=""
                        width={16}
                        height={16}
                        className="rounded-full bg-zinc-800"
                      />
                      <span className="text-xs font-black text-gold">
                        {booster.rank}
                      </span>
                    </div>
                    <h1 className="mt-2 flex items-center justify-center gap-2.5 text-3xl font-black text-white md:justify-start">
                      {booster.name}
                      <Image
                        src={nationalityFlag(booster.nationality)}
                        alt={nationalityLabel(booster.nationality)}
                        title={nationalityLabel(booster.nationality)}
                        width={28}
                        height={19}
                        className="rounded-[3px] border border-white/10 object-cover"
                      />
                    </h1>
                    {booster.description && (
                      <p className="mt-1.5 text-sm leading-6 text-zinc-400">
                        {booster.description}
                      </p>
                    )}
                  </div>
                </div>

                <a
                  href={site.kakaoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mx-auto inline-flex shrink-0 items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-sm font-black text-black transition hover:brightness-110 md:mx-0"
                >
                  <MessageCircle size={15} />
                  기사 배정 문의
                </a>
              </div>

              <div className="mt-6 grid gap-5 border-t border-white/6 pt-6 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-black text-zinc-500">
                    <Clock size={12} />
                    평일 작업 가능 시간
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-zinc-300">
                    {booster.weekdayHours}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-black text-zinc-500">
                    <Clock size={12} />
                    주말 작업 가능 시간
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-zinc-300">
                    {booster.weekendHours}
                  </p>
                </div>
                <div>
                  <div className="text-xs font-black text-zinc-500">라인</div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {booster.positions.map((position) => (
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
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {booster.services.map((service) => (
                      <span
                        key={service}
                        className="rounded-full border border-white/8 bg-white/4 px-3 py-1 text-xs font-bold text-zinc-300"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── 본문 2열: 작업 기록 | 후기 ── */}
        <Reveal>
          <div className="mt-6 grid items-start gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              {hasWinRecords ? (
                <WinStatsCard stats={winStats} />
              ) : (
                <div className="card-premium grid place-items-center rounded-4xl p-10 text-center">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-gold/10 text-gold">
                    <Swords size={20} />
                  </span>
                  <p className="mt-4 text-sm font-black text-white">
                    아직 작업 기록이 없습니다
                  </p>
                  <p className="mt-1.5 text-xs leading-6 text-zinc-500">
                    기사님이 작업을 완료하고 후기에 답변을 남기면
                    <br />
                    티어별 승률과 챔피언별 전적이 이곳에 표시됩니다.
                  </p>
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <div className="card-premium rounded-4xl p-6">
                <div className="flex items-center gap-2 text-sm font-black text-gold">
                  <Star size={16} />
                  후기 평점
                </div>
                <div className="mt-5 flex items-end justify-between gap-3">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-white">
                        {stats.averageRating.toFixed(1)}
                      </span>
                      <span className="text-sm font-bold text-zinc-500">/ 5</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                          key={value}
                          size={14}
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
                    <div className="mt-1 text-2xl font-black text-white">
                      {stats.reviewCount}
                    </div>
                  </div>
                </div>
                <div className="mt-5 grid gap-2 border-t border-white/6 pt-4">
                  {[5, 4, 3, 2, 1].map((value) => {
                    const count = stats.ratingDistribution[value as keyof typeof stats.ratingDistribution];
                    const percentage = stats.reviewCount > 0 ? (count / stats.reviewCount) * 100 : 0;
                    return (
                      <div key={value} className="flex items-center gap-3">
                        <span className="w-7 shrink-0 text-xs font-black text-zinc-400">
                          {value}★
                        </span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/8">
                          <div
                            className="h-full rounded-full bg-gold-gradient"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-7 shrink-0 text-right text-xs font-bold text-zinc-400">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6">
                <h2 className="mb-4 text-lg font-black text-white">최근 후기</h2>
                <BoosterReview
                  reviewList={reviewList}
                  boosterId={boosterId}
                  boosterName={booster.name}
                  boosterImage={booster.image ?? ""}
                  boosterAvailability={booster}
                />
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
