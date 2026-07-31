/**
 * 사이트맵 공용 설정/헬퍼.
 *
 * 사이트맵은 용도별로 분리해 서빙한다(정적 페이지 / 부스터 / 후기).
 * 하나로 합치면 DB 조회 하나가 늦어질 때 정적 페이지 URL까지 함께 죽고,
 * GSC가 사이트맵 단위로만 상태를 보고하므로 어느 쪽이 실패했는지 알 수 없다.
 */

// 캐시 주기는 각 sitemap.ts에서 `export const revalidate = 3600` 리터럴로 선언한다.
// 라우트 세그먼트 설정은 정적 분석 대상이라 여기서 상수로 빼 import하면
// "Invalid segment configuration export" 로 빌드가 깨진다.

const DB_TIMEOUT_MS = 5000;

/**
 * DB 조회에 상한을 둔다. 조회가 에러 없이 매달리면 try/catch로는 못 잡고
 * 사이트맵 응답 자체가 검색엔진 페처 타임아웃("가져올 수 없음")으로 이어진다.
 * 실패·지연 시 빈 배열로 떨어뜨려 200 응답은 반드시 내보낸다.
 */
export async function withFallback<T>(
  promise: Promise<T[]>,
  label: string,
): Promise<T[]> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T[]>((resolve) => {
    timer = setTimeout(() => {
      console.error(`sitemap: ${label} ${DB_TIMEOUT_MS}ms 초과 — 항목 생략`);
      resolve([]);
    }, DB_TIMEOUT_MS);
  });

  try {
    return await Promise.race([promise, timeout]);
  } catch (error) {
    console.error(`sitemap: ${label} 조회 실패 — 항목 생략`, error);
    return [];
  } finally {
    clearTimeout(timer);
  }
}
