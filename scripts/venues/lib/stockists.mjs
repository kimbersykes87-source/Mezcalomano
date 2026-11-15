// Brand stockist list reader (plan v3). Producers publish "where to buy" pages and store locators that
// name the bars and stores that carry them. A stockist entry is a LEAD only: it points us at a venue to
// verify with the venue's own site or catalog. It is never shown as proof. Pure parsers, no network.

const LOCATOR_HINT = /(where[-_ ]?to[-_ ]?buy|stockists?|retailers?|store[-_ ]?locator|find[-_ ]?us|find[-_ ]?a[-_ ]?store|dealers?|d[oó]nde[-_ ]?comprar|locations?|buy[-_ ]?(now|online|in[-_ ]?store)?\b)/i;
const STATE_ZIP_RE = /([A-Z][A-Za-z.' -]+?),?\s+([A-Z]{2})\s+(\d{5})(?:-\d{4})?/;

/** Links on the same site that look like a locator or stockist page. */
export function locatorLinks(html, baseUrl, limit = 3) {
  const base = new URL(baseUrl), out = [], seen = new Set([base.toString()]);
  const re = /<a\s+[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(String(html))) && out.length < limit) {
    let href;
    try { href = new URL(m[1], base); } catch { continue; }
    if (href.host !== base.host || !/^https?:$/.test(href.protocol)) continue;
    if (!LOCATOR_HINT.test(href.pathname) && !LOCATOR_HINT.test(m[2].replace(/<[^>]+>/g, " "))) continue;
    if (/\.(pdf|jpe?g|png)$/i.test(href.pathname) || seen.has(href.toString())) continue;
    seen.add(href.toString());
    out.push(href.toString());
  }
  return out;
}

/** schema.org places in JSON-LD blocks. */
export function leadsFromJsonLd(html) {
  const leads = [];
  for (const m of String(html).matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    let data;
    try { data = JSON.parse(m[1]); } catch { continue; }
    const walk = (node) => {
      if (Array.isArray(node)) return node.forEach(walk);
      if (!node || typeof node !== "object") return;
      const t = [].concat(node["@type"] ?? []).join(" ");
      if (/LocalBusiness|Store|BarOrPub|Restaurant|LiquorStore|Winery|FoodEstablishment/i.test(t) && node.name) {
        const a = node.address ?? {};
        leads.push({ name: String(node.name), address: a.streetAddress ?? null, city: a.addressLocality ?? null, state: a.addressRegion ?? null, zip: a.postalCode ?? null, website: node.url ?? null, how: "jsonld" });
      }
      Object.values(node).forEach((v) => typeof v === "object" && walk(v));
    };
    walk(data);
  }
  return leads;
}

/** Stockist.co widgets carry an id; their public API returns every location as JSON. */
export function stockistWidgetId(html) {
  const m = String(html).match(/data-stockist-widget-tag=["'](u\d+)["']|stockist\.co\/api\/v1\/(u\d+)/i);
  return m ? (m[1] ?? m[2]) : null;
}
export function leadsFromStockistJson(json) {
  return (Array.isArray(json) ? json : []).filter((l) => l?.name).map((l) => ({
    name: l.name, address: [l.address_line_1, l.address_line_2].filter(Boolean).join(" ") || null, city: l.city ?? null,
    state: l.state ?? null, zip: l.postal_code ?? null, website: l.website ?? null, phone: l.phone ?? null, how: "stockist.co",
  }));
}

/** Plain text lists: a short name line followed by a street line and a "City, ST 12345" line. */
export function leadsFromText(text) {
  const lines = String(text).split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const leads = [];
  for (let i = 1; i < lines.length; i++) {
    const m = lines[i].match(STATE_ZIP_RE);
    if (!m || lines[i].length > 90) continue;
    const sameLine = lines[i].match(/^(.{3,60}?)[,|-]\s*(\d+[^,]{3,40}),\s*(.+)$/);
    let name, address;
    if (sameLine && STATE_ZIP_RE.test(sameLine[3])) { name = sameLine[1].trim(); address = sameLine[2].trim(); }
    else if (/^\d/.test(lines[i - 1]) && i >= 2) { name = lines[i - 2]; address = lines[i - 1]; }
    else if (/^\d/.test(lines[i])) { name = lines[i - 1]; address = lines[i].split(",")[0]; }
    else continue;
    if (!name || name.length > 60 || /^\d/.test(name)) continue;
    leads.push({ name, address, city: m[1].replace(/^.*,\s*/, "").trim(), state: m[2], zip: m[3], website: null, how: "text" });
  }
  return leads;
}

const key = (l) => `${l.name}|${l.zip}`.toLowerCase();
export function dedupeLeads(leads) {
  const seen = new Map();
  for (const l of leads) if (!seen.has(key(l))) seen.set(key(l), l);
  return [...seen.values()];
}

/** WP Store Locator: the page has wpslSettings and serves stores from admin-ajax. Returns the ajax URLs to try, one per search centre. */
export const WPSL_CENTRES = [
  { st: "NY", lat: 40.7128, lng: -74.006 }, { st: "TX", lat: 30.2672, lng: -97.7431 },
  { st: "CA", lat: 34.0522, lng: -118.2437 }, { st: "CO", lat: 39.7392, lng: -104.9903 },
];
export function wpslBase(html, pageUrl) {
  if (!/wpslSettings/.test(String(html))) return null;
  return new URL("/wp-admin/admin-ajax.php", pageUrl).toString();
}
export function wpslUrls(base) {
  return WPSL_CENTRES.map((c) => `${base}?action=store_search&lat=${c.lat}&lng=${c.lng}&max_results=100&search_radius=500&autoload=1`);
}
export function leadsFromWpsl(json) {
  return (Array.isArray(json) ? json : []).filter((l) => l?.store).map((l) => ({
    name: String(l.store).replace(/&#0?38;|&amp;/g, "&").replace(/&#0?39;/g, "'"), address: l.address ?? null, city: l.city ?? null,
    state: l.state ?? null, zip: l.zip ?? null, website: l.url || null, email: l.email || null, phone: l.phone || null, how: "wpsl",
  }));
}
