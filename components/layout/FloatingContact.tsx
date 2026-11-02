"use client";

import { MessageCircle, Send, X } from "lucide-react";
import { useState } from "react";
import { site } from "@/lib/site";

export default function FloatingContact() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-80 flex flex-col items-end gap-3">
      {open && (
        <div className="w-[min(380px,calc(100vw-2rem))] max-h-[calc(100dvh-7rem)] overflow-y-auto rounded-3xl border border-white/15 bg-[#101521]/98 p-5 text-white shadow-2xl shadow-black/60 backdrop-blur-xl">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div><p className="text-xl font-black">어디서 상담할까요?</p><p className="mt-1 text-xs text-zinc-400">편한 채널을 선택해 문의해 주세요.</p></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="상담창 닫기" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/15 text-zinc-300 hover:bg-white/10"><X size={18} /></button>
          </div>
          <div className="grid gap-3">
            {[
              { name: "디스코드", username: site.discordUsername, url: site.discordUrl, Icon: MessageCircle, color: "bg-[#5865f2]", note: "프로필에서 친구 추가 후 메시지를 보내주세요." },
              { name: "텔레그램", username: site.telegramUsername, url: site.telegramUrl, Icon: Send, color: "bg-[#1687b7]", note: "채팅을 열어 문의 내용을 보내주세요." },
            ].map(({ name, username, url, Icon, color, note }) => (
              <section key={name} className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${color}`}><Icon size={21} aria-hidden="true" /></span>
                <h2 className="mt-3 text-base font-bold">{name}</h2>
                <p className="mt-0.5 text-sm font-bold text-gold">@{username}</p>
                <p className="mt-2 text-xs leading-5 text-zinc-400">{note}</p>
                <a href={url} target="_blank" rel="noopener noreferrer" className={`mt-3 flex min-h-11 items-center justify-between rounded-xl px-4 text-sm font-bold text-white ${color}`}>{name}로 문의하기 <span aria-hidden="true">↗</span></a>
              </section>
            ))}
          </div>
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
