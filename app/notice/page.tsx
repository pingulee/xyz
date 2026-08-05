import type { Metadata } from "next";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import SectionTitle from "@/components/ui/SectionTitle";
import NoticeBoard from "@/components/notice/NoticeBoard";
import { getNoticeList } from "@/lib/notice";
import { site } from "@/lib/site";

// 목록 페이지는 관리자가 방금 쓴 공지를 바로 봐야 하고 페이지가 하나뿐이라 동적으로 둔다.
export const dynamic = "force-dynamic";

const description =
  "XYZ 롤 대리·듀오·계정 서비스 공지사항. 이벤트·점검·정책 변경 등 운영 안내를 확인하세요.";

export const metadata: Metadata = {
  title: "공지사항",
  description,
  alternates: { canonical: "/notice" },
  openGraph: {
    title: "공지사항",
    description,
    url: "/notice",
    type: "website",
    siteName: site.brand,
    images: [{ url: site.ogImage }],
  },
  twitter: {
    card: "summary",
    title: "공지사항",
    description,
    images: [site.ogImage],
  },
};

export default async function NoticePage() {
  const notices = await getNoticeList();

  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="notice"
            title="공지사항"
            desc="XYZ 운영 소식과 안내를 확인하세요."
            as="h1"
          />
        </Reveal>
        <Reveal>
          <NoticeBoard initialNotices={notices} />
        </Reveal>
      </Container>
    </section>
  );
}
