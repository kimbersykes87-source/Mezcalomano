// Publish rule (plan section 4.2) and the venues.geojson builder. Pure functions.

import { badgeFor } from "./extract.mjs";

export const MENU_MAX_AGE_DAYS = 90;
export const MIN_DISTINCT_SPECIES = 2;

const DAY = 24 * 60 * 60 * 1000;

/**
 * All five gates must pass.
 * venue: {status, pin_verified_at, closed_signals, ...}
 * claims: approved or other claims for this venue
 * snapshots: menu snapshots (need fetched_at, status)
 * openReports: unresolved reports for this venue
 */
export function evaluatePublishRule({ venue, claims, snapshots, openReports = [] }, now = new Date()) {
  const failures = [];
  const live = claims.filter((c) =>
    c.state === "approved" && c.kind === "species_listed" && (!c.expires_at || new Date(c.expires_at) > now));
  const distinct = new Set(live.map((c) => c.species_slug || c.species_group));
  if (distinct.size < MIN_DISTINCT_SPECIES) failures.push("fewer_than_2_distinct_species");
  const fresh = snapshots.some((s) => s.status === "ok" && now - new Date(s.fetched_at) <= MENU_MAX_AGE_DAYS * DAY);
  if (!fresh) failures.push("no_menu_snapshot_within_90_days");
  if (!venue.pin_verified_at) failures.push("pin_not_verified");
  const closedSignal = Array.isArray(venue.closed_signals) && venue.closed_signals.some((s) => !s.resolved);
  if (closedSignal || openReports.length > 0) failures.push("unresolved_closed_signal_or_report");
  if (venue.status !== "published") failures.push("not_approved_by_a_human");
  return { ok: failures.length === 0, failures, distinct: [...distinct], badge: badgeFor(distinct.size), liveClaims: live };
}

/** Build the public GeoJSON from venues that pass the rule. Approved, unexpired claims only. */
export function buildGeoJson(items, now = new Date()) {
  const features = [];
  for (const item of items) {
    const verdict = evaluatePublishRule(item, now);
    if (!verdict.ok) continue;
    const { venue } = item;
    if (typeof venue.lat !== "number" || typeof venue.lng !== "number") continue;
    const latestOk = item.snapshots.filter((s) => s.status === "ok").sort((a, b) => new Date(b.fetched_at) - new Date(a.fetched_at))[0];
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: [venue.lng, venue.lat] },
      properties: {
        slug: venue.slug,
        name: venue.name,
        city: venue.city || null,
        country_code: venue.country_code || null,
        website: venue.website || null,
        menu_url: latestOk?.url || null,
        menu_checked: latestOk ? latestOk.fetched_at.slice(0, 7) : null,
        badge: verdict.badge,
        species: verdict.distinct.sort(),
      },
    });
  }
  return { type: "FeatureCollection", features };
}
