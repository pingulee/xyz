// 무거운 집계(리뷰 답글 tier_records JSON 파싱)를 짧은 TTL로 메모이즈.
// force-dynamic 페이지가 매 요청마다 전체 테이블을 파싱하던 부하를 흡수한다.
// 데이터 변경(리뷰/답글/부스터 쓰기) 시 clearStatsCache()로 무효화.

type Entry = { at: number; value: unknown };

const store = new Map<string, Entry>();
const DEFAULT_TTL_MS = 60_000;
// 키는 기사 수(수백 규모)로 사실상 제한되지만, 재조회 안 되는 항목이 만료 후에도
// 잔류할 수 있어 상한을 둔다. 초과 시 만료분부터, 그래도 넘치면 최오래 삽입분을 제거.
const MAX_ENTRIES = 500;

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
  // 상한 초과 시 능동 eviction(무한 증가 방지). 새 키일 때만 정리한다.
  if (store.size >= MAX_ENTRIES && !store.has(key)) {
    const now = Date.now();
    for (const [k, entry] of store) {
      if (now - entry.at > DEFAULT_TTL_MS) store.delete(k);
    }
    if (store.size >= MAX_ENTRIES) {
      const oldest = store.keys().next().value; // Map은 삽입 순서 유지 → 최오래
      if (oldest !== undefined) store.delete(oldest);
    }
  }
  store.set(key, { at: Date.now(), value });
}

export function clearStatsCache(): void {
  store.clear();
}
