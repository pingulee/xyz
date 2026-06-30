import { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";

export type Lineup = {
  id: string;
  name: string;
  positions: string[];
  rank: string;
  tier: string;
  description: string;
  weekdayHours: string;
  weekendHours: string;
  champions: string[];
  services: string[];
  image: string | null;
  sortOrder: number;
  active: boolean;
};

type LineupRow = RowDataPacket & {
  id: number;
  name: string;
  positions: string;
  rank: string;
  tier: string;
  description: string;
  weekday_hours: string;
  weekend_hours: string;
  champions: string;
  services: string;
  image_data: string | null;
  sort_order: number;
  active: 0 | 1;
};

function split(val: string): string[] {
  return val
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function toLineup(row: LineupRow): Lineup {
  return {
    id: String(row.id),
    name: row.name,
    positions: split(row.positions),
    rank: row.rank,
    tier: row.tier,
    description: row.description,
    weekdayHours: row.weekday_hours,
    weekendHours: row.weekend_hours,
    champions: split(row.champions),
    services: split(row.services),
    image: row.image_data ?? null,
    sortOrder: row.sort_order,
    active: Boolean(row.active),
  };
}

export async function getLineups(activeOnly = true): Promise<Lineup[]> {
  const [rows] = await getPool().execute<LineupRow[]>(
    activeOnly
      ? `SELECT * FROM lineups WHERE active = 1 ORDER BY sort_order ASC, id ASC`
      : `SELECT * FROM lineups ORDER BY sort_order ASC, id ASC`,
  );
  return rows.map(toLineup);
}

export async function getLineupById(id: number): Promise<Lineup | null> {
  const [rows] = await getPool().execute<LineupRow[]>(
    `SELECT * FROM lineups WHERE id = :id`,
    { id },
  );
  return rows[0] ? toLineup(rows[0]) : null;
}
