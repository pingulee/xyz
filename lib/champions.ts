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

// 챔피언 이미지 저장 위치. 마퀴(ChampionMarquee)와 견적계산기가
// /images/champion/{riot_id}.png 로 참조하므로 기본값은 public 아래다.
// 배포와 분리된 영속 디렉토리를 쓰려면 환경변수로 덮는다.
const CHAMPION_IMAGE_DIR =
  process.env.CHAMPION_IMAGE_DIR ??
  path.join(process.cwd(), "public", "images", "champion");

/**
 * 로컬에 없는 챔피언 이미지만 DDragon에서 내려받는다.
 * DB에 새 챔피언이 들어와도 이미지 파일이 없으면 마퀴에 안 뜨고 견적계산기에서
 * 404가 난다. 이름 동기화(syncChampionsFromRiot)에 이어 이미지도 채운다.
 * 이미 있는 파일은 건너뛰므로 보통 새 챔피언 몇 개만 받는다.
 */
async function syncChampionImages(
  champions: DataDragonChampion[],
  version: string,
): Promise<number> {
  await fs.mkdir(CHAMPION_IMAGE_DIR, { recursive: true });
  let downloaded = 0;

  for (const champion of champions) {
    const filePath = path.join(CHAMPION_IMAGE_DIR, `${champion.id}.png`);
    if (existsSync(filePath)) continue;

    try {
      const res = await fetch(
        `${DDRAGON_BASE}/cdn/${version}/img/champion/${champion.id}.png`,
      );
      if (!res.ok) {
        console.error(
          `champion image fetch ${champion.id}: HTTP ${res.status}`,
        );
        continue;
      }
      await fs.writeFile(filePath, Buffer.from(await res.arrayBuffer()));
      downloaded += 1;
    } catch (error) {
      // 이미지 하나가 실패해도 나머지와 이름 동기화는 계속한다.
      console.error(`champion image download failed: ${champion.id}`, error);
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

/** 챔피언 한글 이름 → 로컬 이미지 경로(/images/champion/{riot_id}.png) 매핑 */
export async function getChampionImageMap(): Promise<Record<string, string>> {
  const champions = await getChampions();
  const map: Record<string, string> = {};
  for (const champion of champions) {
    map[champion.name] = `/images/champion/${champion.id}.png`;
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
