import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import ReviewDetailView from "@/components/review/ReviewDetailView";
import ReviewRelated from "@/components/review/ReviewRelated";
import { getBoosterById } from "@/lib/booster";
import {
  getRelatedReviews,
  getReviewById,
  getReviewNavigation,
} from "@/lib/review";
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
  // 루트 레이아웃 template이 "| XYZ"를 붙이므로 여기서 브랜드를 다시 쓰지 않는다.
  const title = `${review.name}님의 ${service} 후기`;
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

  const [review, navigation] = await Promise.all([
    getReviewById(reviewId),
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

  // 기사 한 명만 필요한데 getBoosterList는 전체 목록 + 리뷰 집계 JOIN + 전적
  // 요약까지 돌린다(실측 5초 초과). 후기 상세는 1,600여 개라 크롤 효율에 직결돼
  // 단건 조회로 바꾼다.
  const [booster, relatedReviews] = await Promise.all([
    replyBoosterId ? getBoosterById(Number(replyBoosterId)) : null,
    getRelatedReviews(reviewId, replyBoosterId, review.service),
  ]);
  // 기사가 로그인한 상태라면 답변 폼에 본인 이름을 채워준다.
  const sessionBooster =
    !booster && boosterId ? await getBoosterById(Number(boosterId)) : null;
  const boosterName = booster?.name ?? sessionBooster?.name ?? "";
  // 서비스명이 비어 있는 과거 데이터가 있어 name이 빈 문자열이 되지 않게 막는다.
  const reviewedProductName = review.service || `${site.brand} 롤 서비스`;
  const reviewJsonLd = {
    "@context": "https://schema.org",
    "@type": "Review",
    author: {
      "@type": "Person",
      name: review.name,
    },
    datePublished: review.createdAt,
    reviewBody: review.content,
    // itemReviewed에는 Service를 쓸 수 없다. 리뷰 스니펫이 허용하는 타입이
    // 아니라 GSC가 "개체 유형이 잘못되었습니다"로 반려한다.
    // Organization/LocalBusiness는 타입은 유효하지만 자사 사이트에 올린 자사
    // 후기(self-serving)라 별점 표시 자체가 비적격이다. 판매 상품 단위인
    // Product가 맞다.
    itemReviewed: {
      "@type": "Product",
      name: reviewedProductName,
      brand: {
        "@type": "Brand",
        name: site.brand,
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
        name: "홈",
        item: site.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "작업 후기",
        item: `${site.url}/review`,
      },
      {
        "@type": "ListItem",
        position: 3,
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
          <nav
            aria-label="탐색 경로"
            className="mb-8 flex items-center gap-3 text-sm text-zinc-500"
          >
            <Link href="/" className="transition hover:text-gold">
              홈
            </Link>
            <span>/</span>
            <Link href="/review" className="transition hover:text-gold">
              후기 게시판
            </Link>
            <span>/</span>
            <span className="text-zinc-300">#{review.id}</span>
          </nav>
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
        <Reveal>
          <ReviewRelated
            review={review}
            booster={booster}
            relatedReviews={relatedReviews}
          />
        </Reveal>
      </Container>
    </section>
  );
}
