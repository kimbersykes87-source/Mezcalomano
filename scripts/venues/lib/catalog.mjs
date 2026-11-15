// Store catalog reader (plan v3). Reads a shop's public product list (Shopify products.json or the
// WooCommerce store API) and runs the same deterministic species matcher used for bar menus.
// A store qualifies at 2 or more distinct non-espadín species in product titles. Wording on the site
// is "Listed on their website on [date]", never "in stock". No network in the pure functions.

import { analyzeMenu } from "./extract.mjs";
import { foldAccents } from "./text.mjs";

export const MAX_CATALOG_PAGES = 8;
const MEZCAL_RE = /\bmezcal(es)?\b|\bagave spirit|\bdestilado de agave\b/;
const TEQUILA_ONLY_RE = /\btequila\b/;

/** Normalize Shopify or WooCommerce JSON into { title, type, tags, vendor, available, price }. */
export function normalizeProducts(json, platform) {
  if (platform === "shopify") {
    return (json?.products ?? []).map((p) => ({
      title: String(p.title ?? ""), type: String(p.product_type ?? ""),
      tags: Array.isArray(p.tags) ? p.tags.join(" ") : String(p.tags ?? ""),
      vendor: String(p.vendor ?? ""),
      available: (p.variants ?? []).some((v) => v.available !== false),
      price: p.variants?.[0]?.price ? `$${p.variants[0].price}` : "",
    }));
  }
  if (platform === "woocommerce") {
    return (Array.isArray(json) ? json : []).map((p) => ({
      title: String(p.name ?? ""),
      type: (p.categories ?? []).map((c) => c.name).join(" "),
      tags: (p.tags ?? []).map((t) => t.name).join(" "),
      vendor: "", available: p.is_in_stock !== false,
      price: p.prices?.price ? `$${(Number(p.prices.price) / 10 ** (p.prices.currency_minor_unit ?? 2)).toFixed(2)}` : "",
    }));
  }
  return [];
}

/** True when a product looks like a mezcal bottle (not tequila, not merchandise). */
export function isMezcalProduct(p) {
  const hay = foldAccents(`${p.title} ${p.type} ${p.tags} ${p.vendor}`);
  if (MEZCAL_RE.test(hay)) return true;
  // Species or village in the title under an agave spirit type is handled by the matcher; tequila is excluded.
  return !TEQUILA_ONLY_RE.test(hay) && /\bagave\b/.test(hay);
}

/**
 * Turn mezcal products into a menu text and run the shared extractor.
 * @returns analyzeMenu result plus catalog stats; claims carry source_kind "catalog_product".
 */
export function analyzeCatalog(products, table) {
  const mezcal = products.filter(isMezcalProduct);
  const lines = ["## Mezcal", ...mezcal.map((p) => `${p.title.replace(/\s+/g, " ").trim()} ${p.price}`.trim())];
  const result = analyzeMenu({ text: lines.join("\n"), format: "html" }, table);
  const byTitle = new Map(mezcal.map((p) => [p.title.replace(/\s+/g, " ").trim(), p]));
  result.claims = result.claims.map((c) => ({ ...c, source_kind: "catalog_product", product_available: byTitle.get(c.line_text?.replace(/\s+\$[\d.]+$/, ""))?.available ?? null }));
  result.catalog = { products: products.length, mezcal_products: mezcal.length };
  if (mezcal.length === 0) return { ...result, status: "no_menu_found", failureReason: "no_menu_found" };
  return result;
}

/** Auto-verified store: 2 or more distinct non-espadín species from catalog products. */
export function storeQualifies(result) {
  return result.status === "ok" && result.distinctNonEspadin.length >= 2;
}

/** Detect platform from the site home page HTML and headers text. */
export function detectPlatform(html) {
  const h = String(html ?? "");
  if (/cdn\.shopify\.com|Shopify\.theme|myshopify\.com/i.test(h)) return "shopify";
  if (/wp-content\/plugins\/woocommerce|woocommerce/i.test(h)) return "woocommerce";
  return null;
}

export function catalogUrls(origin, platform, page = 1) {
  if (platform === "shopify") return `${origin}/products.json?limit=250&page=${page}`;
  if (platform === "woocommerce") return `${origin}/wp-json/wc/store/v1/products?per_page=100&page=${page}`;
  return null;
}

/** Fetch a store catalog politely (robots.txt, 1 request per second per host, page cap). */
export async function fetchCatalog(siteUrl, politeGet) {
  const origin = new URL(/^https?:/.test(siteUrl) ? siteUrl : `https://${siteUrl}`).origin;
  const home = await politeGet(origin);
  if (!home.ok) return { ok: false, reason: home.reason };
  const platform = detectPlatform(home.text);
  if (!platform) return { ok: false, reason: "no_catalog" };
  const products = [];
  for (let page = 1; page <= MAX_CATALOG_PAGES; page++) {
    const res = await politeGet(catalogUrls(origin, platform, page));
    if (!res.ok) { if (page === 1) return { ok: false, reason: res.reason }; break; }
    let json;
    try { json = JSON.parse(res.text ?? res.body.toString("utf8")); } catch { if (page === 1) return { ok: false, reason: "parse_error" }; break; }
    const batch = normalizeProducts(json, platform);
    products.push(...batch);
    if (batch.length < (platform === "shopify" ? 250 : 100)) break;
  }
  return { ok: true, platform, products };
}
