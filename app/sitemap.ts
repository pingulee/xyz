import type { MetadataRoute } from "next";
import { navItems, services, site } from "@/lib/site";
import { getLineups } from "@/lib/lineups";
import { getLineupSlug } from "@/lib/lineup-model";
import { getReviews } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPaths = [
    "",
    ...navItems
      .filter((item) => item.href !== "/" && !item.href.startsWith("#"))
      .map((item) => item.href),
    ...services.map((service) => service.href),
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  let dynamicEntries: MetadataRoute.Sitemap = [];
  try {
    const [lineups, reviews] = await Promise.all([
      getLineups(true),
      getReviews(),
    ]);

    const lineupEntries: MetadataRoute.Sitemap = lineups.map((lineup) => ({
      url: `${site.url}/lineup/${encodeURIComponent(getLineupSlug(lineup.name))}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    const reviewEntries: MetadataRoute.Sitemap = reviews.map((review) => ({
      url: `${site.url}/reviews/${review.id}`,
      lastModified: review.createdAt ? new Date(review.createdAt) : now,
      changeFrequency: "monthly",
      priority: 0.5,
    }));

    dynamicEntries = [...lineupEntries, ...reviewEntries];
  } catch (error) {
    console.error("sitemap: failed to load dynamic entries", error);
  }

  return [...staticEntries, ...dynamicEntries];
}
