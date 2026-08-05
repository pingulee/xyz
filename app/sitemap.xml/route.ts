import { site } from "@/lib/site";

export const revalidate = 3600;

const sitemapPaths = [
  "/pages/sitemap.xml",
  "/booster/sitemap.xml",
  "/review/sitemap.xml",
  "/notice/sitemap.xml",
] as const;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/** Google Search Console에 제출할 루트 사이트맵 인덱스. */
export function GET(): Response {
  const entries = sitemapPaths
    .map((path) => `  <sitemap><loc>${escapeXml(`${site.url}${path}`)}</loc></sitemap>`)
    .join("\n");

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries,
    "</sitemapindex>",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
