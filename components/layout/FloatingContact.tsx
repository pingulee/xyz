"use client";

import { Clock, MessageCircle, Send, X } from "lucide-react";
import { useState } from "react";
import { site } from "@/lib/site";

export default function FloatingContact() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-80 flex flex-col items-end gap-3">
      {open && (
        <div className="w-72.5 rounded-[28px] border border-gold/25 bg-[#0d0b08]/95 p-5 text-white shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gold-gradient text-black">
              <MessageCircle size={20} />
            </span>
            <div>
              <p className="font-black">위챗 상담</p>
              <p className="text-xs text-zinc-400">평균 응답 시간 1~5분</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-300">
            위챗 ID <strong className="text-gold">{site.wechatId}</strong>를 친구 추가해 문의해 주세요.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/4 px-4 py-3 text-xs text-zinc-400">
            <Clock size={15} className="text-gold" />
            24시간 상담 접수
          </div>
          <a
            href={site.contactUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gold-gradient px-4 py-3 text-sm font-black text-black"
          >
            <Send size={16} />
            위챗 문의하기
          </a>
          <p className="mt-4 text-xs leading-6 text-zinc-300">위챗이 없다면 이메일로 문의를 남겨주세요.</p>
          <a href={`mailto:${site.contactEmail}`} className="inline-flex min-h-6 break-all text-xs font-bold text-gold underline underline-offset-4">{site.contactEmail}</a>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid h-16 w-16 place-items-center rounded-full bg-gold-gradient text-black transition hover:scale-105"
        aria-label="상담 버튼"
      >
        {open ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
}
