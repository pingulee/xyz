"use client";

import { Copy, MessageCircle } from "lucide-react";
import { useState } from "react";
import { site } from "@/lib/site";

export default function WeChatContact() {
  const [status, setStatus] = useState("");
  async function copyId() {
    try {
      await navigator.clipboard.writeText(site.wechatId);
      setStatus("위챗 ID를 복사했습니다. 위챗에서 친구 추가 후 문의해 주세요.");
    } catch {
      setStatus(`자동 복사가 지원되지 않습니다. 위챗에서 ${site.wechatId}를 직접 검색해 주세요.`);
    }
  }
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-gold/20 bg-white/3 p-6 sm:p-10">
      <MessageCircle size={36} className="mb-5 text-gold" aria-hidden="true" />
      <p className="text-sm font-bold text-zinc-400">WeChat · 위챗 ID</p>
      <p className="mt-2 break-all text-4xl font-black text-gold">{site.wechatId}</p>
      <p className="mt-5 leading-7 text-zinc-300">위챗 ID를 친구 추가해 문의해 주세요. 모든 상담 및 문의는 위챗으로만 접수합니다.</p>
      <button type="button" onClick={copyId} className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 font-black text-black">
        <Copy size={18} aria-hidden="true" /> 위챗 ID 복사
      </button>
      <p role="status" className="mt-3 text-sm text-gold">{status}</p>
      <ol className="mt-6 list-inside list-decimal space-y-3 text-sm leading-6 text-zinc-300">
        <li>위챗 앱에서 친구 추가 또는 연락처 추가를 엽니다.</li>
        <li>ID <strong className="text-white">{site.wechatId}</strong>를 검색하고 친구 요청을 보냅니다.</li>
        <li>현재 티어, 목표 티어, 원하는 서비스를 메시지로 알려주세요.</li>
      </ol>
    </div>
  );
}
