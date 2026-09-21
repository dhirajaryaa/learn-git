import type { MetadataRoute } from "next";
import { allCommands } from "@/data";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/map`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const commandPages: MetadataRoute.Sitemap = allCommands.map((c) => ({
    url: `${SITE_URL}/commands/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...commandPages];
}