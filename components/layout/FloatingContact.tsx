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
              <p className="font-black">상담</p>
              <p className="text-xs text-zinc-400">평균 응답 시간 1~5분</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-300">
            디스코드 <strong className="text-gold">@{site.discordUsername}</strong><br />텔레그램 <strong className="text-gold">@{site.telegramUsername}</strong>
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
            상담 채널 선택
          </a>
          <a href={site.telegramUrl} target="_blank" rel="noopener noreferrer" className="mt-3 flex min-h-11 items-center justify-center rounded-xl bg-[#167fac] px-4 text-sm font-bold text-white">텔레그램 바로가기 ↗</a>
          <a href={site.discordUrl} target="_blank" rel="noopener noreferrer" className="mt-2 flex min-h-11 items-center justify-center rounded-xl bg-[#5865f2] px-4 text-sm font-bold text-white">디스코드 바로가기 ↗</a>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="grid h-16 w-16 place-items-center rounded-full bg-gold-gradient text-black transition hover:scale-105"
        aria-label="상담 버튼"
      >
        {open ? <X size={28} /> : <span className="text-sm font-black">상담</span>}
      </button>
    </div>
  );
}
