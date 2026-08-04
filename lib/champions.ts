import { promises as fs, existsSync } from "fs";
import path from "path";
import { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { oncePerProcess } from "@/lib/schema-once";

export type Champion = {
  id: string;
  key: string;
  name: string;
  version: string;
  /** 렌더용 이미지 URL. 환경에 따라 /upload/champion 또는 /images/champion. */
  imageUrl: string;
};

type ChampionRow = RowDataPacket & {
  riot_id: string;
  riot_key: string;
  name: string;
  ddragon_version: string;
};

type DataDragonChampion = {
  id: string;
  key: string;
  name: string;
};

type DataDragonChampionResponse = {
  data: Record<string, DataDragonChampion>;
};

const DDRAGON_BASE = "https://ddragon.leagueoflegends.com";

// 챔피언 이미지는 소스(git)에 두지 않고 서버가 자동 관리한다. 롤 패치마다
// cron이 DDragon에서 받아 UPLOAD_DIR/champion(배포와 분리된 영속 디렉토리)에
// 저장하고, /upload/champion 으로 서빙한다. 관리자 개입도, 코드 배포도 필요 없다.
// 로컬 개발에서는 UPLOAD_DIR이 없으므로 public/images/champion 을 그대로 쓴다.
export function championImageDir(): string {
  return process.env.UPLOAD_DIR
    ? path.join(process.env.UPLOAD_DIR, "champion")
    : path.join(process.cwd(), "public", "images", "champion");
}

export function championImageUrlBase(): string {
  return process.env.UPLOAD_DIR ? "/upload/champion" : "/images/champion";
}

export function championImageUrl(riotId: string): string {
  return `${championImageUrlBase()}/${riotId}.png`;
}

/**
 * DDragon에서 챔피언 이미지를 내려받아 영속 디렉토리에 채운다.
 *
 * 평소에는 로컬에 없는 파일(새 챔피언)만 받는다. 롤 패치로 DDragon 버전이
 * 오르면(리워크 등으로 기존 초상화도 바뀔 수 있어) 전체를 다시 받는다.
 * 마지막으로 받은 버전을 디렉토리의 .version 파일에 기록해 비교한다.
 * cron이 이 함수를 매일 호출하므로 새 패치가 하루 안에 자동 반영된다.
 */
async function syncChampionImages(
  champions: DataDragonChampion[],
  version: string,
): Promise<number> {
  const dir = championImageDir();
  await fs.mkdir(dir, { recursive: true });

  const versionFile = path.join(dir, ".version");
  let storedVersion = "";
  try {
    storedVersion = (await fs.readFile(versionFile, "utf8")).trim();
  } catch {
    /* 최초 실행: 마커 없음 */
  }
  const versionChanged = storedVersion !== version;

  let downloaded = 0;
  for (const champion of champions) {
    const filePath = path.join(dir, `${champion.id}.png`);
    // 버전이 그대로면 이미 있는 파일은 건너뛴다. 패치로 버전이 오르면
    // 전체를 다시 받아 리워크된 초상화까지 갱신한다.
    if (!versionChanged && existsSync(filePath)) continue;

    try {
      const res = await fetch(
        `${DDRAGON_BASE}/cdn/${version}/img/champion/${champion.id}.png`,
      );
      if (!res.ok) {
        console.error(`champion image fetch ${champion.id}: HTTP ${res.status}`);
        continue;
      }
      await fs.writeFile(filePath, Buffer.from(await res.arrayBuffer()));
      downloaded += 1;
    } catch (error) {
      // 이미지 하나가 실패해도 나머지와 이름 동기화는 계속한다.
      console.error(`champion image download failed: ${champion.id}`, error);
    }
  }

  // 이번 버전 기준으로 한 번이라도 받았으면 마커를 갱신한다.
  if (downloaded > 0 || versionChanged) {
    try {
      await fs.writeFile(versionFile, version);
    } catch (error) {
      console.error("champion .version write failed", error);
    }
  }

  return downloaded;
}

const ensureChampionsSchema = oncePerProcess(async () => {
  await getPool().execute(`
    CREATE TABLE IF NOT EXISTS champions (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      riot_id VARCHAR(80) NOT NULL,
      riot_key VARCHAR(16) NOT NULL,
      name VARCHAR(60) NOT NULL,
      ddragon_version VARCHAR(20) NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_champions_riot_id (riot_id),
      INDEX idx_champions_active_name (active, name)
    ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
  `);
});

function toChampion(row: ChampionRow): Champion {
  return {
    id: row.riot_id,
    key: row.riot_key,
    name: row.name,
    version: row.ddragon_version,
    imageUrl: championImageUrl(row.riot_id),
  };
}

export async function syncChampionsFromRiot() {
  await ensureChampionsSchema();

  const versionsRes = await fetch(`${DDRAGON_BASE}/api/versions.json`, {
    next: { revalidate: 60 * 60 },
  });
  if (!versionsRes.ok) {
    throw new Error("Riot Data Dragon 버전을 불러오지 못했습니다.");
  }

  const versions = (await versionsRes.json()) as string[];
  const version = versions[0];
  if (!version) {
    throw new Error("Riot Data Dragon 최신 버전을 찾지 못했습니다.");
  }

  const championsRes = await fetch(
    `${DDRAGON_BASE}/cdn/${version}/data/ko_KR/champion.json`,
    { next: { revalidate: 60 * 60 } },
  );
  if (!championsRes.ok) {
    throw new Error("Riot 챔피언 목록을 불러오지 못했습니다.");
  }

  const payload = (await championsRes.json()) as DataDragonChampionResponse;
  const champions = Object.values(payload.data).sort((a, b) =>
    a.name.localeCompare(b.name, "ko"),
  );

  for (const champion of champions) {
    await getPool().execute(
      `INSERT INTO champions (riot_id, riot_key, name, ddragon_version, active)
       VALUES (:riotId, :riotKey, :name, :version, TRUE)
       ON DUPLICATE KEY UPDATE
         riot_key = VALUES(riot_key),
         name = VALUES(name),
         ddragon_version = VALUES(ddragon_version),
         active = TRUE`,
      {
        riotId: champion.id,
        riotKey: champion.key,
        name: champion.name,
        version,
      },
    );
  }

  await getPool().execute(
    `UPDATE champions SET active = FALSE WHERE ddragon_version <> :version`,
    { version },
  );

  // 이름 동기화 후 누락 이미지를 채운다. 실패해도 이름 갱신은 유지한다.
  try {
    const downloaded = await syncChampionImages(champions, version);
    if (downloaded > 0) {
      console.log(`champion images downloaded: ${downloaded}`);
    }
  } catch (error) {
    console.error("champion image sync failed", error);
  }

  championCache = null;
}

/** 챔피언 한글 이름 → 이미지 URL 매핑(기사 전적 챔피언 아이콘용) */
export async function getChampionImageMap(): Promise<Record<string, string>> {
  const champions = await getChampions();
  const map: Record<string, string> = {};
  for (const champion of champions) {
    map[champion.name] = champion.imageUrl;
  }
  return map;
}

// 챔피언 목록은 거의 변하지 않으므로 원격 DB 조회를 줄이기 위해 메모리에 캐시한다.
let championCache: { at: number; champions: Champion[] } | null = null;
const CHAMPION_CACHE_TTL_MS = 10 * 60 * 1000;

export async function getChampions(): Promise<Champion[]> {
  if (championCache && Date.now() - championCache.at < CHAMPION_CACHE_TTL_MS) {
    return championCache.champions;
  }

  await ensureChampionsSchema();

  const [rows] = await getPool().execute<ChampionRow[]>(
    `SELECT riot_id, riot_key, name, ddragon_version
     FROM champions
     WHERE active = TRUE
     ORDER BY name ASC`,
  );

  const champions = rows.map(toChampion);
  championCache = { at: Date.now(), champions };
  return champions;
}
