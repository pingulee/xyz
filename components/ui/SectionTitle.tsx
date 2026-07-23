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
    <div className={clsx("mb-10 sm:mb-12", center ? "mx-auto max-w-3xl text-center" : "max-w-3xl")}>
      <span className="mb-4 inline-flex rounded-full border border-gold/20 bg-gold/8 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-gold">
        {eyebrow}
      </span>
      {/* 히어로 h1(최대 6xl)보다 한 단계 아래로 유지해 타이포 계층 확보 */}
      <Heading className="text-3xl font-black tracking-tighter text-white sm:text-4xl lg:text-5xl">
        {title}
      </Heading>
      {desc && <p className="mt-4 text-base leading-8 text-zinc-400 sm:text-lg">{desc}</p>}
    </div>
  );
}
