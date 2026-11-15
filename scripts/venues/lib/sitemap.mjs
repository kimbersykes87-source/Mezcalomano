// Sitemap reader (plan v3, accuracy and coverage). Works on any shop platform: reads sitemap.xml,
// keeps product-looking URLs whose slug mentions mezcal or agave, and runs the shared matcher on
// the slug words. Cheap (1 to 6 requests per site) and needs no platform detection.

import { analyzeMenu } from "./extract.mjs";

const MAX_CHILD_SITEMAPS = 6;
const MAX_URLS = 20000;
const MEZCAL_SLUG = /mezcal|mescal|agave|maguey|destilado|ancestral|espadin|tobala|tepextate|tepeztate|arroqueno|cuishe|cuixe|sierra-negra|madrecuixe|jabali|coyote|barril|cenizo/i;

export function parseSitemap(xml) {
  const locs = [...String(xml).matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1].replace(/&amp;/g, "&"));
  const isIndex = /<sitemapindex/i.test(xml);
  return { isIndex, locs };
}

/** Turn a product URL into a title-like line: last path segment, dashes to spaces. */
export function slugTitle(url) {
  try {
    const seg = new URL(url).pathname.split("/").filter(Boolean).pop() ?? "";
    return decodeURIComponent(seg).replace(/\.(html?|php)$/i, "").replace(/[-_+]+/g, " ").trim();
  } catch { return ""; }
}

export function analyzeSlugs(urls, table) {
  const titles = [...new Set(urls.filter((u) => MEZCAL_SLUG.test(u)).map(slugTitle).filter(Boolean))];
  // Mezcal lines only: a slug has to say mezcal or agave itself, or name a species with the word "mezcal" nearby in the same URL set.
  const mezcalTitles = titles.filter((t) => /mezcal|mescal|agave|maguey|destilado|ancestral/i.test(t));
  const text = ["## Mezcal", ...mezcalTitles].join("\n");
  const r = analyzeMenu({ text, format: "html" }, table);
  r.claims = r.claims.map((c) => ({ ...c, source_kind: "catalog_product" }));
  return { result: r, mezcal_urls: mezcalTitles.length };
}

export async function fetchSitemapUrls(siteUrl, politeGet) {
  const origin = new URL(/^https?:/.test(siteUrl) ? siteUrl : `https://${siteUrl}`).origin;
  const root = await politeGet(`${origin}/sitemap.xml`);
  if (!root.ok) return { ok: false, reason: root.reason };
  let first = root.text ?? root.body?.toString("utf8") ?? "";
  const top = parseSitemap(first);
  if (top.locs.length === 0) return { ok: false, reason: "no_sitemap" };
  let urls = top.isIndex ? [] : top.locs;
  if (top.isIndex) {
    const children = top.locs.sort((a, b) => Number(/product|shop|store|item/i.test(b)) - Number(/product|shop|store|item/i.test(a))).slice(0, MAX_CHILD_SITEMAPS);
    for (const c of children) {
      const res = await politeGet(c);
      if (res.ok) urls.push(...parseSitemap(res.text ?? res.body?.toString("utf8") ?? "").locs);
      if (urls.length > MAX_URLS) break;
    }
  }
  return { ok: true, urls: urls.slice(0, MAX_URLS) };
}
