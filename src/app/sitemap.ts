import type { MetadataRoute } from "next";
import { fetchSpeciesDirectorySegments } from "@/lib/species-list-server";
import { SITE_URL } from "@/lib/site-seo";
import { CONTENT_DATES, dateOnly, laterOf } from "@/lib/content-dates";
import { hasPublishedPosts, publishedPosts } from "@/lib/small-pours";

/** lastmod comes from real content dates. changefreq and priority are left out: Google ignores them. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let segments: string[] = [];
  try {
    segments = await fetchSpeciesDirectorySegments();
  } catch {
    segments = [];
  }

  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL + "/", lastModified: dateOnly(CONTENT_DATES.home) },
    { url: `${SITE_URL}/about`, lastModified: dateOnly(CONTENT_DATES.about) },
    { url: `${SITE_URL}/contact`, lastModified: dateOnly(CONTENT_DATES.contact) },
    { url: `${SITE_URL}/directory`, lastModified: dateOnly(CONTENT_DATES.directory) },
    { url: `${SITE_URL}/map`, lastModified: dateOnly(CONTENT_DATES.map) },
    { url: `${SITE_URL}/press`, lastModified: dateOnly(CONTENT_DATES.press) },
    { url: `${SITE_URL}/sources`, lastModified: dateOnly(CONTENT_DATES.sources) },
  ];

  const speciesEntries: MetadataRoute.Sitemap = segments.map((slug) => ({
    url: `${SITE_URL}/directory/${slug}`,
    lastModified: dateOnly(CONTENT_DATES.speciesData),
  }));

  // Only published posts are listed, so a post joins the sitemap the day its status becomes "published".
  const posts = hasPublishedPosts() ? publishedPosts() : [];
  const latestPost = posts.reduce((d, e) => laterOf(d, laterOf(e.updated, e.published)), "1970-01-01");
  const diaryEntries: MetadataRoute.Sitemap = posts.length
    ? [
        { url: `${SITE_URL}/small-pours`, lastModified: dateOnly(latestPost) },
        ...posts.map((e) => ({
          url: `${SITE_URL}/small-pours/${e.slug}`,
          lastModified: dateOnly(laterOf(e.updated, e.published)),
        })),
      ]
    : [];

  return [...staticEntries, ...diaryEntries, ...speciesEntries];
}
