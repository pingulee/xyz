import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getSitemapReviewEntries } from "@/lib/review";
import { withFallback } from "@/lib/sitemap";

/**
 * 후기 상세 전용 사이트맵. /review/sitemap.xml 로 서빙된다.
 * getSitemapReviewEntries는 5000건 상한. 5만 건(사이트맵 규격 상한)에
 * 근접하면 generateSitemaps로 페이징할 것.
 */
// 크롤러 요청마다 DB를 치지 않도록 1시간 캐시. 세그먼트 설정이라 리터럴이어야 한다.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const reviewList = await withFallback(getSitemapReviewEntries(), "review");

  return reviewList.map((review) => ({
    url: `${site.url}/review/${review.id}`,
    lastModified: new Date(review.createdAt),
    changeFrequency: "monthly",
    priority: 0.5,
  }));
}
