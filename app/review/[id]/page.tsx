import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import ReviewDetailView from "@/components/review/ReviewDetailView";
import { getBoosterList } from "@/lib/booster";
import { getReviewById, getReviewNavigation } from "@/lib/review";
import {
  BOOSTER_SESSION_COOKIE,
  validateBoosterSession,
} from "@/lib/boosterSession";
import { SESSION_COOKIE, validateSession } from "@/lib/adminSession";
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
  const boosterName = review.boosterName ?? review.reply?.boosterName ?? "검증 기사";
  const description = `${review.content.replace(/\s+/g, " ").slice(0, 110)}${review.content.length > 110 ? "..." : ""}`;
  const title = `${review.name}님의 ${service} 후기 | XYZ`;
  const url = `/review/${id}`;

  return {
    title,
    description,
    keywords: [
      "롤 대리 후기",
      "롤 듀오 후기",
      "롤 작업 후기",
      service,
      boosterName,
      "XYZ 후기",
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: site.brand,
      publishedTime: review.createdAt,
      images: [{ url: site.ogImage }],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [site.ogImage],
    },
  };
}

export default async function ReviewDetailPage({ params }: Props) {
  const { id } = await params;
  const reviewId = Number(id);

  if (!Number.isInteger(reviewId) || reviewId < 1) {
    notFound();
  }

  const [review, boosterList, navigation] = await Promise.all([
    getReviewById(reviewId),
    getBoosterList(true),
    getReviewNavigation(reviewId),
  ]);

  if (!review) {
    notFound();
  }

  const cookieStore = await cookies();
  const adminToken = cookieStore.get(SESSION_COOKIE)?.value ?? "";
  const isAdmin = validateSession(adminToken);
  const boosterToken = cookieStore.get(BOOSTER_SESSION_COOKIE)?.value ?? "";
  const boosterId = validateBoosterSession(boosterToken);
  const replyBoosterId = review.reply?.boosterId ?? review.boosterId ?? "";
  const booster = boosterList.find((item) => item.id === replyBoosterId);
  const boosterName =
    booster?.name ??
    (boosterId
      ? boosterList.find((item) => item.id === String(boosterId))?.name
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
        name: site.brand,
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

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "작업 후기",
        item: `${site.url}/review`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `#${review.id}`,
        item: `${site.url}/review/${review.id}`,
      },
    ],
  };

  return (
    <section className="py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Container>
        <Reveal>
          <div className="mb-8 flex items-center gap-3 text-sm text-zinc-500">
            <Link href="/review" className="transition hover:text-gold">
              후기 게시판
            </Link>
            <span>/</span>
            <span className="text-zinc-300">#{review.id}</span>
          </div>
        </Reveal>
        <Reveal>
          <ReviewDetailView
            initialReview={review}
            boosterId={boosterId}
            boosterName={boosterName}
            boosterImage={booster?.image ?? ""}
            boosterAvailability={booster ?? null}
            previousReview={navigation.previous}
            nextReview={navigation.next}
            isAdmin={isAdmin}
          />
        </Reveal>
      </Container>
    </section>
  );
}
