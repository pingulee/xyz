import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function ServiceCard({
  title,
  eyebrow,
  description,
  href,
  image,
  imageAlt,
}: {
  title: string;
  eyebrow: string;
  description: string;
  href: string;
  image: string;
  imageAlt?: string;
}) {
  return (
    <Link
      href={href}
      className="group card-premium relative flex h-full flex-col overflow-hidden rounded-3xl transition duration-300 hover:border-gold/45"
    >
      <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gold/10 blur-3xl" />
      </div>

      <div className="relative aspect-8/5 overflow-hidden border-b border-gold/15 bg-void">
        <Image
          src={image}
          alt={imageAlt ?? `${title} 서비스 이미지`}
          fill
          sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) calc((100vw - 88px) / 2), (max-width: 1279px) calc((100vw - 136px) / 4), 286px"
          className="object-contain transition duration-500 group-hover:brightness-110"
        />
      </div>

      <div className="relative p-5 xl:p-6">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-gold">
          {eyebrow}
        </p>
        <div className="mt-4 flex items-start justify-between gap-3">
          <h3 className="text-xl font-semibold tracking-[-0.025em] text-white">
            {title}
          </h3>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-gold/20 text-gold transition group-hover:border-gold/60 group-hover:bg-gold group-hover:text-black">
            <ArrowUpRight size={18} />
          </span>
        </div>
        <p className="mt-4 min-h-14 text-sm leading-7 text-zinc-400">{description}</p>
      </div>
    </Link>
  );
}
