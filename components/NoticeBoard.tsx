"use client";

import Image from "next/image";
import { Pin } from "lucide-react";
import { useMemo, useState } from "react";
import type { Notice } from "@/lib/notices";

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
  const [selectedId, setSelectedId] = useState(initialNotices[0]?.id ?? "");
  const selectedNotice = useMemo(
    () =>
      initialNotices.find((notice) => notice.id === selectedId) ??
      initialNotices[0],
    [initialNotices, selectedId],
  );

  if (initialNotices.length === 0) {
    return (
      <div className="rounded-[30px] border border-gold/15 bg-white/[.035] p-8 text-center text-zinc-400">
        등록된 공지사항이 없습니다.
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <div className="overflow-hidden rounded-[30px] border border-gold/15 bg-white/[.035]">
        {initialNotices.map((notice) => (
          <button
            key={notice.id}
            type="button"
            onClick={() => setSelectedId(notice.id)}
            className={`grid w-full gap-2 border-b border-white/8 p-4 text-left transition last:border-b-0 hover:bg-white/4 ${
              selectedNotice?.id === notice.id ? "bg-white/4.5" : ""
            }`}
          >
            <span className="flex flex-wrap items-center gap-2">
              {notice.pinned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-2.5 py-1 text-[11px] font-black text-gold">
                  <Pin size={12} />
                  고정
                </span>
              )}
              <span className="font-black text-white">{notice.title}</span>
            </span>
            <span className="line-clamp-1 text-sm leading-6 text-zinc-400">
              {notice.content}
            </span>
            <time
              className="text-xs font-bold text-zinc-500"
              dateTime={notice.createdAt}
            >
              {formatDate(notice.createdAt)}
            </time>
          </button>
        ))}
      </div>

      {selectedNotice && (
        <article className="rounded-[30px] border border-gold/15 bg-white/[.035] p-6">
          {selectedNotice.pinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gold/10 px-3 py-1 text-xs font-black text-gold">
              <Pin size={13} />
              고정
            </span>
          )}
          <h3 className="mt-3 text-2xl font-black text-white">
            {selectedNotice.title}
          </h3>
          <time
            className="mt-2 block text-sm font-bold text-zinc-500"
            dateTime={selectedNotice.createdAt}
          >
            {formatDate(selectedNotice.createdAt)}
          </time>
          {selectedNotice.image && (
            <div className="mt-4 overflow-hidden rounded-2xl">
              <Image
                src={selectedNotice.image}
                alt="공지 이미지"
                width={600}
                height={400}
                className="w-full object-cover"
                unoptimized
              />
            </div>
          )}
          <p className="mt-6 whitespace-pre-wrap leading-8 text-zinc-300">
            {selectedNotice.content}
          </p>
        </article>
      )}
    </div>
  );
}
