"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, MessageSquare, Plus } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import InquiryForm from "@/components/inquiry/InquiryForm";
import { formatNoticeDate } from "@/components/notice/format";
import type { InquiryListItem } from "@/lib/inquiry";

// 문의 목록. 본문은 비공개라 목록엔 제목·작성자·상태만. 작성은 누구나(비회원 포함) 가능.
export default function InquiryBoard({
  initialInquiries,
}: {
  initialInquiries: InquiryListItem[];
}) {
  const { session } = useSession();
  const isMember = session.role !== null;
  const [inquiries, setInquiries] = useState<InquiryListItem[]>(initialInquiries);
  const [writing, setWriting] = useState(false);

  const refresh = async () => {
    const res = await fetch("/api/inquiry", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { inquiries: InquiryListItem[] };
      setInquiries(data.inquiries);
    }
  };

  return (
    <div className="mt-10">
      <div className="mb-6">
        {writing ? (
          <div className="card-premium rounded-3xl p-6">
            <p className="mb-4 text-sm font-black text-gold">문의 작성</p>
            <InquiryForm
              isMember={isMember}
              onCancel={() => setWriting(false)}
              onDone={async () => {
                setWriting(false);
                await refresh();
              }}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setWriting(true)}
            className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-sm font-black text-black transition hover:brightness-110"
          >
            <Plus size={16} />문의하기
          </button>
        )}
      </div>

      {inquiries.length === 0 ? (
        <p className="rounded-3xl border border-white/10 bg-black/20 px-6 py-16 text-center text-sm text-zinc-500">
          등록된 문의가 없습니다.
        </p>
      ) : (
        <ul className="grid gap-3">
          {inquiries.map((q) => (
            <li key={q.id}>
              <Link
                href={`/inquiry/${q.id}`}
                className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-black/20 px-6 py-5 transition hover:border-gold/40 hover:bg-black/30"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Lock size={14} className="shrink-0 text-zinc-500" />
                  <span className="truncate font-bold text-white">{q.title}</span>
                  {q.answered && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-black text-gold">
                      <MessageSquare size={11} />답변완료
                    </span>
                  )}
                </span>
                <span className="flex shrink-0 items-center gap-3 text-xs text-zinc-500">
                  <span className="hidden sm:inline">{q.authorName}</span>
                  <span>{formatNoticeDate(q.createdAt)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
