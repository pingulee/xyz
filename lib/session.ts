import { createHmac, timingSafeEqual } from "crypto";
// 과도기 폴백: 구 관리자·기사 세션 쿠키를 그대로 읽어 통합 세션으로 매핑한다.
// Phase 5(안정화 후)에 아래 두 import와 폴백 블록을 제거한다.
import {
  SESSION_COOKIE as LEGACY_ADMIN_COOKIE,
  validateSession as validateLegacyAdmin,
} from "@/lib/adminSession";
import {
  BOOSTER_SESSION_COOKIE as LEGACY_BOOSTER_COOKIE,
  validateBoosterSession as validateLegacyBooster,
} from "@/lib/boosterSession";

export type Role = "admin" | "booster" | "customer";
// admin은 DB 계정이 아니라 env라 userId=0. booster는 users.id(신규 세션) 또는
// 과도기 구 쿠키의 booster.id일 수 있어 authz.resolveBoosterId가 흡수한다.
export type Session = { role: Role; userId: number };

export const SESSION_COOKIE = "xyz_session";
const SESSION_TTL = 24 * 60 * 60 * 1000;
const ROLES: readonly Role[] = ["admin", "booster", "customer"];

// 세션 서명 전용 키. 없으면 ADMIN_PASSWORD로 폴백(무중단 전환). 전용 AUTH_SECRET을
// 두면 관리자 비번을 바꿔도 고객 세션이 무효화되지 않는다. 빈 값이면 fail-closed
// (기존 adminSession의 "시크릿 없으면 거부" 정책 계승).
function getAuthSecret(): string {
  return process.env.AUTH_SECRET ?? process.env.ADMIN_PASSWORD ?? "";
}

export function createSessionToken(role: Role, userId: number): string {
  const expiry = Date.now() + SESSION_TTL;
  const payload = `${role}:${userId}:${expiry}`;
  const sig = createHmac("sha256", getAuthSecret()).update(payload).digest("hex");
  return `${payload}:${sig}`;
}

export function validateSessionToken(token: string): Session | null {
  if (!token) return null;
  if (!getAuthSecret()) return null; // 시크릿 누락 시 위조 방지 위해 fail-closed

  const parts = token.split(":");
  if (parts.length !== 4) return null;
  const [role, userIdStr, expiryStr, sig] = parts;
  if (!ROLES.includes(role as Role)) return null;

  const userId = Number(userIdStr);
  const expiry = Number(expiryStr);
  if (!Number.isInteger(userId) || userId < 0) return null;
  if (!expiry || Date.now() > expiry) return null;

  // 16진수가 아닌 문자가 섞이면 Buffer.from(_,"hex")이 잘라내 길이가 달라지고
  // timingSafeEqual이 예외를 던져 요청이 500으로 죽는다. 형식부터 거른다.
  if (!/^[0-9a-f]{64}$/.test(sig)) return null;

  const payload = `${role}:${userIdStr}:${expiryStr}`;
  const expected = createHmac("sha256", getAuthSecret()).update(payload).digest("hex");
  if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) {
    return null;
  }
  return { role: role as Role, userId };
}

function readCookie(request: Request, name: string): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`${name}=([^;]+)`));
  return match?.[1] ?? null;
}

/**
 * 요청에서 통합 세션을 읽는다. 신규 쿠키(xyz_session)를 우선 검증하고, 없으면
 * 구 관리자·기사 쿠키를 폴백으로 읽어 배포 순간 재로그인 없이 넘어간다.
 * 구 쿠키는 24h 내 자연 만료되므로 Phase 5에서 폴백 블록을 제거한다.
 *
 * 주의: 구 기사 쿠키의 값은 booster.id다(users.id 아님). Session.userId에 그대로
 * 담고, authz.resolveBoosterId가 user_id 매칭 → booster.id 직접 매칭 순으로 흡수한다.
 */
export function getSessionFromRequest(request: Request): Session | null {
  const token = readCookie(request, SESSION_COOKIE);
  const session = token ? validateSessionToken(token) : null;
  if (session) return session;

  const adminToken = readCookie(request, LEGACY_ADMIN_COOKIE);
  if (adminToken && validateLegacyAdmin(adminToken)) {
    return { role: "admin", userId: 0 };
  }

  const boosterToken = readCookie(request, LEGACY_BOOSTER_COOKIE);
  const legacyBoosterId = boosterToken ? validateLegacyBooster(boosterToken) : null;
  if (legacyBoosterId) {
    return { role: "booster", userId: legacyBoosterId };
  }

  return null;
}

export function getSessionCookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400${secure}`;
}

export function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`;
}
