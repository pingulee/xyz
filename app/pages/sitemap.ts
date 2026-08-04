import type { MetadataRoute } from "next";
import { staticSitemapEntries } from "@/lib/sitemap";

/**
 * 정적 페이지 사이트맵의 대체 경로(/pages/sitemap.xml).
 *
 * 루트 /sitemap.xml 이 GSC에서 계속 "가져올 수 없음"이다. 원인은 서버나
 * 내용이 아니라(자식 /booster·/review sitemap이 같은 서버·같은 형식으로
 * 성공한다) GSC가 7/31 첫 제출 때의 실패 레코드를 긴 재시도 큐에 잡고
 * 있는 것으로 보인다. 마지막 읽은 날짜가 비어 있어 한 번도 성공한 적이 없다.
 *
 * 성공한 자식들과 같은 방식(중첩 경로 = 실패 이력 없는 새 URL)으로 같은
 * 내용을 한 벌 더 노출한다. robots.txt에 등록하므로 사이트맵의 디렉토리
 * 스코프 제한은 적용되지 않는다(구글 문서 확인).
 * 루트 /sitemap.xml 도 그대로 둔다. 관례적으로 그 경로를 먼저 찾는
 * 크롤러가 있고, 유지 비용이 없다.
 *
 * 순수 정적이 아니라 ISR로 둔다. 성공하는 /booster·/review sitemap 이 ISR이고
 * 실패하는 순수 정적 사이트맵과 서빙 경로가 다르기 때문이다(app/sitemap.ts 참고).
 */
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  return staticSitemapEntries();
}
