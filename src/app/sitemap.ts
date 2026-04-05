import type { MetadataRoute } from "next";
import { fetchSpeciesDirectorySegments } from "@/lib/species-list-server";
import { SITE_URL } from "@/lib/site-seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  let segments: string[] = [];
  try {
    segments = await fetchSpeciesDirectorySegments();
  } catch {
    segments = [];
  }

  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL + "/", lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/directory`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/map`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  const speciesEntries: MetadataRoute.Sitemap = segments.map((slug) => ({
    url: `${SITE_URL}/directory/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...staticEntries, ...speciesEntries];
}
