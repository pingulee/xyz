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
  const colonIdx = token.indexOf(":");
  if (colonIdx === -1) return false;

  const expiry = Number(token.slice(0, colonIdx));
  const sig = token.slice(colonIdx + 1);

  if (!expiry || Date.now() > expiry) return false;

  const payload = `admin:${expiry}`;
  const expectedSig = createHmac("sha256", getSecret()).update(payload).digest("hex");

  const sigBuf = Buffer.from(sig.padEnd(128, "0"), "hex");
  const expectedBuf = Buffer.from(expectedSig.padEnd(128, "0"), "hex");

  return timingSafeEqual(sigBuf, expectedBuf) && sig === expectedSig;
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
