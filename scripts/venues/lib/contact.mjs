// Contact email finder for verified venues (plan v3 addendum). Business contact addresses only, taken
// from the venue's own website (mailto links, text on the home or contact page) or Overture Maps.
// Stored in a non public column with its source and page; never added to the public map or geojson.
// Outreach rules: B2B only, sent from hola@mezcalomano.com with a real opt out, honour removals at once.

const ROLE_PREFERENCE = ["hola", "info", "hello", "contact", "orders", "sales", "store", "shop", "bar", "events", "manager", "owner", "mezcal"];
const BAD_LOCAL = /^(noreply|no-reply|donotreply|do-not-reply|webmaster|postmaster|abuse|privacy|unsubscribe|support@shopify)/i;
const BAD_DOMAIN = /(^|\.)(example\.com|sentry\.io|wixpress\.com|sentry-next\.wixpress\.com|shopify\.com|squarespace\.com|godaddy\.com|wordpress\.com|yourdomain\.com|domain\.com|email\.com|test\.com)$/i;
const IMAGE_TAIL = /\.(png|jpe?g|gif|svg|webp|css|js)$/i;
const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}/gi;

/** Undo the common light obfuscations: [at], (at), &#64;, " at ". */
export function deobfuscate(text) {
  return String(text)
    .replace(/&#0*64;|&commat;|%40/gi, "@")
    .replace(/\s*[[(]\s*at\s*[\])]\s*/gi, "@")
    .replace(/\s*[[(]\s*dot\s*[\])]\s*/gi, ".");
}

export function extractEmails(html) {
  const text = deobfuscate(html);
  const found = new Set();
  for (const m of text.matchAll(/mailto:([^"'?\s>]+)/gi)) found.add(decodeURIComponent(m[1]).toLowerCase());
  for (const m of text.matchAll(EMAIL_RE)) found.add(m[0].toLowerCase());
  return [...found].filter((e) => {
    const [local, domain] = e.split("@");
    return local && domain && !IMAGE_TAIL.test(e) && !BAD_LOCAL.test(local) && !BAD_DOMAIN.test(domain) && local.length <= 40;
  });
}

const rootDomain = (host) => String(host).toLowerCase().replace(/^www\./, "").split(".").slice(-2).join(".");

/** Choose the best address: same domain as the venue site first, then role addresses over personal names. */
export function pickBestEmail(emails, website) {
  if (emails.length === 0) return null;
  let site = null;
  try { site = rootDomain(new URL(/^https?:/.test(website) ? website : `https://${website}`).hostname); } catch { /* no site */ }
  const score = (e) => {
    const [local, domain] = e.split("@");
    let s = 0;
    if (site && rootDomain(domain) === site) s += 100;
    const role = ROLE_PREFERENCE.indexOf(local);
    if (role >= 0) s += 50 - role;
    if (/^[a-z]+\.[a-z]+$/.test(local) && role < 0) s -= 10; // looks like a person's name
    return s;
  };
  return [...emails].sort((a, b) => score(b) - score(a))[0];
}

/** Links worth fetching for an address: contact, about, find us. */
export function contactLinks(html, baseUrl, limit = 2) {
  const base = new URL(baseUrl), out = [], seen = new Set([base.toString()]);
  const re = /<a\s+[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(String(html))) && out.length < limit) {
    let href;
    try { href = new URL(m[1], base); } catch { continue; }
    if (href.host !== base.host || !/^https?:$/.test(href.protocol)) continue;
    if (!/(contact|about|find-us|visit|hours|reach)/i.test(href.pathname + m[2].replace(/<[^>]+>/g, " "))) continue;
    if (seen.has(href.toString())) continue;
    seen.add(href.toString());
    out.push(href.toString());
  }
  return out;
}

/**
 * Find a contact email for a venue. getPage(url) returns { ok, text }. Tries the home page, then up to 2 contact links.
 * @returns {{ email, source, page } | null}
 */
export async function findContactEmail(website, getPage, overtureEmail = null) {
  const home = await getPage(website);
  const pages = [];
  if (home.ok && home.text) pages.push({ url: website, text: home.text });
  const all = new Map();
  for (const p of pages) for (const e of extractEmails(p.text)) all.set(e, p.url);
  if (all.size === 0 && home.ok && home.text) {
    for (const link of contactLinks(home.text, website)) {
      const res = await getPage(link);
      if (res.ok && res.text) for (const e of extractEmails(res.text)) all.set(e, link);
    }
  }
  const best = pickBestEmail([...all.keys()], website);
  if (best) return { email: best, source: "website", page: all.get(best) };
  if (overtureEmail) return { email: overtureEmail.toLowerCase(), source: "overture", page: null };
  return null;
}
