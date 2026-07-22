import type { Metadata } from "next";
import { cookies } from "next/headers";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import ReviewBoard from "@/components/review/ReviewBoard";
import SectionTitle from "@/components/ui/SectionTitle";
import { getReviewPage } from "@/lib/review";
import { REVIEW_PAGE_SIZE } from "@/components/review/constants";
import { getLineups } from "@/lib/lineups";
import { validateSession, SESSION_COOKIE } from "@/lib/adminSession";
import {
  BOOSTER_SESSION_COOKIE,
  validateBoosterSession,
} from "@/lib/boosterSession";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "작업 후기",
  description:
    "XYZ 실제 후기를 확인하고 직접 남겨보세요.",
  alternates: { canonical: "/review" },
  openGraph: {
    title: "작업 후기 | XYZ",
    description:
      "XYZ 실제 후기를 확인하고 직접 남겨보세요.",
    url: "/review",
    type: "website",
    siteName: site.name,
    images: [{ url: site.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: "작업 후기 | XYZ",
    description: "XYZ 실제 후기를 확인하고 직접 남겨보세요.",
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
  const lineups = await getLineups(true);

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value ?? "";
  const isAdmin = validateSession(token);
  const boosterToken = cookieStore.get(BOOSTER_SESSION_COOKIE)?.value ?? "";
  const boosterLineupId = validateBoosterSession(boosterToken);

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
            lineups={lineups}
            boosterLineupId={boosterLineupId}
          />
        </Reveal>
      </Container>
    </section>
  );
}
