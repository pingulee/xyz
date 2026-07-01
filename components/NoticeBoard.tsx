"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Notice } from "@/lib/notices";

const NOTICES_PER_PAGE = 10;

function getPageItems(currentPage: number, totalPages: number) {
  const items: Array<number | "..."> = [];

  for (let page = 1; page <= totalPages; page += 1) {
    const visible =
      page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;

    if (visible) {
      items.push(page);
    } else if (items[items.length - 1] !== "...") {
      items.push("...");
    }
  }

  return items;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

export default function NoticeBoard({
  initialNotices = [],
}: {
  initialNotices?: Notice[];
}) {
  const [page, setPage] = useState(1);
  const router = useRouter();
  const totalPages = Math.max(
    1,
    Math.ceil(initialNotices.length / NOTICES_PER_PAGE),
  );
  const currentPage = Math.min(page, totalPages);
  const paginatedNotices = useMemo(() => {
    const start = (currentPage - 1) * NOTICES_PER_PAGE;
    return initialNotices.slice(start, start + NOTICES_PER_PAGE);
  }, [currentPage, initialNotices]);
  const pageItems = useMemo(
    () => getPageItems(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const goToPage = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  const openNotice = (noticeId: string) => {
    router.push(`/notice/${noticeId}`);
  };

  if (initialNotices.length === 0) {
    return (
      <div className="rounded-[30px] border border-gold/15 bg-white/[.035] p-8 text-center text-zinc-400">
        등록된 공지사항이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <div className="overflow-hidden rounded-[30px] border border-gold/15 bg-white/[.035]">
        <div className="hidden grid-cols-[3.25rem_minmax(0,1.4fr)_minmax(0,1.6fr)_8rem_6rem] gap-4 border-b border-white/8 bg-black/20 px-5 py-3 text-xs font-black text-zinc-500 lg:grid">
          <span>번호</span>
          <span>제목</span>
          <span>내용</span>
          <span>작성일</span>
          <span>상태</span>
        </div>

        {paginatedNotices.map((notice, i) => {
          const displayNumber =
            initialNotices.length -
            ((currentPage - 1) * NOTICES_PER_PAGE + i);

          return (
            <button
              key={notice.id}
              type="button"
              onClick={() => openNotice(notice.id)}
              className="group grid w-full cursor-pointer gap-4 border-b border-white/8 px-5 py-5 text-left transition last:border-b-0 hover:bg-white/[.055] lg:grid-cols-[3.25rem_minmax(0,1.4fr)_minmax(0,1.6fr)_8rem_6rem] lg:items-center"
            >
              <span className="hidden text-sm font-black text-zinc-500 transition group-hover:text-gold lg:block">
                {displayNumber}
              </span>

              <span className="grid min-w-0 gap-2">
                <span className="flex items-start justify-between gap-3 lg:hidden">
                  <span className="shrink-0 text-sm font-black text-zinc-500">
                    {displayNumber}
                  </span>
                  <span className="whitespace-nowrap text-xs font-bold text-zinc-500">
                    {formatDate(notice.createdAt)}
                  </span>
                </span>

                <span className="block truncate text-sm font-bold leading-6 text-white transition group-hover:text-gold">
                  {notice.title}
                </span>
                <span className="truncate text-xs font-bold text-zinc-500 lg:hidden">
                  {notice.content}
                </span>
              </span>

              <span className="hidden truncate text-sm font-bold text-zinc-400 lg:block">
                {notice.content}
              </span>

              <span className="hidden whitespace-nowrap text-xs font-bold leading-5 text-zinc-400 lg:block">
                <time dateTime={notice.createdAt}>
                  {formatDate(notice.createdAt)}
                </time>
              </span>

              <span
                className={`inline-flex w-fit rounded-full border px-2.5 py-1 text-[11px] font-black ${
                  notice.pinned
                    ? "border-gold/20 bg-gold/10 text-gold"
                    : "border-white/10 bg-white/5 text-zinc-500"
                }`}
              >
                {notice.pinned ? "고정" : "일반"}
              </span>
            </button>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:border-gold/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            이전
          </button>

          {pageItems.map((item, i) =>
            item === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="px-2 text-sm font-black text-zinc-600"
              >
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => goToPage(item)}
                className={`grid h-10 w-10 place-items-center rounded-full text-sm font-black transition ${
                  item === currentPage
                    ? "bg-gold text-black"
                    : "border border-white/10 text-zinc-300 hover:border-gold/40 hover:text-white"
                }`}
              >
                {item}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-zinc-300 transition hover:border-gold/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            다음
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
