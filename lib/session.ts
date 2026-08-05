import { createHmac, timingSafeEqual } from "crypto";

export type Role = "admin" | "booster" | "customer";
// admin은 DB 계정이 아니라 env라 userId=0. booster는 users.id.
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

function readCookieFrom(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`${name}=([^;]+)`));
  return match?.[1] ?? null;
}

/**
 * 쿠키 헤더 문자열에서 통합 세션을 읽는다(단일 쿠키 xyz_session).
 * Request가 없는 서버 컴포넌트(page)에서는 `headers().get("cookie")`를 넘겨 쓴다.
 */
export function getSessionFromCookieHeader(cookieHeader: string): Session | null {
  const token = readCookieFrom(cookieHeader, SESSION_COOKIE);
  return token ? validateSessionToken(token) : null;
}

export function getSessionFromRequest(request: Request): Session | null {
  return getSessionFromCookieHeader(request.headers.get("cookie") ?? "");
}

export function getSessionCookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400${secure}`;
}

export function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`;
}
