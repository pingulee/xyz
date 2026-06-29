import type { Metadata } from "next";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import ReviewBoard from "@/components/ReviewBoard";
import SectionTitle from "@/components/SectionTitle";
import { getReviews } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "작업 후기",
  description:
    "롤대리.xyz 작업 후기와 실제 진행 경험을 확인하고 직접 후기를 남길 수 있습니다.",
  alternates: { canonical: "/reviews" },
  openGraph: {
    title: "작업 후기 | 롤대리.xyz",
    description:
      "롤대리.xyz 작업 후기와 실제 진행 경험을 확인하고 직접 후기를 남길 수 있습니다.",
    url: "/reviews",
    type: "website",
  },
};

export default async function ReviewsPage() {
  const reviews = await getReviews();
  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: reviews.slice(0, 20).map((review, index) => ({
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
      />
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="reviews"
            title="작업 후기"
            desc="조작 없는 100% 리얼 후기를 맛보세요."
          />
        </Reveal>
        <Reveal>
          <ReviewBoard initialReviews={reviews} />
        </Reveal>
      </Container>
    </section>
  );
}
