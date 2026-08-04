import { createHmac, timingSafeEqual } from "crypto";

export const BOOSTER_SESSION_COOKIE = "xyz_booster_session";
const SESSION_TTL = 24 * 60 * 60 * 1000;

function getSecret(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

export function createBoosterSession(boosterId: number): string {
  const expiry = Date.now() + SESSION_TTL;
  const payload = `booster:${boosterId}:${expiry}`;
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${boosterId}:${expiry}:${sig}`;
}

export function validateBoosterSession(token: string): number | null {
  if (!token) return null;
  // 비밀키가 없으면 빈 키로도 HMAC이 성립해 누구나 토큰을 위조할 수 있다.
  if (!getSecret()) return null;

  const parts = token.split(":");
  if (parts.length !== 3) return null;
  const [boosterIdStr, expiryStr, sig] = parts;
  const boosterId = Number(boosterIdStr);
  const expiry = Number(expiryStr);
  if (!boosterId || !expiry || Date.now() > expiry) return null;

  // 16진수가 아닌 문자가 섞이면 Buffer.from(_, "hex")이 거기서 잘라내 길이가
  // 달라지고, timingSafeEqual이 예외를 던져 요청이 500으로 죽는다.
  if (!/^[0-9a-f]{64}$/.test(sig)) return null;

  const payload = `booster:${boosterId}:${expiry}`;
  const expectedSig = createHmac("sha256", getSecret()).update(payload).digest("hex");

  if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expectedSig, "hex"))) {
    return null;
  }
  return boosterId;
}

export function getBoosterSessionCookieHeader(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${BOOSTER_SESSION_COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400${secure}`;
}

export function clearBoosterSessionCookieHeader(): string {
  return `${BOOSTER_SESSION_COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`;
}

function getBoosterTokenFromRequest(request: Request): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`${BOOSTER_SESSION_COOKIE}=([^;]+)`));
  return match?.[1] ?? null;
}

export function getBoosterId(request: Request): number | null {
  const token = getBoosterTokenFromRequest(request);
  if (!token) return null;
  return validateBoosterSession(token);
}
