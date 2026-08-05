import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/login",
          "/signup",
          "/mypage",
          "/find-username",
          "/reset-password",
          "/api/",
        ],
      },
    ],
    // 루트 인덱스가 정적 페이지·부스터·후기 사이트맵을 모두 참조한다.
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
