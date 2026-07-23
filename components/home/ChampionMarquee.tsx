import Image from "next/image";

// 파일명(영문) : 표기(한글) — alt 텍스트에 한글 키워드로 이미지 SEO
const champions: [string, string][] = [
  ["Garen", "가렌"], ["Yasuo", "야스오"], ["LeeSin", "리신"], ["Ahri", "아리"],
  ["Zed", "제드"], ["Jinx", "징크스"], ["Lux", "럭스"], ["Thresh", "쓰레쉬"],
  ["Ezreal", "이즈리얼"], ["Kaisa", "카이사"], ["Yone", "요네"], ["Sett", "세트"],
  ["Darius", "다리우스"], ["Katarina", "카타리나"], ["Vayne", "베인"], ["Riven", "리븐"],
  ["Jhin", "진"], ["Ashe", "애쉬"], ["Malphite", "말파이트"], ["Teemo", "티모"],
  ["MasterYi", "마스터 이"], ["Akali", "아칼리"], ["Viego", "비에고"], ["Samira", "사미라"],
  ["Gwen", "그웬"], ["Briar", "브라이어"], ["Hwei", "흐웨이"], ["Aphelios", "아펠리오스"],
  ["Sylas", "사일러스"], ["Camille", "카밀"], ["Fiora", "피오라"], ["Irelia", "이렐리아"],
  ["Aatrox", "아트록스"], ["Graves", "그레이브즈"], ["Khazix", "카직스"], ["Evelynn", "이블린"],
];

const mid = Math.ceil(champions.length / 2);
const rows = [champions.slice(0, mid), champions.slice(mid)];

export default function ChampionMarquee() {
  return (
    <div className="review-marquee-mask space-y-3 sm:space-y-4">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={`review-marquee-track ${
            rowIndex === 0 ? "animate-review-marquee-ltr" : "animate-review-marquee-rtl"
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
                    className="h-16 w-16 object-cover"
                  />
                </span>
                <span className="text-xs font-bold text-zinc-500">{ko}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
