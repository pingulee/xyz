import { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";

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

type CountRow = RowDataPacket & {
  count: number;
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
const SYNC_INTERVAL_MS = 1000 * 60 * 60 * 24;
let lastSyncAttempt = 0;

export async function ensureChampionsSchema() {
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
}

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
}

export async function getChampions(): Promise<Champion[]> {
  await ensureChampionsSchema();

  const [countRows] = await getPool().execute<CountRow[]>(
    `SELECT COUNT(*) AS count FROM champions WHERE active = TRUE`,
  );

  if (Number(countRows[0]?.count ?? 0) === 0) {
    await syncChampionsFromRiot();
  } else if (Date.now() - lastSyncAttempt > SYNC_INTERVAL_MS) {
    lastSyncAttempt = Date.now();
    syncChampionsFromRiot().catch((error) => {
      console.error("Failed to sync champions from Riot", error);
    });
  }

  const [rows] = await getPool().execute<ChampionRow[]>(
    `SELECT riot_id, riot_key, name, ddragon_version
     FROM champions
     WHERE active = TRUE
     ORDER BY name ASC`,
  );

  return rows.map(toChampion);
}
