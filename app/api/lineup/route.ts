import { NextResponse } from "next/server";
import { ResultSetHeader } from "mysql2";
import { scryptSync, randomBytes } from "crypto";
import { getPool } from "@/lib/db";
import { ensureLineupsSchema, getLineups, getLineupById } from "@/lib/lineups";
import { getSessionTokenFromRequest, validateSession } from "@/lib/adminSession";

export const runtime = "nodejs";

const DEFAULT_PROFILE_IMAGE = "/images/profile.webp";
const KNIGHT_PASSWORD_MIN_LENGTH = 4;
const LINEUP_DESCRIPTION_MIN_LENGTH = 10;

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
  nationality?: string | number;
  image?: string | null;
  sortOrder?: number;
  active?: boolean;
  knightPassword?: string;
};

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function isAdminRequest(request: Request): boolean {
  const token = getSessionTokenFromRequest(request);
  return token ? validateSession(token) : false;
}

function isValidImageUrl(image: string | null | undefined): boolean {
  if (!image) return true;
  return (
    (image === DEFAULT_PROFILE_IMAGE || image.startsWith("/uploads/lineups/")) &&
    image.length <= 255
  );
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
  const rawNationality = payload.nationality ?? 1;
  const nationality =
    rawNationality === "중국"
      ? 2
      : rawNationality === "대한민국"
        ? 1
        : Number(rawNationality);
  const image = payload.image || DEFAULT_PROFILE_IMAGE;

  if (!name || name.length > 60) return { message: "이름을 입력해주세요. (최대 60자)" };
  if (!positions) return { message: "포지션을 입력해주세요." };
  if (!rank || rank.length > 30) return { message: "랭크를 입력해주세요." };
  if (!tier) return { message: "티어 이미지를 선택해주세요." };
  if (description.length < LINEUP_DESCRIPTION_MIN_LENGTH) {
    return { message: "소개는 10자 이상 입력해주세요." };
  }
  if (description.length > 300) return { message: "소개는 300자 이내로 입력해주세요." };
  if (!weekdayHours || weekdayHours.length > 30) return { message: "평일 시간을 입력해주세요." };
  if (!weekendHours || weekendHours.length > 30) return { message: "주말 시간을 입력해주세요." };
  if (!champions) return { message: "챔피언을 1개 이상 선택해주세요." };
  if (!services) return { message: "작업 종류를 입력해주세요." };
  if (![1, 2].includes(nationality)) {
    return { message: "국적을 다시 선택해주세요." };
  }
  if (!isValidImageUrl(image)) return { message: "이미지 URL 형식이 올바르지 않습니다." };

  return { name, positions, rank, tier, description, weekdayHours, weekendHours, champions, services, nationality, image };
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
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  let payload: LineupPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const v = validateLineup(payload);
  if ("message" in v) return NextResponse.json({ message: v.message }, { status: 400 });
  const { name, positions, rank, tier, description, weekdayHours, weekendHours, champions, services, nationality, image } = v;

  const rawKnightPassword = payload.knightPassword?.trim() ?? "";
  if (rawKnightPassword.length < KNIGHT_PASSWORD_MIN_LENGTH) {
    return NextResponse.json({ message: "기사 비밀번호는 4자 이상 입력해주세요." }, { status: 400 });
  }
  const knightPasswordHash = hashPassword(rawKnightPassword);

  try {
    await ensureLineupsSchema();
    const [result] = await getPool().execute<ResultSetHeader>(
      `INSERT INTO lineups (name, positions, rank, tier, description, weekday_hours, weekend_hours, champions, services, nationality, image_url, sort_order, active, knight_password_hash)
       VALUES (:name, :positions, :rank, :tier, :description, :weekdayHours, :weekendHours, :champions, :services, :nationality, :image, :sortOrder, :active, :knightPasswordHash)`,
      { name, positions, rank, tier, description, weekdayHours, weekendHours, champions, services, nationality, image, sortOrder: payload.sortOrder ?? 0, active: payload.active !== false, knightPasswordHash },
    );
    const lineup = await getLineupById(result.insertId);
    return NextResponse.json({ lineup }, { status: 201 });
  } catch (error) {
    console.error("Failed to create lineup", error);
    return NextResponse.json({ message: "기사를 저장하지 못했습니다." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 });
  }

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

  const v = validateLineup(payload);
  if ("message" in v) return NextResponse.json({ message: v.message }, { status: 400 });
  const { name, positions, rank, tier, description, weekdayHours, weekendHours, champions, services, nationality, image } = v;

  const rawKnightPassword = payload.knightPassword?.trim() ?? "";
  if (rawKnightPassword && rawKnightPassword.length < KNIGHT_PASSWORD_MIN_LENGTH) {
    return NextResponse.json({ message: "기사 비밀번호는 4자 이상 입력해주세요." }, { status: 400 });
  }
  const newPasswordHash = rawKnightPassword
    ? hashPassword(rawKnightPassword)
    : undefined;

  const passwordClause = newPasswordHash !== undefined
    ? ", knight_password_hash=:knightPasswordHash"
    : "";

  try {
    await ensureLineupsSchema();
    await getPool().execute(
      `UPDATE lineups
       SET name=:name, positions=:positions, rank=:rank, tier=:tier, description=:description,
           weekday_hours=:weekdayHours, weekend_hours=:weekendHours, champions=:champions,
           services=:services, nationality=:nationality, image_url=:image, sort_order=:sortOrder, active=:active${passwordClause}
       WHERE id=:id`,
      { name, positions, rank, tier, description, weekdayHours, weekendHours, champions, services, nationality, image, id, sortOrder: payload.sortOrder ?? 0, active: payload.active !== false, ...(newPasswordHash !== undefined ? { knightPasswordHash: newPasswordHash } : {}) },
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
  if (!isAdminRequest(request)) {
    return NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  let payload: { id?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const id = Number(payload.id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ message: "삭제할 기사를 찾을 수 없습니다." }, { status: 400 });
  }

  try {
    await getPool().execute(`DELETE FROM lineups WHERE id = :id`, { id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete lineup", error);
    return NextResponse.json({ message: "기사를 삭제하지 못했습니다." }, { status: 500 });
  }
}
