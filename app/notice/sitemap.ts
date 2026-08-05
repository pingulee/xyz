import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getSitemapNoticeEntries } from "@/lib/notice";
import { withFallback } from "@/lib/sitemap";

/**
 * 공지 상세 전용 사이트맵. /notice/sitemap.xml 로 서빙된다.
 * 루트 사이트맵 인덱스(app/sitemap.xml/route.ts)에서 참조한다.
 */
// 크롤러 요청마다 DB를 치지 않도록 1시간 캐시. 세그먼트 설정이라 리터럴이어야 한다.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const notices = await withFallback(getSitemapNoticeEntries(), "notice");

  return notices.map((notice) => ({
    url: `${site.url}/notice/${notice.id}`,
    lastModified: new Date(notice.updatedAt),
    changeFrequency: "monthly",
    priority: 0.5,
  }));
}
