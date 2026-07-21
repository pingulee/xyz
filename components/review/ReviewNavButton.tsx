import type { Review } from "@/components/review/types";

export default function ReviewNavButton({
  label,
  onClick,
  review,
}: {
  label: string;
  onClick?: () => void;
  review?: Review;
}) {
  if (!review) {
    return (
      <div className="rounded-3xl border border-white/8 bg-black/20 p-4 opacity-45">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">
          {label}
        </p>
        <p className="mt-2 text-sm font-bold text-zinc-500">
          이동할 글이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="grid gap-2 rounded-3xl border border-white/10 bg-white/3.5 p-4 text-left transition hover:border-gold/35 hover:bg-white/5.5"
    >
      <span className="text-xs font-black uppercase tracking-[0.2em] text-gold">
        {label}
      </span>
      <span className="flex flex-wrap items-center gap-2">
        <span className="font-black text-white">{review.name}</span>
        <span className="rounded-full bg-gold/10 px-2.5 py-1 text-[11px] font-black text-gold">
          {review.service}
        </span>
      </span>
      <span className="line-clamp-2 text-sm leading-6 text-zinc-400">
        {review.content}
      </span>
    </button>
  );
}
