import Image from "next/image";
import Link from "next/link";
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
      className="group card-premium relative block overflow-hidden rounded-4xl p-6 transition duration-300 hover:-translate-y-2 hover:border-gold/45"
    >
      <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gold/10 blur-3xl" />
      </div>

      <div className="relative mb-7 aspect-16/10 overflow-hidden rounded-3xl border border-gold/10 bg-void">
        <Image
          src={image}
          alt={`${title} 서비스 이미지`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/65 via-transparent to-transparent" />
      </div>

      <div className="relative">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-gold">
          {eyebrow}
        </p>
        <div className="mt-4 flex items-start justify-between gap-6">
          <h3 className="text-2xl font-black tracking-[-0.04em] text-white">
            {title}
          </h3>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/20 text-gold transition group-hover:border-gold/60 group-hover:bg-gold group-hover:text-black">
            <ArrowUpRight size={18} />
          </span>
        </div>
        <p className="mt-4 text-sm leading-7 text-zinc-400">{description}</p>
      </div>
    </Link>
  );
}
