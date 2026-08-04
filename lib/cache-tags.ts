import { revalidatePath, revalidateTag } from "next/cache";
import { clearStatsCache } from "@/lib/stats-cache";

/**
 * 요청 간 데이터 캐시 태그.
 *
 * force-dynamic 페이지는 요청마다 DB를 다시 읽는다. 세션과 무관한 조회는
 * 방문자마다 같은 결과이므로 캐시하고, 쓰기 경로에서 태그를 무효화해
 * 즉시 최신값이 보이게 한다.
 *
 * 캐시 대상 선정 기준 두 가지.
 *
 * 1. 키 종류가 적고 쿼리가 무거운 것만 고른다. 후기별로 키가 갈리는
 *    조회(후기 단건·관련 후기·이전/다음)는 1,600여 개의 캐시 항목이 생겨
 *    디스크만 먹으므로 캐시하지 않는다. 그쪽은 왕복 자체를 줄여뒀다.
 *
 * 2. 자기 글을 바로 확인해야 하는 조회는 캐시하지 않는다. Next 16의
 *    revalidateTag는 stale-while-revalidate라 무효화 직후 첫 읽기가 낡은
 *    값을 받는다. 즉시 만료시키는 updateTag는 Server Action 전용이라
 *    라우트 핸들러에서는 던진다. 그래서 후기 목록(getReviewPage)은 캐시
 *    대상에서 뺀다. 후기를 쓰고 목록에서 안 보이는 일이 없어야 한다.
 */
export const CACHE_TAGS = {
  /** 후기·답글 데이터. 기사 목록의 평점·전적 집계도 여기에 딸려 있다. */
  reviews: "reviews",
  /** 기사 프로필 데이터. */
  boosters: "boosters",
} as const;

/**
 * 태그 무효화가 한 군데라도 빠지면 낡은 값이 남는다. 그 경우에도 오래
 * 굳지 않도록 두는 안전망. 정상 경로에서는 쓰기 즉시 무효화된다.
 */
export const CACHE_MAX_AGE_SECONDS = 300;

/**
 * 후기·답글을 쓴 뒤 호출한다.
 * 인프로세스 집계 캐시(stats-cache)와 요청 간 데이터 캐시를 항상 함께 비운다.
 * 둘을 따로 호출하면 한쪽만 빠뜨리기 쉬워 한 함수로 묶는다.
 */
export function invalidateReviewCaches(reviewId?: number | string): void {
  clearStatsCache();
  revalidateTag(CACHE_TAGS.reviews, "max");
  // 후기 상세(review/[id])는 ISR로 페이지 HTML이 렌더 캐시된다. 태그 무효화는
  // unstable_cache로 감싼 목록류만 지우고 페이지 HTML은 못 지우므로, 수정·삭제·
  // 답글이 즉시 반영되도록 해당 경로를 직접 무효화한다. (기사 상세의 집계 지연은
  // revalidate 안전망으로 흡수 — 답글 즉시성은 후기 상세 쪽이 핵심이다.)
  if (reviewId) {
    revalidatePath(`/review/${reviewId}`);
  }
}

/** 기사 정보를 쓴 뒤 호출한다. */
export function invalidateBoosterCaches(): void {
  clearStatsCache();
  revalidateTag(CACHE_TAGS.boosters, "max");
}
