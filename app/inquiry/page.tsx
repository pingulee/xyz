import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import SectionTitle from "@/components/ui/SectionTitle";
import InquiryBoard from "@/components/inquiry/InquiryBoard";
import { getInquiryList } from "@/lib/inquiry";

// 세션(회원/비회원)에 따라 폼이 달라지고 실시간 목록이 필요해 동적으로 둔다.
export const dynamic = "force-dynamic";

const description =
  "XYZ 롤 대리·듀오·계정 서비스 문의하기. 비회원도 비밀번호로 문의를 남기고 답변을 확인할 수 있습니다.";

// 문의 제목엔 개인정보가 담길 수 있어 목록·상세 모두 색인하지 않는다(프라이버시).
export const metadata: Metadata = {
  title: "문의하기",
  description,
  robots: { index: false, follow: false },
};

export default async function InquiryPage() {
  const inquiries = await getInquiryList();

  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="contact"
            title="문의하기"
            desc="궁금한 점을 남겨주세요. 비회원도 비밀번호로 문의·확인할 수 있습니다."
            as="h1"
          />
        </Reveal>
        <Reveal>
          <InquiryBoard initialInquiries={inquiries} />
        </Reveal>
      </Container>
    </section>
  );
}
