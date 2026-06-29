import clsx from "clsx";

export default function SectionTitle({
  eyebrow,
  title,
  desc,
  center = true,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  center?: boolean;
}) {
  return (
    <div className={clsx("mb-12", center && "text-center")}>
      <p className="text-xs font-black uppercase tracking-[0.32em] text-gold">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-4xl font-black tracking-tighter text-white sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {desc && (
        <p
          className={clsx(
            "mt-5 text-base leading-8 text-zinc-400 sm:text-lg",
            center && "mx-auto max-w-2xl",
          )}
        >
          {desc}
        </p>
      )}
    </div>
  );
}
