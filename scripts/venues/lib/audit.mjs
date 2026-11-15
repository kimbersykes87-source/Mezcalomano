// Weekly audit sampler and auto-publish pause rule (plan v3, section 6). Pure functions.
// 20 random published venues a week, spread across venue types, plus every venue flagged needs_audit.
// Two audit misses in a rolling month pause auto-publish for that venue type.

export const AUDIT_SIZE = 20;
export const PAUSE_AFTER_MISSES = 2;
export const WINDOW_DAYS = 30;

/** Deterministic PRNG so a sample can be reproduced from its seed. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Sample n venues, round robin across venue types; flagged venues are always included first. */
export function pickAudit(venues, { n = AUDIT_SIZE, seed = 1 } = {}) {
  const rand = mulberry32(seed);
  const flagged = venues.filter((v) => v.needs_audit);
  const rest = venues.filter((v) => !v.needs_audit);
  const buckets = new Map();
  for (const v of rest) {
    if (!buckets.has(v.venue_type)) buckets.set(v.venue_type, []);
    buckets.get(v.venue_type).push(v);
  }
  for (const list of buckets.values()) list.sort(() => rand() - 0.5);
  const picked = [...flagged];
  const lists = [...buckets.values()];
  let i = 0;
  while (picked.length < n && lists.some((l) => l.length)) {
    const l = lists[i % lists.length];
    if (l.length) picked.push(l.pop());
    i++;
  }
  return picked.slice(0, Math.max(n, flagged.length));
}

/** audits: [{ venue_type, result: "ok"|"miss", at: ISO date }]. Returns venue types whose auto-publish is paused. */
export function pausedTypes(audits, today = new Date().toISOString().slice(0, 10)) {
  const cutoff = new Date(Date.parse(today) - WINDOW_DAYS * 86400000).toISOString().slice(0, 10);
  const misses = new Map();
  for (const a of audits) {
    if (a.result === "miss" && a.at >= cutoff) misses.set(a.venue_type, (misses.get(a.venue_type) ?? 0) + 1);
  }
  return [...misses.entries()].filter(([, n]) => n >= PAUSE_AFTER_MISSES).map(([t]) => t);
}

/** Wilson score interval for a proportion, used to report precision from the gold set. */
export function wilson(successes, total, z = 1.96) {
  if (total === 0) return { p: null, low: null, high: null };
  const p = successes / total;
  const d = 1 + (z * z) / total;
  const c = p + (z * z) / (2 * total);
  const m = z * Math.sqrt((p * (1 - p)) / total + (z * z) / (4 * total * total));
  return { p, low: (c - m) / d, high: (c + m) / d };
}
