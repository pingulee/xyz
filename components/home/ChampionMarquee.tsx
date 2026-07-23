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

  return (
    <ul className="grid grid-cols-6 gap-2 sm:grid-cols-9 sm:gap-2.5 lg:grid-cols-12">
      {files.map((file) => {
        const ko = nameById.get(file) ?? file;
        return (
          <li key={file} className="group">
            <span className="block overflow-hidden rounded-xl border border-white/8 bg-white/3.5 transition group-hover:border-gold/30">
              <Image
                src={`/images/champion/${file}.png`}
                alt={`${ko} 롤 대리·듀오 가능 챔피언`}
                width={80}
                height={80}
                loading="lazy"
                sizes="(max-width: 640px) 16vw, (max-width: 1024px) 11vw, 80px"
                className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
