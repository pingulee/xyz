import type { Metadata } from "next";
import Container from "@/components/Container";
import NoticeBoard from "@/components/NoticeBoard";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import { getNotices } from "@/lib/notices";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "공지사항",
  description:
    "롤대리.xyz의 서비스 운영 공지, 가격 안내, 작업 진행 안내를 확인하세요.",
  alternates: { canonical: "/notices" },
  openGraph: {
    title: "공지사항 | 롤대리.xyz",
    description:
      "롤대리.xyz의 최신 공지사항과 서비스 운영 안내를 확인하세요.",
    url: "/notices",
    type: "website",
  },
};

export default async function NoticesPage() {
  const notices = await getNotices();
  const noticeSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: notices.slice(0, 20).map((notice, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Article",
        headline: notice.title,
        datePublished: notice.createdAt,
        dateModified: notice.updatedAt,
        articleBody: notice.content,
      },
    })),
  };

  return (
    <section className="py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(noticeSchema) }}
      />
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="notice"
            title="공지사항"
            desc="서비스 운영 안내와 주요 변경사항을 확인할 수 있습니다."
          />
        </Reveal>
        <Reveal>
          <NoticeBoard initialNotices={notices} />
        </Reveal>
      </Container>
    </section>
  );
}
