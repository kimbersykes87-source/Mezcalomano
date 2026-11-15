// Website finder (plan v3). Matches a licence record to an Overture Maps place to get a website.
// Match rule: names agree (token overlap) AND the place is within 150 m, or, when either has no
// coordinates, the zip code agrees and names agree strongly. Pure functions; Overture data is
// supplied by the caller. Overture places are CDLA Permissive 2.0; the source id is stored for attribution.

import { foldAccents, normalizeVenueName } from "./text.mjs";

export const MAX_DISTANCE_M = 150;
const CELL = 0.01; // degrees, about 1.1 km

const tokens = (name) => new Set(normalizeVenueName(foldAccents(name)).split(" ").filter((t) => t.length > 1));

export function nameScore(a, b) {
  const A = tokens(a), B = tokens(b);
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / Math.min(A.size, B.size);
}

/** Strict overlap used when there is no distance check: shared tokens over all tokens. */
export function jaccard(a, b) {
  const A = tokens(a), B = tokens(b);
  const union = new Set([...A, ...B]).size;
  if (union === 0) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / union;
}

export function haversineM(lat1, lng1, lat2, lng2) {
  const R = 6371000, rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1), dLng = rad(lng2 - lng1);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const cellKey = (lat, lng) => `${Math.floor(lat / CELL)}:${Math.floor(lng / CELL)}`;

/** Index places by grid cell and by zip. Only places with a website are useful. */
export function indexPlaces(places) {
  const grid = new Map(), byZip = new Map();
  for (const p of places) {
    if (!p.website) continue;
    if (Number.isFinite(p.lat) && Number.isFinite(p.lng)) {
      const k = cellKey(p.lat, p.lng);
      if (!grid.has(k)) grid.set(k, []);
      grid.get(k).push(p);
    }
    const z = String(p.zip ?? "").slice(0, 5);
    if (z) { if (!byZip.has(z)) byZip.set(z, []); byZip.get(z).push(p); }
  }
  return { grid, byZip };
}

/** Best website for a licence record, or null. Returns { website, place_id, score, distance_m, how }. */
export function findWebsite(record, index) {
  let best = null;
  if (Number.isFinite(record.lat) && Number.isFinite(record.lng)) {
    const cx = Math.floor(record.lat / CELL), cy = Math.floor(record.lng / CELL);
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      for (const p of index.grid.get(`${cx + dx}:${cy + dy}`) ?? []) {
        const d = haversineM(record.lat, record.lng, p.lat, p.lng);
        if (d > MAX_DISTANCE_M) continue;
        const s = nameScore(record.name, p.name);
        if (s >= 0.5 && (!best || s > best.score || (s === best.score && d < best.distance_m))) {
          best = { website: p.website, place_id: p.id, score: s, distance_m: Math.round(d), how: "name_and_distance" };
        }
      }
    }
  }
  if (!best && record.zip) {
    for (const p of index.byZip.get(String(record.zip).slice(0, 5)) ?? []) {
      const s = jaccard(record.name, p.name);
      if (s >= 0.99 && (!best || s > best.score)) best = { website: p.website, place_id: p.id, score: s, distance_m: null, how: "name_and_zip" };
    }
  }
  return best;
}

/** Keep only plain website homepages; drop social, maps and delivery marketplaces. */
const BAD_HOST = /(^|\.)(facebook|instagram|yelp|tripadvisor|google|goo\.gl|ubereats|doordash|grubhub|toasttab|squareup|opentable|linktr\.ee|twitter|x|tiktok)\.com$/i;
export function cleanWebsite(url) {
  try {
    const u = new URL(/^https?:/.test(url) ? url : `https://${url}`);
    if (BAD_HOST.test(u.hostname)) return null;
    return u.origin;
  } catch { return null; }
}
