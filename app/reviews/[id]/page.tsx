import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import ReviewDetailView from "@/components/ReviewDetailView";
import { getLineups } from "@/lib/lineups";
import { getReviewById, getReviewNavigation } from "@/lib/reviews";
import { KNIGHT_SESSION_COOKIE, validateKnightSession } from "@/lib/knightSession";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const reviewId = Number(id);

  if (!Number.isInteger(reviewId) || reviewId < 1) {
    return { title: "후기를 찾을 수 없습니다" };
  }

  const review = await getReviewById(reviewId);
  if (!review) {
    return { title: "후기를 찾을 수 없습니다" };
  }

  const service = review.service || "롤 서비스";
  const lineupName = review.lineupName ?? review.reply?.knightName ?? "검증 기사";
  const description = `${review.content.replace(/\s+/g, " ").slice(0, 110)}${review.content.length > 110 ? "..." : ""}`;
  const title = `${review.name}님의 ${service} 후기 | XYZ`;
  const url = `/reviews/${id}`;

  return {
    title,
    description,
    keywords: [
      "롤 대리 후기",
      "롤 듀오 후기",
      "롤 작업 후기",
      service,
      lineupName,
      "XYZ 후기",
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: site.name,
      publishedTime: review.createdAt,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function ReviewDetailPage({ params }: Props) {
  const { id } = await params;
  const reviewId = Number(id);

  if (!Number.isInteger(reviewId) || reviewId < 1) {
    notFound();
  }

  const [review, lineups, navigation] = await Promise.all([
    getReviewById(reviewId),
    getLineups(true),
    getReviewNavigation(reviewId),
  ]);

  if (!review) {
    notFound();
  }

  const cookieStore = await cookies();
  const knightToken = cookieStore.get(KNIGHT_SESSION_COOKIE)?.value ?? "";
  const knightLineupId = validateKnightSession(knightToken);
  const replyLineupId = review.reply?.lineupId ?? review.lineupId ?? "";
  const lineup = lineups.find((item) => item.id === replyLineupId);
  const knightName =
    lineup?.name ??
    (knightLineupId
      ? lineups.find((item) => item.id === String(knightLineupId))?.name
      : "") ??
    "";
  const reviewJsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    author: {
      "@type": "Person",
      name: review.name,
    },
    datePublished: review.createdAt,
    reviewBody: review.content,
    itemReviewed: {
      "@type": "Service",
      name: review.service,
      provider: {
        "@type": "Organization",
        name: site.name,
        url: site.url,
      },
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
  };

  return (
    <section className="py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewJsonLd) }}
      />
      <Container>
        <Reveal>
          <div className="mb-8 flex items-center gap-3 text-sm text-zinc-500">
            <Link href="/reviews" className="transition hover:text-gold">
              후기 게시판
            </Link>
            <span>/</span>
            <span className="text-zinc-300">#{review.id}</span>
          </div>
        </Reveal>
        <Reveal>
          <ReviewDetailView
            initialReview={review}
            knightLineupId={knightLineupId}
            knightName={knightName}
            knightImage={lineup?.image ?? ""}
            previousReview={navigation.previous}
            nextReview={navigation.next}
          />
        </Reveal>
      </Container>
    </section>
  );
}
