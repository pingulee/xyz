import Image from "next/image";
import { championImageUrl, getChampions } from "@/lib/champions";

// 챔피언 그리드. 목록은 DB(cron이 DDragon에서 매일 갱신하는 active 챔피언)에서
// 가져온다. 파일시스템을 읽지 않으므로, 홈이 ISR로 재생성될 때 새 챔피언이
// 자동 반영된다(파일 목록을 빌드타임에 고정하지 않는다).
export default async function ChampionMarquee() {
  let champions: Awaited<ReturnType<typeof getChampions>> = [];
  try {
    champions = await getChampions();
  } catch {
    return null;
  }
  if (champions.length === 0) return null;

  // 모든 화면 5줄 고정. 작은 화면은 뒷부분을 CSS로 숨겨 세로 길이 억제.
  // 모바일 8열×5=40, 태블릿(sm) 10열×5=50, 데스크톱(lg) 16열×5=80 → 각 화면 직사각형 꽉 참.
  const LIMIT = 80;
  const step = Math.max(1, Math.floor(champions.length / LIMIT));
  const shown = champions.filter((_, i) => i % step === 0).slice(0, LIMIT);

  return (
    <ul className="grid grid-cols-8 gap-2 mask-[radial-gradient(ellipse_at_center,#000_28%,transparent_82%)] pointer-events-none select-none sm:grid-cols-10 sm:gap-2.5 lg:grid-cols-16">
      {shown.map((champion, i) => {
        // 40개까지 전 화면, 40~49는 sm+, 50~79는 lg에서만 표시
        const vis = i < 40 ? "" : i < 50 ? "hidden sm:block" : "hidden lg:block";
        return (
          <li key={champion.id} className={vis}>
            <span className="block overflow-hidden rounded-md">
              <Image
                src={championImageUrl(champion.id)}
                alt={`${champion.name} 롤 대리·듀오 가능 챔피언`}
                width={56}
                height={56}
                loading="lazy"
                sizes="48px"
                draggable={false}
                // 최대 80개를 한 페이지에서 렌더한다. next/image 온디맨드 최적화를
                // 거치면 리소스 적은 호스팅이 80개 동시 sharp 변환을 못 버텨
                // 타임아웃 난다(GSC 페이지 리소스 로드 실패). 56px 장식 아이콘이라
                // 최적화 이득이 없으므로 정적 원본을 그대로 서빙한다.
                unoptimized
                className="aspect-square w-full object-cover opacity-90"
              />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
