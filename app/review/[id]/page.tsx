import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import ReviewDetailView from "@/components/review/ReviewDetailView";
import { getBoosterById } from "@/lib/booster";
import {
  getReviewById,
  getReviewNavigation,
  getServiceRatingAggregates,
} from "@/lib/review";
import { site } from "@/lib/site";
import { serializeJsonLd } from "@/lib/jsonld";

// 세션(관리자/기사) 읽기를 클라이언트로 옮겨(cookies() 제거) 페이지를 정적
// 캐시한다. 방문·크롤마다 DB를 4~5회 왕복하던 부하가 revalidate 주기당 1회로
// 준다. 편집 UI는 ReviewDetailView가 /api/session/me 로 세션을 확인해 켠다.
// 후기/답글 쓰기 시 해당 API에서 revalidatePath("/review/[id]")로 즉시 갱신한다.
export const revalidate = 3600;

type Props = {
  params: Promise<{ id: string }>;
};

// 동적 세그먼트를 ISR 대상으로 전환한다. 빈 배열이라 빌드 프리렌더는 0(1,600여
// 개를 빌드에 올리지 않는다). dynamicParams(기본 true)로 각 후기는 첫 요청 시
// 생성돼 revalidate 기간 캐시된다(온디맨드 ISR). 쓰기 시 revalidatePath로 갱신.
export function generateStaticParams() {
  return [];
}

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

  // 원격 DB라 쿼리 복잡도보다 왕복 횟수가 응답 시간을 지배한다. 후기를 먼저
  // 읽고, 그 결과가 필요한 나머지 조회는 한 번에 병렬로 묶어 왕복을 2회로 줄인다.
  const review = await getReviewById(reviewId);

  if (!review) {
    notFound();
  }

  const replyBoosterId = review.reply?.boosterId ?? review.boosterId ?? "";

  // 답글 단 기사 한 명만 필요한데 getBoosterList는 전체 목록 + 리뷰 집계 JOIN +
  // 전적 요약까지 돌린다. 후기 상세는 1,600여 개라 크롤 효율에 직결돼 단건 조회로
  // 쓴다. 이미 읽은 review의 작성 시각을 넘겨 이전/다음 조회의 기준 시각 재조회를 없앤다.
  const [navigation, booster, serviceAggregates] = await Promise.all([
    getReviewNavigation(reviewId, review.createdAt),
    replyBoosterId ? getBoosterById(Number(replyBoosterId)) : null,
    getServiceRatingAggregates(),
  ]);
  const serviceAgg = serviceAggregates[review.service];
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
      // 제품 스니펫 자격을 위해 해당 서비스의 집계 별점을 붙인다(실제 값).
      ...(serviceAgg && serviceAgg.reviewCount > 0
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: serviceAgg.ratingValue,
              reviewCount: serviceAgg.reviewCount,
              bestRating: 5,
              worstRating: 1,
            },
          }
        : {}),
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
        name: `#${review.id}`,
        item: `${site.url}/review/${review.id}`,
      },
    ],
  };

  return (
    <section className="py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(reviewJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
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
            <span className="text-zinc-300">#{review.id}</span>
          </nav>
        </Reveal>
        <Reveal>
          <ReviewDetailView
            initialReview={review}
            boosterImage={booster?.image ?? ""}
            boosterAvailability={booster ?? null}
            previousReview={navigation.previous}
            nextReview={navigation.next}
          />
        </Reveal>
      </Container>
    </section>
  );
}
