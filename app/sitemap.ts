import type { MetadataRoute } from "next";
import { staticSitemapEntries } from "@/lib/sitemap";

/**
 * 정적 페이지 전용 사이트맵. DB를 전혀 건드리지 않으므로 빌드 시 프리렌더되고
 * DB가 죽어도 항상 응답한다. 핵심 페이지 크롤이 후기/부스터 조회에 인질로 잡히지
 * 않게 하려는 것이 분리의 목적이다.
 * 부스터·후기는 /booster/sitemap.xml, /review/sitemap.xml 로 따로 나간다.
 *
 * 이 경로가 GSC에서 계속 실패해 같은 내용을 /pages/sitemap.xml 로도 노출한다.
 * 자세한 배경은 app/pages/sitemap.ts 참고.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return staticSitemapEntries();
}
