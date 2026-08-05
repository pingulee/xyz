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

// 솔로랭크 티어 조회 결과. ranked=false는 언랭(또는 티어 정보 없음)이다.
// level은 소환사 레벨(op.gg 프로필 배지). 파싱 실패 시 null.
export type SoloTier =
  | {
      ranked: true;
      level: number | null;
      tierKey: string; // TIERS[key] (iron..challenger)
      tierIndex: number; // 0(아이언) ~ 9(챌린저)
      division: number; // 1(I) ~ 4(IV), 마스터 이상은 1
      lp: number;
      tierName: string; // op.gg 원문(예: grandmaster)
      gamesPlayed: number;
      previousTier: PreviousTier | null;
    }
  | {
      ranked: false;
      level: number | null;
      gamesPlayed: number;
      previousTier: PreviousTier | null;
    };

export type PreviousTier = {
  season: string;
  tierIndex: number;
  division: number;
  tierName: string;
};

export class RiotUnavailableError extends Error {}

// op.gg 소환사 페이지 설명문의 티어 단어 → TIERS 인덱스.
const TIER_INDEX: Record<string, number> = {
  iron: 0,
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
  emerald: 5,
  diamond: 6,
  master: 7,
  grandmaster: 8,
  challenger: 9,
};

function parsePreviousTier(html: string): PreviousTier | null {
  // Next.js flight 데이터 안의 JSON 문자열은 따옴표가 이스케이프되어 있으므로
  // 검색용 복사본에서만 풀어 가장 최근 시즌의 최종 솔로랭크를 찾는다.
  const decoded = html.replace(/\\"/g, '"');
  const matches = decoded.matchAll(
    /"season":"([^"]+)"\s*,\s*"rank_entries":\{.*?"rank_info":\{"tier":"([^"]*)"/g,
  );
  for (const match of matches) {
    const raw = match[2].trim().toLowerCase();
    if (!raw) continue;
    const tierName = raw.match(/^[a-z]+/)?.[0] ?? "";
    const tierIndex = TIER_INDEX[tierName];
    if (tierIndex === undefined) continue;
    const rawDivision = Number(raw.match(/\b([1-4])\b/)?.[1] ?? 1);
    return {
      season: match[1].trim(),
      tierIndex,
      division: tierIndex >= 7 ? 1 : rawDivision,
      tierName,
    };
  }
  return null;
}

function parseSoloGames(html: string): number {
  // OP.GG description: "current SOLORANKED ... with 3 wins, 1 losses ..."
  const match = html.match(
    /SOLORANKED[^.]*?with\s+(\d+)\s+wins,\s*(\d+)\s+losses/i,
  );
  return match ? Number(match[1]) + Number(match[2]) : 0;
}

const globalForRiot = globalThis as typeof globalThis & {
  riotVerifyCache?: Map<string, { at: number; result: RiotVerifyResult }>;
  riotTierCache?: Map<string, { at: number; result: SoloTier }>;
};
function cache() {
  return (globalForRiot.riotVerifyCache ??= new Map());
}
function tierCache() {
  return (globalForRiot.riotTierCache ??= new Map());
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

/**
 * 솔로랭크 현재 티어 조회. op.gg 소환사 페이지를 GET해 서버 렌더된 설명문
 * ("... current SOLORANKED rank is grandmaster Division 1 1611 LP ...")을
 * 파싱한다. API 키가 필요 없고, 언랭·미존재면 { ranked:false }.
 * op.gg 차단/장애면 RiotUnavailableError. 결과는 10분 캐시.
 */
export async function getSoloTier(rawRiotId: string): Promise<SoloTier> {
  const riotId = normalizeRiotId(rawRiotId);
  if (!isValidRiotId(riotId)) {
    return { ranked: false, level: null, gamesPlayed: 0, previousTier: null };
  }

  const cached = tierCache().get(riotId);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.result;

  const parts = splitRiotId(riotId);
  if (!parts) {
    return { ranked: false, level: null, gamesPlayed: 0, previousTier: null };
  }

  const url = `https://op.gg/lol/summoners/${OPGG_REGION}/${encodeURIComponent(parts.gameName)}-${encodeURIComponent(parts.tagLine)}`;

  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "User-Agent": UA },
      redirect: "follow",
      cache: "no-store",
    });
  } catch {
    throw new RiotUnavailableError("op.gg 연결 실패");
  }

  if (res.status === 404) {
    const result: SoloTier = {
      ranked: false,
      level: null,
      gamesPlayed: 0,
      previousTier: null,
    };
    tierCache().set(riotId, { at: Date.now(), result });
    return result;
  }
  if (res.status !== 200) {
    throw new RiotUnavailableError(`op.gg ${res.status}`);
  }

  const html = await res.text();
  // 프로필 아이콘 아래 레벨 배지(op.gg): <div class="mt-[-11px] text-center"><span ...>923</span>
  const lvMatch = html.match(
    /mt-\[-11px\] text-center"><span\b[^>]*>(\d{1,4})<\/span>/,
  );
  const level = lvMatch ? Number(lvMatch[1]) : null;
  const gamesPlayed = parseSoloGames(html);
  const previousTier = parsePreviousTier(html);

  // 설명문의 솔로랭크 문장에서 티어·단계·LP를 뽑는다.
  const m = html.match(
    /current SOLORANKED rank is ([a-z]+) Division (\d+) (\d+)\s*LP/i,
  );
  const tierName = m?.[1]?.toLowerCase() ?? "";
  const tierIndex = TIER_INDEX[tierName];
  const result: SoloTier =
    m && tierIndex !== undefined
      ? {
          ranked: true,
          level,
          tierKey: tierName,
          tierIndex,
          division: Math.min(4, Math.max(1, Number(m[2]))),
          lp: Number(m[3]),
          tierName,
          gamesPlayed,
          previousTier,
        }
      : { ranked: false, level, gamesPlayed, previousTier };
  tierCache().set(riotId, { at: Date.now(), result });
  return result;
}
