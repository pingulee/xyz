import Image from "next/image";
import fs from "fs";
import path from "path";
import { getChampions } from "@/lib/champions";

// public/images/champion 의 모든 챔피언을 정적 그리드로 표시. KO 이름은 DB(riot_id=파일명)에서 매핑.
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

  if (files.length === 0) return null;

  // 열 개수(모바일 8·sm 10·lg 16)의 공배수만큼만 표시 → 마지막 줄까지 항상 꽉 참(lg 5줄)
  const LIMIT = 80;
  const step = Math.max(1, Math.floor(files.length / LIMIT));
  const shown = files.filter((_, i) => i % step === 0).slice(0, LIMIT);

  return (
    <ul className="grid grid-cols-8 gap-2 mask-[linear-gradient(to_bottom,transparent,#000_12%,#000_88%,transparent)] sm:grid-cols-10 sm:gap-2.5 lg:grid-cols-16">
      {shown.map((file) => {
        const ko = nameById.get(file) ?? file;
        return (
          <li key={file} className="group" title={ko}>
            <span className="block overflow-hidden rounded-md border border-white/8 bg-white/3.5 transition group-hover:border-gold/50">
              <Image
                src={`/images/champion/${file}.png`}
                alt={`${ko} 롤 대리·듀오 가능 챔피언`}
                width={56}
                height={56}
                loading="lazy"
                sizes="48px"
                className="aspect-square w-full object-cover opacity-55 grayscale-[0.35] transition duration-300 group-hover:scale-110 group-hover:opacity-100 group-hover:grayscale-0"
              />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
