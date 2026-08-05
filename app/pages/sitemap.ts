import type { MetadataRoute } from "next";
import { staticSitemapEntries } from "@/lib/sitemap";

/** 정적 페이지 목록. 루트 사이트맵 인덱스에서 참조한다. */
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  return staticSitemapEntries();
}
