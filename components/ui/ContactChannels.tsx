import { MessageCircle, Send } from "lucide-react";
import { site } from "@/lib/site";

export default function ContactChannels() {
  return <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">{[
    { name: "디스코드", username: site.discordUsername, url: site.discordUrl, Icon: MessageCircle, color: "bg-[#5865f2]", note: "프로필을 열어 친구 추가 후 현재 티어, 목표 티어와 원하는 서비스를 알려주세요." },
    { name: "텔레그램", username: site.telegramUsername, url: site.telegramUrl, Icon: Send, color: "bg-[#167fac]", note: "아래 버튼을 눌러 텔레그램에서 상담을 시작해 주세요. 문의는 두 채널로만 접수합니다." },
  ].map(({ name, username, url, Icon, color, note }) => <article key={name} className="rounded-3xl border border-gold/20 bg-white/3 p-7 sm:p-9"><Icon size={32} className="text-gold" aria-hidden="true" /><h2 className="mt-5 text-2xl font-black text-white">{name}</h2><p className="mt-3 break-all text-2xl font-black text-gold">@{username}</p><p className="mt-4 text-sm leading-7 text-zinc-300">{note}</p><a href={url} target="_blank" rel="noopener noreferrer" className={`mt-6 flex min-h-12 items-center justify-center rounded-full px-5 py-3 font-bold text-white ${color}`}>{name}로 문의하기 ↗</a></article>)}</div>;
}
