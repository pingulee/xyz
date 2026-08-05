import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/layout/Container";
import Reveal from "@/components/ui/Reveal";
import NoticeDetailView from "@/components/notice/NoticeDetailView";
import { getNoticeById } from "@/lib/notice";
import { site } from "@/lib/site";
import { serializeJsonLd } from "@/lib/jsonld";

// 상세는 후기 상세와 같은 온디맨드 ISR. 세션 편집 UI는 클라이언트로 분리해 정적화한다.
// 쓰기 시 invalidateNoticeCaches가 revalidatePath("/notice/[id]")로 즉시 갱신한다.
export const revalidate = 3600;

type Props = {
  params: Promise<{ id: string }>;
};

// 빈 배열이라 빌드 프리렌더 0. 각 공지는 첫 요청 시 생성 후 revalidate 기간 캐시(●).
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const noticeId = Number(id);
  if (!Number.isInteger(noticeId) || noticeId < 1) {
    return { title: "공지를 찾을 수 없습니다" };
  }

  const notice = await getNoticeById(noticeId);
  if (!notice) {
    return { title: "공지를 찾을 수 없습니다" };
  }

  const description = `${notice.content.replace(/\s+/g, " ").slice(0, 110)}${notice.content.length > 110 ? "..." : ""}`;
  const url = `/notice/${id}`;

  return {
    title: notice.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: notice.title,
      description,
      url,
      type: "article",
      siteName: site.brand,
      publishedTime: notice.createdAt,
      modifiedTime: notice.updatedAt,
      images: [{ url: site.ogImage }],
    },
    twitter: {
      card: "summary",
      title: notice.title,
      description,
      images: [site.ogImage],
    },
  };
}

export default async function NoticeDetailPage({ params }: Props) {
  const { id } = await params;
  const noticeId = Number(id);
  if (!Number.isInteger(noticeId) || noticeId < 1) {
    notFound();
  }

  const notice = await getNoticeById(noticeId);
  if (!notice) {
    notFound();
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: notice.title,
    articleBody: notice.content,
    datePublished: notice.createdAt,
    dateModified: notice.updatedAt,
    author: { "@type": "Organization", name: site.brand },
    publisher: { "@type": "Organization", name: site.brand },
    mainEntityOfPage: `${site.url}/notice/${notice.id}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "홈", item: site.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "공지사항",
        item: `${site.url}/notice`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: notice.title,
        item: `${site.url}/notice/${notice.id}`,
      },
    ],
  };

  return (
    <section className="py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
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
            <Link href="/notice" className="transition hover:text-gold">
              공지사항
            </Link>
            <span>/</span>
            <span className="truncate text-zinc-300">{notice.title}</span>
          </nav>
        </Reveal>
        <Reveal>
          <NoticeDetailView initialNotice={notice} />
        </Reveal>
      </Container>
    </section>
  );
}
