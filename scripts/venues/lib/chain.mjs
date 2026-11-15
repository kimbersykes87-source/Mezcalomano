// Chain labelling (plan v3 decision 7, assumption pending Kimber's confirmation).
// A venue is a chain when the same normalized name or the same website domain appears at
// CHAIN_THRESHOLD or more US locations in the data, or when it is on the national chain list.

import { normalizeVenueName, foldAccents } from "./text.mjs";

export const CHAIN_THRESHOLD = 4;

// Starter list of national liquor retail and restaurant chains; extend by editing, never by guessing.
export const NATIONAL_CHAINS = [
  "total wine", "bevmo", "binnys", "spec's", "specs", "twin liquors", "abc fine wine", "liquor barn",
  "red lobster", "olive garden", "chilis", "applebees", "outback", "tgi fridays", "buffalo wild wings",
  "hooters", "dave and busters", "cheesecake factory", "p f changs", "texas roadhouse", "ruth's chris",
];

const nameKey = (n) => normalizeVenueName(n).replace(/\b(no|number)\s*\d+\b|#\s*\d+|\b\d+\b/g, "").replace(/\s+/g, " ").trim();
const domainKey = (w) => {
  if (!w) return null;
  try { return new URL(/^https?:/.test(w) ? w : `https://${w}`).hostname.replace(/^www\./, "").toLowerCase(); }
  catch { return null; }
};

/** Count locations per name key and per domain across all records, then label each. */
export function labelChains(records, threshold = CHAIN_THRESHOLD) {
  const byName = new Map();
  const byDomain = new Map();
  for (const r of records) {
    const k = nameKey(r.name);
    if (k) byName.set(k, (byName.get(k) ?? 0) + 1);
    const d = domainKey(r.website);
    if (d) byDomain.set(d, (byDomain.get(d) ?? 0) + 1);
  }
  const national = NATIONAL_CHAINS.map((n) => foldAccents(n).replace(/[^a-z0-9]+/g, " ").trim());
  return records.map((r) => {
    const k = nameKey(r.name);
    const d = domainKey(r.website);
    const folded = foldAccents(r.name).replace(/[^a-z0-9]+/g, " ").trim();
    const isNational = national.some((n) => folded === n || folded.startsWith(`${n} `));
    const isChain = isNational || (k && (byName.get(k) ?? 0) >= threshold) || (d && (byDomain.get(d) ?? 0) >= threshold);
    return { ...r, chain_status: isChain ? "chain" : "independent" };
  });
}
