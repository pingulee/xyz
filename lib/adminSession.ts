import { createHmac, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "xyz_admin_session";
const SESSION_TTL = 24 * 60 * 60 * 1000;

function getSecret(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

export function createSession(): string {
  const expiry = Date.now() + SESSION_TTL;
  const payload = `admin:${expiry}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${expiry}:${sig}`;
}

export function validateSession(token: string): boolean {
  if (!token) return false;
  // 비밀키가 없으면 빈 키로도 HMAC이 성립해 누구나 토큰을 위조할 수 있다.
  // 설정 누락 시에는 인증을 통과시키지 않는다.
  if (!getSecret()) return false;
  const colonIdx = token.indexOf(":");
  if (colonIdx === -1) return false;

  const expiry = Number(token.slice(0, colonIdx));
  const sig = token.slice(colonIdx + 1);

  if (!expiry || Date.now() > expiry) return false;

  // 16진수가 아닌 문자가 섞이면 Buffer.from(_, "hex")이 거기서 잘라내 길이가
  // 달라지고, timingSafeEqual이 예외를 던져 요청이 500으로 죽는다. 세션을
  // 확인하는 모든 페이지가 조작된 쿠키 한 줄로 무너지므로 형식부터 거른다.
  if (!/^[0-9a-f]{64}$/.test(sig)) return false;

  const payload = `admin:${expiry}`;
  const expectedSig = createHmac("sha256", getSecret()).update(payload).digest("hex");

  return timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expectedSig, "hex"));
}

export function getSessionCookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400${secure}`;
}

export function clearSessionCookieHeader(): string {
  return `${SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`;
}

export function getSessionTokenFromRequest(request: Request): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  return match?.[1] ?? null;
}
