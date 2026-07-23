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

  // 모든 화면 5줄 고정. 작은 화면은 뒷부분을 CSS로 숨겨 세로 길이 억제.
  // 모바일 8열×5=40, 태블릿(sm) 10열×5=50, 데스크톱(lg) 16열×5=80 → 각 화면 직사각형 꽉 참.
  const LIMIT = 80;
  const step = Math.max(1, Math.floor(files.length / LIMIT));
  const shown = files.filter((_, i) => i % step === 0).slice(0, LIMIT);

  return (
    <ul className="grid grid-cols-8 gap-2 mask-[linear-gradient(to_bottom,transparent,#000_12%,#000_88%,transparent)] sm:grid-cols-10 sm:gap-2.5 lg:grid-cols-16">
      {shown.map((file, i) => {
        const ko = nameById.get(file) ?? file;
        // 40개까지 전 화면, 40~49는 sm+, 50~79는 lg에서만 표시
        const vis = i < 40 ? "" : i < 50 ? "hidden sm:block" : "hidden lg:block";
        return (
          <li key={file} title={ko} className={vis}>
            <span className="block overflow-hidden rounded-md">
              <Image
                src={`/images/champion/${file}.png`}
                alt={`${ko} 롤 대리·듀오 가능 챔피언`}
                width={56}
                height={56}
                loading="lazy"
                sizes="48px"
                className="aspect-square w-full object-cover opacity-55 grayscale-[0.35]"
              />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
