import type { Metadata } from "next";
import AdminNoticeBoard from "@/components/AdminNoticeBoard";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import SectionTitle from "@/components/SectionTitle";
import { getNotices } from "@/lib/notices";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "공지사항 관리",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminNoticesPage() {
  const notices = await getNotices();

  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <SectionTitle
            eyebrow="admin"
            title="공지사항 관리"
            desc="관리자만 공지사항을 작성, 수정, 삭제할 수 있습니다."
          />
        </Reveal>
        <Reveal>
          <AdminNoticeBoard initialNotices={notices} />
        </Reveal>
      </Container>
    </section>
  );
}
