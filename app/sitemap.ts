import type { MetadataRoute } from "next";
import { navItems, services, site } from "@/lib/site";

/**
 * 정적 페이지 전용 사이트맵. DB를 전혀 건드리지 않으므로 빌드 시 프리렌더되고
 * DB가 죽어도 항상 응답한다. 핵심 페이지 크롤이 후기/부스터 조회에 인질로 잡히지
 * 않게 하려는 것이 분리의 목적이다.
 * 부스터·후기는 /booster/sitemap.xml, /review/sitemap.xml 로 따로 나간다.
 */

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

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    ...navItems
      .filter((item) => item.href !== "/" && !item.href.startsWith("#"))
      .map((item) => item.href),
    ...services.map((service) => service.href),
  ];

  return staticPaths.map((path) => ({
    url: `${site.url}${path}`,
    ...(staticLastModified[path]
      ? { lastModified: new Date(staticLastModified[path]) }
      : {}),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));
}
