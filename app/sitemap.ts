import type { MetadataRoute } from "next";
import { navItems, services, site } from "@/lib/site";
import { getBoosterList } from "@/lib/booster";
import { getBoosterSlug } from "@/lib/booster-model";
import { getSitemapReviewEntries } from "@/lib/review";

// 사이트맵은 실시간성이 필요 없다. force-dynamic이면 크롤러가 칠 때마다
// ensureSchema(DDL) + 리뷰 수천 행 + 부스터 집계 JOIN을 다시 돌려 응답이 늦어지고,
// 검색엔진 페처 타임아웃("가져올 수 없음")으로 이어진다. 1시간 ISR로 캐시한다.
export const revalidate = 3600;

// DB가 응답하지 않아도 정적 URL은 반드시 내보내야 한다. 조회 하나가 매달리면
// 사이트맵 전체가 타임아웃되므로 상한을 두고 실패 시 빈 배열로 떨어뜨린다.
const DB_TIMEOUT_MS = 5000;

async function withFallback<T>(
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

// 정적 페이지의 실제 콘텐츠 변경일. 요청 시각을 lastModified로 사용하면
// 검색엔진에 매번 잘못된 갱신 신호를 보내므로 콘텐츠 수정 시에만 갱신한다.
const staticLastModified: Record<string, string> = {
  "": "2026-07-22",
  "/booster": "2026-07-22",
  "/review": "2026-07-22",
  "/recruit": "2026-07-21",
  "/boosting": "2026-07-21",
  "/duo": "2026-07-21",
  "/account": "2026-07-21",
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "",
    ...navItems
      .filter((item) => item.href !== "/" && !item.href.startsWith("#"))
      .map((item) => item.href),
    ...services.map((service) => service.href),
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${site.url}${path}`,
    ...(staticLastModified[path]
      ? { lastModified: new Date(staticLastModified[path]) }
      : {}),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  // 두 조회는 서로 독립적으로 실패해야 한다. 한쪽이 죽어도 다른 쪽 URL은 살린다.
  const [boosterList, reviewList] = await Promise.all([
    withFallback(getBoosterList(true), "booster"),
    withFallback(getSitemapReviewEntries(), "review"),
  ]);

  const boosterEntries: MetadataRoute.Sitemap = boosterList.map((booster) => ({
    url: `${site.url}/booster/${encodeURIComponent(getBoosterSlug(booster.name))}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const reviewEntries: MetadataRoute.Sitemap = reviewList.map((review) => ({
    url: `${site.url}/review/${review.id}`,
    lastModified: new Date(review.createdAt),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticEntries, ...boosterEntries, ...reviewEntries];
}
