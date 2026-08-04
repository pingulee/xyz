import type { MetadataRoute } from "next";
import { staticSitemapEntries } from "@/lib/sitemap";

/**
 * 정적 페이지 전용 사이트맵. DB를 전혀 건드리지 않으므로 빌드 시 프리렌더되고
 * DB가 죽어도 항상 응답한다. 핵심 페이지 크롤이 후기/부스터 조회에 인질로 잡히지
 * 않게 하려는 것이 분리의 목적이다.
 * 부스터·후기는 /booster/sitemap.xml, /review/sitemap.xml 로 따로 나간다.
 *
 * 순수 정적으로 프리렌더하면 GSC가 "가져올 수 없음"으로 실패한다. 같은 서버의
 * ISR 사이트맵(/booster, /review)은 성공하는데, 성공/실패가 정확히 정적 vs ISR
 * 경계와 일치한다. 호스팅 앞단이 정적 파일 서빙과 런타임 렌더를 다르게 처리하는
 * 것으로 보인다. 그래서 성공한 둘과 같은 ISR로 맞춘다. DB를 안 읽어 값은 늘
 * 같지만, 렌더·서빙 경로가 정적 파일이 아니게 되는 것이 목적이다.
 */
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  return staticSitemapEntries();
}
