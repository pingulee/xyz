import Image from "next/image";
import fs from "fs";
import path from "path";
import { getChampions } from "@/lib/champions";

// public/images/champion 의 모든 챔피언을 표시. KO 이름은 DB(getChampions, riot_id=파일명)에서 매핑.
export default async function ChampionMarquee() {
  let files: string[] = [];
  try {
    files = fs
      .readdirSync(path.join(process.cwd(), "public/images/champion"))
      .filter((f) => f.toLowerCase().endsWith(".png"))
      .map((f) => f.replace(/\.png$/i, ""))
      .sort();
  } catch {
    files = [];
  }

  const nameById = new Map<string, string>();
  try {
    for (const c of await getChampions()) nameById.set(c.id, c.name);
  } catch {
    /* DB 실패 시 파일명 사용 */
  }

  const champions: [string, string][] = files.map((id) => [
    id,
    nameById.get(id) ?? id,
  ]);
  if (champions.length === 0) return null;

  const mid = Math.ceil(champions.length / 2);
  const rows = [champions.slice(0, mid), champions.slice(mid)];

  return (
    <div className="review-marquee-mask space-y-3 sm:space-y-4">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={`review-marquee-track ${
            rowIndex % 2 === 0
              ? "animate-review-marquee-ltr"
              : "animate-review-marquee-rtl"
          }`}
        >
          {[...row, ...row].map(([file, ko], i) => {
            const isClone = i >= row.length;
            return (
              <div
                key={`${file}-${isClone ? "c" : "o"}-${i % row.length}`}
                aria-hidden={isClone || undefined}
                className="flex shrink-0 flex-col items-center gap-2"
              >
                <span className="overflow-hidden rounded-2xl border border-white/8 bg-white/3.5">
                  <Image
                    src={`/images/champion/${file}.png`}
                    alt={isClone ? "" : `${ko} 롤 대리·듀오 가능 챔피언`}
                    width={64}
                    height={64}
                    loading="lazy"
                    sizes="64px"
                    className="h-14 w-14 object-cover sm:h-16 sm:w-16"
                  />
                </span>
                <span className="max-w-16 truncate text-xs font-bold text-zinc-500">
                  {ko}
                </span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
