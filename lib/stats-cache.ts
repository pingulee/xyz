// 무거운 집계(리뷰 답글 tier_records JSON 파싱)를 짧은 TTL로 메모이즈.
// force-dynamic 페이지가 매 요청마다 전체 테이블을 파싱하던 부하를 흡수한다.
// 데이터 변경(리뷰/답글/라인업 쓰기) 시 clearStatsCache()로 무효화.

type Entry = { at: number; value: unknown };

const store = new Map<string, Entry>();
const DEFAULT_TTL_MS = 60_000;

export function getCachedStat<T>(key: string, ttlMs = DEFAULT_TTL_MS): T | undefined {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.at > ttlMs) {
    store.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function setCachedStat(key: string, value: unknown): void {
  store.set(key, { at: Date.now(), value });
}

export function clearStatsCache(): void {
  store.clear();
}
