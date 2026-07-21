import { createHmac, timingSafeEqual } from "crypto";

export const KNIGHT_SESSION_COOKIE = "xyz_knight_session";
const SESSION_TTL = 24 * 60 * 60 * 1000;

function getSecret(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

export function createKnightSession(lineupId: number): string {
  const expiry = Date.now() + SESSION_TTL;
  const payload = `knight:${lineupId}:${expiry}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${lineupId}:${expiry}:${sig}`;
}

export function validateKnightSession(token: string): number | null {
  if (!token) return null;
  const parts = token.split(":");
  if (parts.length !== 3) return null;
  const [lineupIdStr, expiryStr, sig] = parts;
  const lineupId = Number(lineupIdStr);
  const expiry = Number(expiryStr);
  if (!lineupId || !expiry || Date.now() > expiry) return null;

  const payload = `knight:${lineupId}:${expiry}`;
  const expectedSig = createHmac("sha256", getSecret()).update(payload).digest("hex");

  const sigBuf = Buffer.from(sig.padEnd(128, "0"), "hex");
  const expectedBuf = Buffer.from(expectedSig.padEnd(128, "0"), "hex");

  if (!timingSafeEqual(sigBuf, expectedBuf) || sig !== expectedSig) return null;
  return lineupId;
}

export function getKnightSessionCookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${KNIGHT_SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400${secure}`;
}

export function clearKnightSessionCookieHeader(): string {
  return `${KNIGHT_SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`;
}

function getKnightTokenFromRequest(request: Request): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`${KNIGHT_SESSION_COOKIE}=([^;]+)`));
  return match?.[1] ?? null;
}

export function getKnightLineupId(request: Request): number | null {
  const token = getKnightTokenFromRequest(request);
  if (!token) return null;
  return validateKnightSession(token);
}
