import { NextResponse } from "next/server";
import { scryptSync, timingSafeEqual } from "crypto";
import { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { ensureLineupsSchema } from "@/lib/lineups";
import {
  createBoosterSession,
  getBoosterSessionCookieHeader,
} from "@/lib/boosterSession";

export const runtime = "nodejs";

type LineupRow = RowDataPacket & {
  id: number;
  name: string;
  booster_password_hash: string | null;
};

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuffer = Buffer.from(hash, "hex");
  const inputBuffer = scryptSync(password, salt, 64);
  return hashBuffer.length === inputBuffer.length && timingSafeEqual(hashBuffer, inputBuffer);
}

export async function POST(request: Request) {
  let payload: { name?: string; password?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const name = payload.name?.trim() ?? "";
  const password = payload.password?.trim() ?? "";

  if (!name || !password) {
    return NextResponse.json({ message: "닉네임과 비밀번호를 입력해주세요." }, { status: 400 });
  }

  await ensureLineupsSchema();
  const [rows] = await getPool().execute<LineupRow[]>(
    `SELECT id, name, booster_password_hash FROM lineups WHERE name = :name AND active = 1 LIMIT 1`,
    { name },
  );

  const lineup = rows[0];
  if (!lineup || !lineup.booster_password_hash) {
    return NextResponse.json({ message: "닉네임 또는 비밀번호가 일치하지 않습니다." }, { status: 403 });
  }

  if (!verifyPassword(password, lineup.booster_password_hash)) {
    return NextResponse.json({ message: "닉네임 또는 비밀번호가 일치하지 않습니다." }, { status: 403 });
  }

  const token = createBoosterSession(lineup.id);
  return NextResponse.json({ ok: true, lineupId: lineup.id, name: lineup.name }, {
    headers: { "Set-Cookie": getBoosterSessionCookieHeader(token) },
  });
}
