import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/login", "/api/"],
      },
    ],
    // 사이트맵은 용도별로 분리되어 있다. robots.txt는 Sitemap 지시자 복수 줄을
    // 허용하고 검색엔진이 전부 읽으므로 별도 인덱스 파일은 두지 않는다.
    sitemap: [
      `${site.url}/sitemap.xml`,
      `${site.url}/booster/sitemap.xml`,
      `${site.url}/review/sitemap.xml`,
    ],
    host: site.url,
  };
}
