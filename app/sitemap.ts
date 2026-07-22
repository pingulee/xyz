import type { MetadataRoute } from "next";
import { navItems, services, site } from "@/lib/site";
import { getLineups } from "@/lib/lineups";
import { getLineupSlug } from "@/lib/lineup-model";
import { getReviewSitemapEntries } from "@/lib/reviews";

export const dynamic = "force-dynamic";

// 정적 페이지의 실제 콘텐츠 변경일. 요청 시각을 lastModified로 사용하면
// 검색엔진에 매번 잘못된 갱신 신호를 보내므로 콘텐츠 수정 시에만 갱신한다.
const staticLastModified: Record<string, string> = {
  "": "2026-07-22",
  "/lineup": "2026-07-21",
  "/reviews": "2026-07-22",
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

  let dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const [lineups, reviews] = await Promise.all([
      getLineups(true),
      getReviewSitemapEntries(),
    ]);

    const lineupEntries: MetadataRoute.Sitemap = lineups.map((lineup) => ({
      url: `${site.url}/lineup/${encodeURIComponent(getLineupSlug(lineup.name))}`,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    const reviewEntries: MetadataRoute.Sitemap = reviews.map((review) => ({
      url: `${site.url}/reviews/${review.id}`,
      lastModified: new Date(review.createdAt),
      changeFrequency: "monthly",
      priority: 0.5,
    }));

    dynamicEntries = [...lineupEntries, ...reviewEntries];
  } catch (error) {
    console.error("sitemap: failed to load dynamic entries", error);
  }

  return [...staticEntries, ...dynamicEntries];
}
