import { NextResponse } from "next/server";
import { ResultSetHeader } from "mysql2";
import { scryptSync, randomBytes } from "crypto";
import { getPool } from "@/lib/db";
import { ensureBoosterSchema, getBoosterList, getBoosterById } from "@/lib/booster";
import { invalidateBoosterCaches } from "@/lib/cache-tags";
import { isAdmin } from "@/lib/authz";
import {
  ensureAuthSchema,
  isValidUsername,
  normalizeUsername,
} from "@/lib/users";

export const runtime = "nodejs";

const DEFAULT_PROFILE_IMAGE = "/images/profile.webp";
const BOOSTER_PASSWORD_MIN_LENGTH = 4;
const BOOSTER_DESCRIPTION_MIN_LENGTH = 10;

type BoosterPayload = {
  id?: string;
  name?: string;
  positions?: string;
  rank?: string;
  tier?: string;
  description?: string;
  weekdayHours?: string;
  weekendHours?: string;
  services?: string;
  nationality?: string | number;
  image?: string | null;
  sortOrder?: number;
  active?: boolean;
  boosterPassword?: string;
  username?: string;
};

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function isValidImageUrl(image: string | null | undefined): boolean {
  if (!image) return true;
  return (
    (image === DEFAULT_PROFILE_IMAGE || image.startsWith("/upload/booster/")) &&
    image.length <= 255
  );
}

function validateBooster(payload: BoosterPayload) {
  const name = payload.name?.trim() ?? "";
  const positions = payload.positions?.trim() ?? "";
  const rank = payload.rank?.trim() ?? "";
  const tier = payload.tier?.trim() ?? "";
  const description = payload.description?.trim() ?? "";
  const weekdayHours = payload.weekdayHours?.trim() ?? "";
  const weekendHours = payload.weekendHours?.trim() ?? "";
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
  if (description.length < BOOSTER_DESCRIPTION_MIN_LENGTH) {
    return { message: "소개는 10자 이상 입력해주세요." };
  }
  if (description.length > 300) return { message: "소개는 300자 이내로 입력해주세요." };
  if (!weekdayHours || weekdayHours.length > 30) return { message: "평일 시간을 입력해주세요." };
  if (!weekendHours || weekendHours.length > 30) return { message: "주말 시간을 입력해주세요." };
  if (!services) return { message: "작업 종류를 입력해주세요." };
  if (![1, 2].includes(nationality)) {
    return { message: "국적을 다시 선택해주세요." };
  }
  if (!isValidImageUrl(image)) return { message: "이미지 URL 형식이 올바르지 않습니다." };

  return { name, positions, rank, tier, description, weekdayHours, weekendHours, services, nationality, image };
}

