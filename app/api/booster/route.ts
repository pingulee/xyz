import { NextResponse } from "next/server";
import { scryptSync, randomBytes } from "crypto";
import { getPool } from "@/lib/db";
import { ensureBoosterSchema, getBoosterList, getBoosterById } from "@/lib/booster";
import { invalidateBoosterCaches } from "@/lib/cache-tags";
import { isAdmin } from "@/lib/authz";
import { validateBooster, type BoosterProfileInput } from "@/lib/booster-model";
import { guardMutationRequest } from "@/lib/request-security";

export const runtime = "nodejs";

const BOOSTER_PASSWORD_MIN_LENGTH = 4;

// 기사 생성은 회원가입 코드 경로(app/api/auth/signup)로만 한다. 여기선 관리자가
// 승인된 기사를 수정(PUT)·삭제(DELETE)·조회(GET)만 한다. (POST 폐기)
type BoosterPayload = BoosterProfileInput & {
  id?: string;
  sortOrder?: number;
  active?: boolean;
  boosterPassword?: string;
};

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export async function GET() {
  try {
    return NextResponse.json({ boosterList: await getBoosterList(false) });
  } catch (error) {
    console.error("Failed to load booster", error);
    return NextResponse.json({ message: "기사 목록을 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const rejected = guardMutationRequest(request);
  if (rejected) return rejected;

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
  const rejected = guardMutationRequest(request, { maxBytes: 4 * 1024 });
  if (rejected) return rejected;

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
