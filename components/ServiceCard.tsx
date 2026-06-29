import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

export default function ServiceCard({
  title,
  eyebrow,
  description,
  href,
  image,
}: {
  title: string;
  eyebrow: string;
  description: string;
  href: string;
  image: string;
}) {
  return (
    <Link
      href={href}
      className="group card-premium relative overflow-hidden rounded-4xl p-7 transition duration-300 hover:-translate-y-2 hover:border-gold/45 hover:shadow-gold"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-gold/70 to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="relative mb-8 aspect-4/3 overflow-hidden rounded-3xl border border-gold/10 bg-black/40">
        <Image
          src={image}
          alt={`${title} 이미지 위치`}
          fill
          className="object-cover opacity-80 transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 rounded-full border border-gold/30 bg-black/45 px-3 py-1 text-xs font-black uppercase tracking-[.24em] text-gold backdrop-blur">
          {eyebrow}
        </div>
      </div>
      <div className="flex items-start justify-between gap-5">
        <div>
          <h3 className="text-2xl font-black tracking-[-.04em] text-white">
            {title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-zinc-400">{description}</p>
        </div>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/20 text-gold transition group-hover:bg-gold group-hover:text-black">
          <ArrowUpRight size={20} />
        </span>
      </div>
    </Link>
  );
}
