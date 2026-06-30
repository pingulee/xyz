import { NextResponse } from "next/server";
import { ResultSetHeader } from "mysql2";
import { getPool } from "@/lib/db";
import { getLineups, getLineupById } from "@/lib/lineups";

export const runtime = "nodejs";

type LineupPayload = {
  id?: string;
  name?: string;
  positions?: string;
  rank?: string;
  tier?: string;
  description?: string;
  weekdayHours?: string;
  weekendHours?: string;
  champions?: string;
  services?: string;
  image?: string;
  sortOrder?: number;
  active?: boolean;
  password?: string;
};

const TIER_OPTIONS = [
  "/images/tier/1-iron.png",
  "/images/tier/2-bronze.png",
  "/images/tier/3-silver.png",
  "/images/tier/4-gold.png",
  "/images/tier/5-platinum.png",
  "/images/tier/6-emerald.png",
  "/images/tier/7-diamond.png",
  "/images/tier/8-master.png",
  "/images/tier/9-grandmaster.png",
  "/images/tier/10-challenger.png",
];

function isAdminPassword(password: string) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  return Boolean(adminPassword && password === adminPassword);
}

function validateLineup(payload: LineupPayload) {
  const name = payload.name?.trim() ?? "";
  const positions = payload.positions?.trim() ?? "";
  const rank = payload.rank?.trim() ?? "";
  const tier = payload.tier?.trim() ?? "";
  const description = payload.description?.trim() ?? "";
  const weekdayHours = payload.weekdayHours?.trim() ?? "";
  const weekendHours = payload.weekendHours?.trim() ?? "";
  const champions = payload.champions?.trim() ?? "";
  const services = payload.services?.trim() ?? "";
  const image = payload.image?.trim() ?? "";

  if (!name || name.length > 60) return { message: "이름을 입력해주세요. (최대 60자)" };
  if (!positions) return { message: "포지션을 입력해주세요." };
  if (!rank || rank.length > 30) return { message: "랭크를 입력해주세요." };
  if (!tier) return { message: "티어 이미지를 선택해주세요." };
  if (description.length > 300) return { message: "소개는 300자 이내로 입력해주세요." };
  if (!weekdayHours || weekdayHours.length > 30) return { message: "평일 시간을 입력해주세요." };
  if (!weekendHours || weekendHours.length > 30) return { message: "주말 시간을 입력해주세요." };
  if (!services) return { message: "작업 종류를 입력해주세요." };

  return { name, positions, rank, tier, description, weekdayHours, weekendHours, champions, services, image };
}

export async function GET() {
  try {
    return NextResponse.json({ lineups: await getLineups(false) });
  } catch (error) {
    console.error("Failed to load lineups", error);
    return NextResponse.json({ message: "기사 목록을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let payload: LineupPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  if (!isAdminPassword(payload.password?.trim() ?? "")) {
    return NextResponse.json({ message: "관리자 비밀번호가 일치하지 않습니다." }, { status: 403 });
  }

  const v = validateLineup(payload);
  if ("message" in v) return NextResponse.json({ message: v.message }, { status: 400 });

  try {
    const [result] = await getPool().execute<ResultSetHeader>(
      `INSERT INTO lineups (name, positions, rank, tier, description, weekday_hours, weekend_hours, champions, services, image, sort_order, active)
       VALUES (:name, :positions, :rank, :tier, :description, :weekdayHours, :weekendHours, :champions, :services, :image, :sortOrder, :active)`,
      { ...v, sortOrder: payload.sortOrder ?? 0, active: payload.active !== false },
    );
    const lineup = await getLineupById(result.insertId);
    return NextResponse.json({ lineup }, { status: 201 });
  } catch (error) {
    console.error("Failed to create lineup", error);
    return NextResponse.json({ message: "기사를 저장하지 못했습니다." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  let payload: LineupPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const id = Number(payload.id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ message: "수정할 기사를 찾을 수 없습니다." }, { status: 400 });
  }

  if (!isAdminPassword(payload.password?.trim() ?? "")) {
    return NextResponse.json({ message: "관리자 비밀번호가 일치하지 않습니다." }, { status: 403 });
  }

  const v = validateLineup(payload);
  if ("message" in v) return NextResponse.json({ message: v.message }, { status: 400 });

  try {
    await getPool().execute(
      `UPDATE lineups
       SET name=:name, positions=:positions, rank=:rank, tier=:tier, description=:description,
           weekday_hours=:weekdayHours, weekend_hours=:weekendHours, champions=:champions,
           services=:services, image=:image, sort_order=:sortOrder, active=:active
       WHERE id=:id`,
      { ...v, id, sortOrder: payload.sortOrder ?? 0, active: payload.active !== false },
    );
    const lineup = await getLineupById(id);
    if (!lineup) return NextResponse.json({ message: "기사를 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ lineup });
  } catch (error) {
    console.error("Failed to update lineup", error);
    return NextResponse.json({ message: "기사를 수정하지 못했습니다." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  let payload: LineupPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const id = Number(payload.id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ message: "삭제할 기사를 찾을 수 없습니다." }, { status: 400 });
  }

  if (!isAdminPassword(payload.password?.trim() ?? "")) {
    return NextResponse.json({ message: "관리자 비밀번호가 일치하지 않습니다." }, { status: 403 });
  }

  try {
    await getPool().execute(`DELETE FROM lineups WHERE id = :id`, { id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete lineup", error);
    return NextResponse.json({ message: "기사를 삭제하지 못했습니다." }, { status: 500 });
  }
}

export { TIER_OPTIONS };
