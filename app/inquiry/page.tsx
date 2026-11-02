import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import ContactChannels from "@/components/ui/ContactChannels";
import { site } from "@/lib/site";

const description = `디스코드 @${site.discordUsername} 또는 텔레그램 @${site.telegramUsername}으로 문의해 주세요.`;

// 문의 제목엔 개인정보가 담길 수 있어 목록·상세 모두 색인하지 않는다(프라이버시).
export const metadata: Metadata = {
  title: "디스코드·텔레그램 문의 안내",
  description,
  robots: { index: false, follow: false },
};

export default function InquiryPage() {
  return (
    <section className="py-20">
      <Container>
        <SectionTitle
          eyebrow="Contact channels"
          title="편한 채널로 문의해 주세요"
          desc="상담과 주문 문의는 디스코드 또는 텔레그램으로만 접수합니다."
          as="h1"
        />
        <ContactChannels />
      </Container>
    </section>
  );
}
