import { isValidRiotId, normalizeRiotId } from "@/lib/users";

// Riot ID 실존 조회. op.gg 소환사 페이지의 HTTP 상태로 판정한다(존재 200, 없음 404).
// HEAD 요청이라 본문을 받지 않아 가볍다. API 키가 필요 없다.
//   존재:  HEAD https://op.gg/lol/summoners/kr/{게임명}-{태그} → 200
//   없음:  → 404
// op.gg가 서버 IP를 차단하거나 구조가 바뀌면 조회가 실패할 수 있어(RiotUnavailableError)
// 호출부는 "일시적으로 조회 불가"로 처리한다. 지역은 kr 고정(KR 서비스).
const OPGG_REGION = "kr";
const CACHE_TTL_MS = 10 * 60 * 1000;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

export type RiotVerifyResult = { valid: boolean };

export class RiotUnavailableError extends Error {}

const globalForRiot = globalThis as typeof globalThis & {
  riotVerifyCache?: Map<string, { at: number; result: RiotVerifyResult }>;
};
function cache() {
  return (globalForRiot.riotVerifyCache ??= new Map());
}

function splitRiotId(riotId: string): { gameName: string; tagLine: string } | null {
  const i = riotId.lastIndexOf("#");
  if (i < 0) return null;
  return { gameName: riotId.slice(0, i), tagLine: riotId.slice(i + 1) };
}

/**
 * Riot ID 실존 여부. 형식 오류면 valid:false. op.gg 장애·차단이면
 * RiotUnavailableError를 던진다(호출부가 503으로 구분). 결과는 10분 캐시.
 */
export async function verifyRiotId(rawRiotId: string): Promise<RiotVerifyResult> {
  const riotId = normalizeRiotId(rawRiotId);
  if (!isValidRiotId(riotId)) return { valid: false };

  const cached = cache().get(riotId);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.result;

  const parts = splitRiotId(riotId);
  if (!parts) return { valid: false };

  const url = `https://op.gg/lol/summoners/${OPGG_REGION}/${encodeURIComponent(parts.gameName)}-${encodeURIComponent(parts.tagLine)}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": UA },
      redirect: "follow",
      cache: "no-store",
    });
  } catch {
    throw new RiotUnavailableError("op.gg 연결 실패");
  }

  if (res.status === 200 || res.status === 404) {
    const result: RiotVerifyResult = { valid: res.status === 200 };
    cache().set(riotId, { at: Date.now(), result });
    return result;
  }
  // 403(차단)·429(레이트리밋)·5xx 등 → 일시 조회 불가.
  throw new RiotUnavailableError(`op.gg ${res.status}`);
}
