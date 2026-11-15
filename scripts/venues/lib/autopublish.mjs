// Auto-publish decision (plan v3, section 6). Replaces the human approval gate of v2 with machine
// evidence plus audits. Pure function: given a venue, its claims, licence and flags, returns what to do.
//   decision: "publish" (show it), "hold" (not enough evidence yet), "hide" (take down now).
// Hide rules act immediately: licence not active, closure signal or open report, species gone on two
// consecutive checks, or evidence expired. Store claims expire after 60 days, bar and restaurant
// claims after 12 months unless reconfirmed.

import { badgeFor } from "./extract.mjs";

export const MIN_DISTINCT_SPECIES = 2;
export const PIN_MAX_M = 100;
export const STORE_CLAIM_DAYS = 60;
export const MENU_CLAIM_DAYS = 365;
export const CONSECUTIVE_MISSES_TO_HIDE = 2;
const DAY = 86400000;

export function claimMaxAgeDays(venueType) {
  return venueType === "store" ? STORE_CLAIM_DAYS : MENU_CLAIM_DAYS;
}

/**
 * @param {object} input
 * @param {object} input.venue { venue_type, chain_status, licence_status, licence_expires_on, website, pin_distance_m, closed_signals, needs_audit }
 * @param {Array}  input.claims [{ species_slug, species_group, counts, angustifolia_variant, source_kind, observed_at }]
 * @param {Array}  [input.openReports]
 * @param {number} [input.consecutiveMisses] checks in a row where the species were no longer found
 * @param {string[]} [input.pausedTypes] venue types with auto-publish paused by the audit rule
 */
export function decideVenue({ venue, claims, openReports = [], consecutiveMisses = 0, pausedTypes = [] }, now = new Date()) {
  const hide = [], hold = [];
  const today = now.toISOString().slice(0, 10);
  if (venue.licence_status && venue.licence_status !== "active") hide.push("licence_not_active");
  if (venue.licence_expires_on && venue.licence_expires_on < today) hide.push("licence_expired");
  if (Array.isArray(venue.closed_signals) && venue.closed_signals.some((s) => !s.resolved)) hide.push("closure_signal");
  if (openReports.length > 0) hide.push("open_report");
  if (consecutiveMisses >= CONSECUTIVE_MISSES_TO_HIDE) hide.push("species_gone_twice");

  const maxAge = claimMaxAgeDays(venue.venue_type) * DAY;
  const live = claims.filter((c) => c.counts && !c.angustifolia_variant && now - new Date(c.observed_at) <= maxAge);
  const distinct = [...new Set(live.map((c) => c.species_slug || c.species_group))];
  if (distinct.length < MIN_DISTINCT_SPECIES) {
    const counted = claims.filter((c) => c.counts && !c.angustifolia_variant);
    // Evidence that existed and went stale takes the venue down; never having enough just holds it.
    if (counted.length >= MIN_DISTINCT_SPECIES && live.length < MIN_DISTINCT_SPECIES) hide.push("evidence_expired");
    else hold.push("fewer_than_2_distinct_species");
  }

  if (hide.length === 0) {
    if (!venue.venue_type) hold.push("venue_type_unknown");
    if (!venue.chain_status || venue.chain_status === "unknown") hold.push("chain_status_unknown");
    if (!venue.website) hold.push("no_website");
    if (venue.pin_distance_m == null || venue.pin_distance_m > PIN_MAX_M) hold.push("pin_not_within_100m");
    if (pausedTypes.includes(venue.venue_type)) hold.push("auto_publish_paused_for_type");
  }
  const decision = hide.length ? "hide" : hold.length ? "hold" : "publish";
  const newest = live.map((c) => c.observed_at).sort().pop() ?? null;
  return {
    decision, reasons: hide.length ? hide : hold, distinct, badge: badgeFor(distinct.length),
    needs_audit: Boolean(venue.needs_audit) || distinct.length === MIN_DISTINCT_SPECIES,
    // Store wording is fixed: "Listed on their website on [date]". Never "in stock" or "on the shelf".
    listed_on: venue.venue_type === "store" && newest ? newest.slice(0, 10) : null,
  };
}
