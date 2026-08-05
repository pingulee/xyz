import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import InquiryDetailView from "@/components/inquiry/InquiryDetailView";
import { getInquirySummaryById } from "@/lib/inquiry";

// 비공개 문의. 본문은 인증 후 클라이언트가 API로 받는다. 페이지는 요약(제목·날짜)만
// 서버 렌더하고 색인은 막는다.
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const summary = await getInquirySummaryById(Number(id));
  return {
    title: summary ? summary.title : "문의",
    robots: { index: false, follow: false },
  };
}

export default async function InquiryDetailPage({ params }: Props) {
  const { id } = await params;
  const inquiryId = Number(id);
  if (!Number.isInteger(inquiryId) || inquiryId < 1) {
    notFound();
  }

  const summary = await getInquirySummaryById(inquiryId);
  if (!summary) {
    notFound();
  }

  return (
    <section className="py-20">
      <Container>
        <Reveal>
          <nav
            aria-label="탐색 경로"
            className="mb-8 flex items-center gap-3 text-sm text-zinc-500"
          >
            <Link href="/" className="transition hover:text-gold">
              홈
            </Link>
            <span>/</span>
            <Link href="/inquiry" className="transition hover:text-gold">
              문의하기
            </Link>
          </nav>
        </Reveal>
        <Reveal>
          <InquiryDetailView summary={summary} />
        </Reveal>
      </Container>
    </section>
  );
}
