import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /admax는 관리자 로그아웃 리디렉트 라우트다. 크롤 대상이 아니다.
        disallow: ["/admin", "/admax", "/login", "/api/"],
      },
    ],
    // 사이트맵은 용도별로 분리되어 있다. robots.txt는 Sitemap 지시자 복수 줄을
    // 허용하고 검색엔진이 전부 읽으므로 별도 인덱스 파일은 두지 않는다.
    sitemap: [
      `${site.url}/sitemap.xml`,
      // 루트 /sitemap.xml 이 GSC 재시도 큐에 실패로 잡혀 있어, 실패 이력이 없는
      // 새 경로로 같은 정적 목록을 한 벌 더 노출한다. robots.txt 등록이므로
      // 사이트맵의 디렉토리 스코프 제한은 적용되지 않는다.
      `${site.url}/pages/sitemap.xml`,
      `${site.url}/booster/sitemap.xml`,
      `${site.url}/review/sitemap.xml`,
    ],
    host: site.url,
  };
}
