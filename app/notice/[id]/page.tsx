import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import { getNoticeById, getNoticeNavigation } from "@/lib/notices";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const noticeId = Number(id);

  if (!Number.isInteger(noticeId) || noticeId < 1) {
    return { title: "공지사항을 찾을 수 없습니다" };
  }

  const notice = await getNoticeById(noticeId);
  if (!notice) {
    return { title: "공지사항을 찾을 수 없습니다" };
  }

  const description = `${notice.content.replace(/\s+/g, " ").slice(0, 110)}${
    notice.content.length > 110 ? "..." : ""
  }`;
  const title = `${notice.title} | XYZ`;
  const url = `/notice/${id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      siteName: site.name,
      publishedTime: notice.createdAt,
      modifiedTime: notice.updatedAt,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function NoticeDetailPage({ params }: Props) {
  const { id } = await params;
  const noticeId = Number(id);

  if (!Number.isInteger(noticeId) || noticeId < 1) {
    notFound();
  }

  const [notice, navigation] = await Promise.all([
    getNoticeById(noticeId),
    getNoticeNavigation(noticeId),
  ]);

  if (!notice) {
    notFound();
  }

  const noticeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: notice.title,
    datePublished: notice.createdAt,
    dateModified: notice.updatedAt,
    articleBody: notice.content,
    publisher: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
  };

  return (
    <section className="py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(noticeJsonLd) }}
      />
      <Container>
        <Reveal>
          <div className="mb-8 flex items-center gap-3 text-sm text-zinc-500">
            <Link href="/notice" className="transition hover:text-gold">
              공지사항
            </Link>
            <span>/</span>
            <span className="text-zinc-300">#{notice.id}</span>
          </div>
        </Reveal>

        <Reveal>
          <article className="overflow-hidden rounded-[30px] border border-gold/15 bg-white/[.035]">
            <header className="border-b border-white/8 p-6 sm:p-8">
              {notice.pinned && (
                <span className="inline-flex rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-xs font-black text-gold">
                  고정
                </span>
              )}
              <h1 className="mt-4 text-3xl font-black leading-tight text-white sm:text-4xl">
                {notice.title}
              </h1>
              <time
                dateTime={notice.createdAt}
                className="mt-3 block text-sm font-bold text-zinc-500"
              >
                {formatDate(notice.createdAt)}
              </time>
            </header>

            {notice.image && (
              <div className="relative aspect-[16/9] bg-black/30">
                <Image
                  src={notice.image}
                  alt={notice.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}

            <div className="p-6 sm:p-8">
              <p className="whitespace-pre-wrap leading-8 text-zinc-300">
                {notice.content}
              </p>
            </div>
          </article>
        </Reveal>

        <Reveal>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {navigation.previous ? (
              <Link
                href={`/notice/${navigation.previous.id}`}
                className="group rounded-[24px] border border-white/10 bg-white/[.025] p-5 transition hover:border-gold/35 hover:bg-white/[.045]"
              >
                <span className="inline-flex items-center gap-2 text-xs font-black text-zinc-500 group-hover:text-gold">
                  <ChevronLeft size={15} />
                  이전글
                </span>
                <p className="mt-2 truncate font-bold text-white">
                  {navigation.previous.title}
                </p>
              </Link>
            ) : (
              <div className="rounded-[24px] border border-white/8 p-5 text-sm font-bold text-zinc-600">
                이전글이 없습니다.
              </div>
            )}

            {navigation.next ? (
              <Link
                href={`/notice/${navigation.next.id}`}
                className="group rounded-[24px] border border-white/10 bg-white/[.025] p-5 text-right transition hover:border-gold/35 hover:bg-white/[.045]"
              >
                <span className="inline-flex items-center gap-2 text-xs font-black text-zinc-500 group-hover:text-gold">
                  다음글
                  <ChevronRight size={15} />
                </span>
                <p className="mt-2 truncate font-bold text-white">
                  {navigation.next.title}
                </p>
              </Link>
            ) : (
              <div className="rounded-[24px] border border-white/8 p-5 text-right text-sm font-bold text-zinc-600">
                다음글이 없습니다.
              </div>
            )}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
