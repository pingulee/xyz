import type { Metadata } from "next";
import { cookies } from "next/headers";
import Container from "@/components/Container";
import NoticeBoard from "@/components/NoticeBoard";
import AdminNoticeBoard from "@/components/AdminNoticeBoard";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import { getNotices } from "@/lib/notices";
import { validateSession, SESSION_COOKIE } from "@/lib/adminSession";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "공지사항",
  description:
    "XYZ의 서비스 운영 공지, 가격 안내, 작업 진행 안내를 확인하세요.",
  alternates: { canonical: "/notices" },
  openGraph: {
    title: "공지사항 | XYZ",
    description: "XYZ의 최신 공지사항과 서비스 운영 안내를 확인하세요.",
    url: "/notices",
    type: "website",
  },
};

export default async function NoticesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value ?? "";
  const isAdmin = validateSession(token);

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
            desc={isAdmin ? "관리자 모드 — 작성, 수정, 삭제가 가능합니다." : "서비스 운영 안내와 주요 변경사항을 확인할 수 있습니다."}
          />
        </Reveal>
        <Reveal>
          {isAdmin ? (
            <AdminNoticeBoard initialNotices={notices} />
          ) : (
            <NoticeBoard initialNotices={notices} />
          )}
        </Reveal>
      </Container>
    </section>
  );
}
