import clsx from "clsx";

export default function SectionTitle({
  eyebrow,
  title,
  desc,
  center = true,
  as: Heading = "h2",
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  center?: boolean;
  as?: "h1" | "h2";
}) {
  return (
    <div className={clsx("mb-12", center ? "mx-auto max-w-3xl text-center" : "max-w-3xl")}>
      <span className="mb-4 inline-flex rounded-full border border-gold/20 bg-gold/8 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-gold">
        {eyebrow}
      </span>
      <Heading className="text-3xl font-black tracking-[-0.06em] text-white sm:text-5xl lg:text-6xl">
        {title}
      </Heading>
      {desc && <p className="mt-5 text-base leading-8 text-zinc-400 sm:text-lg">{desc}</p>}
    </div>
  );
}
