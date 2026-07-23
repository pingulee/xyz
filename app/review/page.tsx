import type { Metadata } from "next";
import { cookies } from "next/headers";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import ReviewBoard from "@/components/review/ReviewBoard";
import SectionTitle from "@/components/ui/SectionTitle";
import { getReviewPage } from "@/lib/review";
import { REVIEW_PAGE_SIZE } from "@/components/review/constants";
import { getBoosterList } from "@/lib/booster";
import { validateSession, SESSION_COOKIE } from "@/lib/adminSession";
import {
  BOOSTER_SESSION_COOKIE,
  validateBoosterSession,
} from "@/lib/boosterSession";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

const reviewDescription =
  "XYZ 롤 대리·롤 듀오·롤 계정 실제 작업 후기. 담당 기사의 티어·챔피언·KDA 전적이 후기마다 함께 공개되어 직접 검증할 수 있습니다. 이용 후기도 남겨보세요.";

export const metadata: Metadata = {
  title: "롤 대리 · 듀오 작업 후기 | 실제 전적 공개",
  description: reviewDescription,
  keywords: [
    "롤 대리 후기",
    "롤대리 후기",
    "롤 듀오 후기",
    "롤 작업 후기",
    "롤 계정 후기",
    "XYZ 후기",
  ],
  alternates: { canonical: "/review" },
  openGraph: {
    title: "롤 대리 · 듀오 작업 후기 | XYZ",
    description: reviewDescription,
    url: "/review",
    type: "website",
    siteName: site.brand,
    images: [{ url: site.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "롤 대리 · 듀오 작업 후기 | XYZ",
    description: reviewDescription,
    images: [site.ogImage],
  },
};

export default async function ReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const requestedPage = Math.max(1, Number(pageParam) || 1);
  const { reviewList, total, page } = await getReviewPage(
    requestedPage,
    REVIEW_PAGE_SIZE,
  );
  const boosterList = await getBoosterList(true);

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value ?? "";
  const isAdmin = validateSession(token);
  const boosterToken = cookieStore.get(BOOSTER_SESSION_COOKIE)?.value ?? "";
  const boosterId = validateBoosterSession(boosterToken);

  const structuredReviewData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: reviewList.slice(0, 20).map((review, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Review",
        author: { "@type": "Person", name: review.name },
        reviewBody: review.content,
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.rating,
          bestRating: 5,
        },
      },
    })),
  };

  return (
    <section className="py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredReviewData) }}
      />
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="review"
            title="작업 후기"
            desc="조작 없는 100% 리얼 후기를 확인하고 직접 남겨보세요."
            as="h1"
          />
        </Reveal>
        <Reveal>
          <ReviewBoard
            key={page}
            initialReviewList={reviewList}
            total={total}
            serverPage={page}
            isAdmin={isAdmin}
            boosterList={boosterList}
            boosterId={boosterId}
          />
        </Reveal>
      </Container>
    </section>
  );
}