export async function GET() {
  try {
    return NextResponse.json({ boosterList: await getBoosterList(false) });
  } catch (error) {
    console.error("Failed to load booster", error);
    return NextResponse.json({ message: "기사 목록을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  let payload: BoosterPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const v = validateBooster(payload);
  if ("message" in v) return NextResponse.json({ message: v.message }, { status: 400 });
  const { name, positions, rank, tier, description, weekdayHours, weekendHours, services, nationality, image } = v;

  const rawBoosterPassword = payload.boosterPassword?.trim() ?? "";
  if (rawBoosterPassword.length < BOOSTER_PASSWORD_MIN_LENGTH) {
    return NextResponse.json({ message: "기사 비밀번호는 4자 이상 입력해주세요." }, { status: 400 });
  }
  const boosterPasswordHash = hashPassword(rawBoosterPassword);

  // 기사 로그인은 통합 users 계정으로 한다. 기사 생성 시 로그인 아이디를 받아
  // users(role='booster')와 booster 프로필을 함께 만들고 user_id로 연결한다.
  const username = normalizeUsername(payload.username ?? "");
  if (!isValidUsername(username)) {
    return NextResponse.json(
      { message: "기사 로그인 아이디는 영문 소문자·숫자·밑줄 3~30자로 입력해주세요." },
      { status: 400 },
    );
  }
  if (username === normalizeUsername(process.env.ADMIN_USERNAME ?? "")) {
    return NextResponse.json({ message: "사용할 수 없는 아이디입니다." }, { status: 409 });
  }

  try {
    await ensureBoosterSchema();
    await ensureAuthSchema();

    // users + booster를 한 트랜잭션으로 만들어 orphan 계정을 막는다.
    const conn = await getPool().getConnection();
    let insertId: number;
    try {
      await conn.beginTransaction();
      const [userRes] = await conn.execute<ResultSetHeader>(
        `INSERT INTO users (username, password_hash, role)
         VALUES (:username, :hash, 'booster')`,
        { username, hash: boosterPasswordHash },
      );
      const userId = userRes.insertId;
      // booster_password_hash도 병행 기입(Phase 5까지 롤백 안전망).
      const [boosterRes] = await conn.execute<ResultSetHeader>(
        `INSERT INTO booster (name, positions, rank, tier, description, weekday_hours, weekend_hours, champions, services, nationality, image_url, sort_order, active, booster_password_hash, user_id)
         VALUES (:name, :positions, :rank, :tier, :description, :weekdayHours, :weekendHours, '', :services, :nationality, :image, :sortOrder, :active, :boosterPasswordHash, :userId)`,
        { name, positions, rank, tier, description, weekdayHours, weekendHours, services, nationality, image, sortOrder: payload.sortOrder ?? 0, active: payload.active !== false, boosterPasswordHash, userId },
      );
      insertId = boosterRes.insertId;
      await conn.commit();
    } catch (txError) {
      await conn.rollback();
      throw txError;
    } finally {
      conn.release();
    }

    invalidateBoosterCaches();
    const booster = await getBoosterById(insertId);
    return NextResponse.json({ booster }, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { message: "이미 사용 중인 로그인 아이디입니다." },
        { status: 409 },
      );
    }
    console.error("Failed to create booster", error);
    return NextResponse.json({ message: "기사를 저장하지 못했습니다." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  let payload: BoosterPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const id = Number(payload.id);
  if (!Number.isInteger(id) || id < 1) {
    return NextResponse.json({ message: "수정할 기사를 찾을 수 없습니다." }, { status: 400 });
  }

  const v = validateBooster(payload);
  if ("message" in v) return NextResponse.json({ message: v.message }, { status: 400 });
  const { name, positions, rank, tier, description, weekdayHours, weekendHours, services, nationality, image } = v;

  const rawBoosterPassword = payload.boosterPassword?.trim() ?? "";
  if (rawBoosterPassword && rawBoosterPassword.length < BOOSTER_PASSWORD_MIN_LENGTH) {
    return NextResponse.json({ message: "기사 비밀번호는 4자 이상 입력해주세요." }, { status: 400 });
  }
  const newPasswordHash = rawBoosterPassword
    ? hashPassword(rawBoosterPassword)
    : undefined;

  const passwordClause = newPasswordHash !== undefined
    ? ", booster_password_hash=:boosterPasswordHash"
    : "";

  try {
    await ensureBoosterSchema();
    await getPool().execute(
      `UPDATE booster
       SET name=:name, positions=:positions, rank=:rank, tier=:tier, description=:description,
           weekday_hours=:weekdayHours, weekend_hours=:weekendHours,
           services=:services, nationality=:nationality, image_url=:image, sort_order=:sortOrder, active=:active${passwordClause}
       WHERE id=:id`,
      { name, positions, rank, tier, description, weekdayHours, weekendHours, services, nationality, image, id, sortOrder: payload.sortOrder ?? 0, active: payload.active !== false, ...(newPasswordHash !== undefined ? { boosterPasswordHash: newPasswordHash } : {}) },
    );
    invalidateBoosterCaches();
    const booster = await getBoosterById(id);
    if (!booster) return NextResponse.json({ message: "기사를 찾을 수 없습니다." }, { status: 404 });
    return NextResponse.json({ booster });
  } catch (error) {
    console.error("Failed to update booster", error);
    return NextResponse.json({ message: "기사를 수정하지 못했습니다." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isAdmin(request)) {
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
    await getPool().execute(`DELETE FROM booster WHERE id = :id`, { id });
    invalidateBoosterCaches();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete booster", error);
    return NextResponse.json({ message: "기사를 삭제하지 못했습니다." }, { status: 500 });
  }
}
