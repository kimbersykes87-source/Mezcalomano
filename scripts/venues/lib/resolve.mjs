// Entity resolution helpers (plan section 6, stage 2). Pure functions.
// The database does the heavy lifting with pg_trgm; these rules are the same
// logic in JavaScript so they can be tested without a database.

import { geohash, haversineMeters } from "./geo.mjs";
import { normalizeVenueName } from "./text.mjs";

/** Domains that are not a venue's own website, so they never act as a merge key. */
export const AGGREGATOR_DOMAINS = [
  "instagram.com", "facebook.com", "fb.com", "linktr.ee", "linktree.com", "beacons.ai", "tiktok.com", "twitter.com", "x.com",
  "tripadvisor.com", "yelp.com", "google.com", "maps.google.com", "goo.gl", "g.page", "foursquare.com",
  "opentable.com", "resy.com", "thefork.com", "quandoo.com", "sevenrooms.com", "tock.com", "toasttab.com", "squareup.com", "square.site",
  "doordash.com", "ubereats.com", "grubhub.com", "glovoapp.com", "deliveroo.com", "justeat.com", "wolt.com",
  "wixsite.com", "business.site", "carta.menu", "menu.app", "qr.menu", "bit.ly", "wa.me", "whatsapp.com",
];

export function websiteDomain(url) {
  if (!url) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);
    return u.hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}

export function isAggregatorDomain(domain) {
  if (!domain) return false;
  return AGGREGATOR_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`));
}

/** Domain usable as a merge key, or null (aggregators and missing sites). */
export function mergeKeyDomain(url) {
  const d = websiteDomain(url);
  return d && !isAggregatorDomain(d) ? d : null;
}

function trigrams(s) {
  const padded = `  ${s} `;
  const set = new Set();
  for (let i = 0; i < padded.length - 2; i++) set.add(padded.slice(i, i + 3));
  return set;
}

/** Trigram similarity like pg_trgm similarity(): shared trigrams over all trigrams. */
export function trigramSimilarity(a, b) {
  const A = trigrams(a), B = trigrams(b);
  if (A.size === 0 || B.size === 0) return 0;
  let shared = 0;
  for (const t of A) if (B.has(t)) shared++;
  return shared / (A.size + B.size - shared);
}

/**
 * Compare two venues. Returns null when they are clearly different, or a review
 * item. There is no auto merge: every pair goes to merge_review for a person.
 * Chains keep one row per address, so identical names far apart are not a match.
 */
export function comparePair(a, b) {
  const na = normalizeVenueName(a.name), nb = normalizeVenueName(b.name);
  const similarity = trigramSimilarity(na, nb);
  let meters = null;
  if ([a.lat, a.lng, b.lat, b.lng].every((v) => typeof v === "number")) {
    meters = haversineMeters(a.lat, a.lng, b.lat, b.lng);
  }
  const nearby = meters !== null && meters <= 150;
  const sameCell = a.lat != null && b.lat != null && geohash(a.lat, a.lng, 7) === geohash(b.lat, b.lng, 7);
  const keyA = mergeKeyDomain(a.website), keyB = mergeKeyDomain(b.website);
  const sameDomain = keyA && keyA === keyB;

  const reasons = [];
  if ((nearby || sameCell) && similarity >= 0.45) reasons.push("near_and_similar_name");
  if (sameDomain && (nearby || meters === null)) reasons.push("same_domain_same_place");
  if (na === nb && nearby) reasons.push("same_name_same_place");
  if (reasons.length === 0) return null;
  return { similarity: Number(similarity.toFixed(3)), distance_m: meters === null ? null : Math.round(meters), reason: reasons.join(",") };
}
