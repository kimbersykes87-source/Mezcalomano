import type { MetadataRoute } from "next";
import { fetchSpeciesDirectorySegments } from "@/lib/species-list-server";
import { SITE_URL } from "@/lib/site-seo";
import { hasPublishedDiaries, publishedDiaries } from "@/lib/diaries";

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
    { url: `${SITE_URL}/press`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/sources`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const speciesEntries: MetadataRoute.Sitemap = segments.map((slug) => ({
    url: `${SITE_URL}/directory/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const diaryEntries: MetadataRoute.Sitemap = hasPublishedDiaries()
    ? [
        { url: `${SITE_URL}/diaries`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 },
        ...publishedDiaries().map((e) => ({
          url: `${SITE_URL}/diaries/${e.slug}`,
          lastModified: new Date(e.updated + "T12:00:00Z"),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        })),
      ]
    : [];

  return [...staticEntries, ...diaryEntries, ...speciesEntries];
}
