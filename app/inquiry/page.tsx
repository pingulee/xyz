import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import WeChatContact from "@/components/ui/WeChatContact";
import { site } from "@/lib/site";

const description = `위챗 ID ${site.wechatId}를 친구 추가해 상담해 주세요. 위챗이 없다면 ${site.contactEmail}으로 문의를 남겨주세요.`;

// 문의 제목엔 개인정보가 담길 수 있어 목록·상세 모두 색인하지 않는다(프라이버시).
export const metadata: Metadata = {
  title: "위챗 문의 안내",
  description,
  robots: { index: false, follow: false },
};

export default function InquiryPage() {
  return (
    <section className="py-20">
      <Container>
        <SectionTitle
          eyebrow="WeChat contact"
          title="위챗으로 문의해 주세요"
          desc="위챗에서 친구 추가 후 상담을 요청해 주세요. 위챗이 없다면 이메일로 문의를 남겨주세요."
          as="h1"
        />
        <WeChatContact />
      </Container>
    </section>
  );
}
