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
