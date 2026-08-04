import { RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db";
import { ensureBoosterSchema } from "@/lib/booster";
import { getSessionFromRequest, type Session } from "@/lib/session";

// 요청의 통합 세션. 관리자·기사·고객을 단일 경로로 읽는다.
export function getSession(request: Request): Session | null {
  return getSessionFromRequest(request);
}

// 기존 각 라우트에 중복 정의돼 있던 isAdminRequest를 대체한다.
export function isAdmin(request: Request): boolean {
  return getSessionFromRequest(request)?.role === "admin";
}

type BoosterIdRow = RowDataPacket & { id: number };

/**
 * 세션에서 활성 기사의 booster.id를 해석한다. 기사 role이 아니면 null(→ 고객·
 * 관리자는 기사 전용 동작에서 자동 차단). 관리자 슈퍼권한은 호출부에서 role==='admin'
 * 을 별도로 통과시켜 처리하므로 여기선 다루지 않는다.
 *
 * 신규 세션의 userId는 users.id → booster.user_id로 매칭한다. 과도기 구 기사
 * 쿠키의 userId는 booster.id 직접값이라, 1차 매칭 실패 시 booster.id로 재매칭한다.
 * (Phase 5에서 구 쿠키 폴백 제거 시 2차 매칭도 삭제 가능)
 */
export async function resolveBoosterId(
  session: Session | null,
): Promise<number | null> {
  if (!session || session.role !== "booster") return null;
  await ensureBoosterSchema();

  const [byUser] = await getPool().execute<BoosterIdRow[]>(
    `SELECT id FROM booster WHERE user_id = :uid AND active = 1 LIMIT 1`,
    { uid: session.userId },
  );
  if (byUser[0]) return byUser[0].id;

  const [byId] = await getPool().execute<BoosterIdRow[]>(
    `SELECT id FROM booster WHERE id = :uid AND active = 1 LIMIT 1`,
    { uid: session.userId },
  );
  return byId[0]?.id ?? null;
}
