import type { MetadataRoute } from "next";
import { navItems, services, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    ...navItems
      .filter((item) => item.href !== "/" && !item.href.startsWith("#"))
      .map((item) => item.href),
    ...services.map((service) => service.href),
  ];

  return paths.map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.8,
  }));
}
