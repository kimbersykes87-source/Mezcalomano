// Polite fetching for the menu stage. Obeys robots.txt and noindex, at most one
// request per second per host, conditional requests, and never works around blocks.

import { hasNoindex, isAllowed, parseRobots, USER_AGENT } from "./robots.mjs";

const lastRequestAt = new Map();
const robotsCache = new Map();
export const MIN_INTERVAL_MS = 1000;

export async function throttle(host, now = () => Date.now(), sleep = (ms) => new Promise((r) => setTimeout(r, ms))) {
  const last = lastRequestAt.get(host) || 0;
  const wait = last + MIN_INTERVAL_MS - now();
  if (wait > 0) await sleep(wait);
  lastRequestAt.set(host, now());
}

async function rawGet(url, extraHeaders = {}, timeoutMs = 15000) {
  const u = new URL(url);
  await throttle(u.host);
  return fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/pdf;q=0.9,*/*;q=0.5", ...extraHeaders },
    redirect: "follow",
    signal: AbortSignal.timeout(timeoutMs),
  });
}

async function robotsFor(url) {
  const u = new URL(url);
  if (robotsCache.has(u.origin)) return robotsCache.get(u.origin);
  let groups = [];
  try {
    const res = await rawGet(`${u.origin}/robots.txt`);
    if (res.ok) groups = parseRobots(await res.text());
  } catch { /* no robots.txt reachable: treated as allowed */ }
  robotsCache.set(u.origin, groups);
  return groups;
}

/**
 * Fetch one page politely.
 * @returns {{ok:boolean, reason?:string, status?:number, contentType?:string, body?:Buffer, text?:string, etag?:string, lastModified?:string, notModified?:boolean}}
 * reason is one of the fixed failure reasons: blocked, timeout, parse_error, or "robots" / "noindex" (skipped, not a failure).
 */
export async function politeGet(url, { etag, lastModified } = {}) {
  const u = new URL(url);
  const groups = await robotsFor(url);
  if (!isAllowed(groups, `${u.pathname}${u.search}`)) return { ok: false, reason: "robots" };
  const cond = {};
  if (etag) cond["If-None-Match"] = etag;
  if (lastModified) cond["If-Modified-Since"] = lastModified;
  let res;
  try {
    res = await rawGet(url, cond);
  } catch (err) {
    return { ok: false, reason: err?.name === "TimeoutError" ? "timeout" : "parse_error" };
  }
  if (res.status === 304) return { ok: true, notModified: true, status: 304 };
  if ([401, 403, 429].includes(res.status)) return { ok: false, reason: "blocked", status: res.status };
  if (!res.ok) return { ok: false, reason: "parse_error", status: res.status };
  const contentType = res.headers.get("content-type") || "";
  const body = Buffer.from(await res.arrayBuffer());
  const isText = /text\/html|text\/plain|xml/.test(contentType) || contentType === "";
  const text = isText ? body.toString("utf8") : undefined;
  if (hasNoindex(res.headers, text)) return { ok: false, reason: "noindex", status: res.status };
  return {
    ok: true, status: res.status, contentType, body, text,
    etag: res.headers.get("etag") || undefined,
    lastModified: res.headers.get("last-modified") || undefined,
  };
}

/** Links worth following from a venue site: menu, drinks, mezcal pages on the same host. At most `limit` pages. */
export function pickMenuLinks(html, baseUrl, limit = 5) {
  const base = new URL(baseUrl);
  const out = [];
  const seen = new Set([base.toString()]);
  const re = /<a\s+[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const hint = /(menu|carta|mezcal|drinks|bebidas|cocktail|spirits|destilad|bar\b|karta)/i;
  let m;
  while ((m = re.exec(String(html))) && out.length < limit) {
    let href;
    try { href = new URL(m[1], base); } catch { continue; }
    if (!/^https?:$/.test(href.protocol)) continue;
    const label = m[2].replace(/<[^>]+>/g, " ");
    const sameHost = href.host === base.host;
    const isPdf = /\.pdf($|\?)/i.test(href.pathname);
    if (!sameHost && !isPdf) continue;
    if (!hint.test(href.pathname) && !hint.test(label)) continue;
    const key = href.toString();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }
  return out;
}
