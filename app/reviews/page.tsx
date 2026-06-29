import type { Metadata } from "next";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import ReviewBoard from "@/components/ReviewBoard";
import SectionTitle from "@/components/SectionTitle";

export const metadata: Metadata = {
  title: "작업 후기",
  description: "XYZ 작업 후기를 직접 작성하고 이미지와 함께 확인할 수 있습니다.",
  alternates: { canonical: "/reviews" },
};

export default function ReviewsPage() {
  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="reviews"
            title="작업 후기 게시판"
            desc="진행 경험을 직접 남기고, 이미지가 있다면 함께 첨부할 수 있습니다."
          />
        </Reveal>
        <Reveal>
          <ReviewBoard />
        </Reveal>
      </Container>
    </section>
  );
}
