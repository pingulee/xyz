import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { getBoosterSitemapEntries } from "@/lib/booster";
import { getBoosterSlug } from "@/lib/booster-model";
import { withFallback } from "@/lib/sitemap";

/** 부스터 상세 전용 사이트맵. /booster/sitemap.xml 로 서빙된다. */
// 크롤러 요청마다 DB를 치지 않도록 1시간 캐시. 세그먼트 설정이라 리터럴이어야 한다.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const boosterList = await withFallback(getBoosterSitemapEntries(), "booster");

  return boosterList.map((booster) => ({
    url: `${site.url}/booster/${encodeURIComponent(getBoosterSlug(booster.name))}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));
}
