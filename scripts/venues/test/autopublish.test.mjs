import test from "node:test";
import assert from "node:assert/strict";
import { decideVenue } from "../lib/autopublish.mjs";

const NOW = new Date("2026-11-15T12:00:00Z");
const venue = { venue_type: "store", chain_status: "independent", licence_status: "active", licence_expires_on: "2027-03-01", website: "https://x.com", pin_distance_m: 20, closed_signals: [] };
const claim = (sp, observed_at = "2026-11-10T00:00:00Z", extra = {}) => ({ species_slug: sp, counts: true, observed_at, ...extra });

test("publishes a store with 2 fresh species and everything verified", () => {
  const d = decideVenue({ venue, claims: [claim("tobala"), claim("tepextate")] }, NOW);
  assert.equal(d.decision, "publish");
  assert.equal(d.badge, "Species listed");
  assert.equal(d.listed_on, "2026-11-10");
  assert.equal(d.needs_audit, true);
});

test("5 species earns Deep list and no automatic audit flag", () => {
  const d = decideVenue({ venue, claims: ["a", "b", "c", "d", "e"].map((s) => claim(s)) }, NOW);
  assert.equal(d.badge, "Deep list");
  assert.equal(d.needs_audit, false);
});

test("holds when the pin, website or type is missing or the type is paused", () => {
  const base = { claims: [claim("a"), claim("b")] };
  assert.deepEqual(decideVenue({ ...base, venue: { ...venue, pin_distance_m: 400 } }, NOW).reasons, ["pin_not_within_100m"]);
  assert.deepEqual(decideVenue({ ...base, venue: { ...venue, website: null } }, NOW).reasons, ["no_website"]);
  assert.deepEqual(decideVenue({ ...base, venue, pausedTypes: ["store"] }, NOW).reasons, ["auto_publish_paused_for_type"]);
  assert.equal(decideVenue({ ...base, venue: { ...venue, venue_type: null } }, NOW).decision, "hold");
});

test("hides at once for licence, closure, reports and two missed checks", () => {
  const base = { claims: [claim("a"), claim("b")], venue };
  assert.ok(decideVenue({ ...base, venue: { ...venue, licence_status: "expired" } }, NOW).reasons.includes("licence_not_active"));
  assert.ok(decideVenue({ ...base, venue: { ...venue, closed_signals: [{ resolved: false }] } }, NOW).reasons.includes("closure_signal"));
  assert.ok(decideVenue({ ...base, openReports: [{}] }, NOW).reasons.includes("open_report"));
  assert.ok(decideVenue({ ...base, consecutiveMisses: 2 }, NOW).reasons.includes("species_gone_twice"));
});

test("store evidence expires after 60 days, bar evidence after 12 months", () => {
  const old = "2026-08-01T00:00:00Z";
  assert.equal(decideVenue({ venue, claims: [claim("a", old), claim("b", old)] }, NOW).decision, "hide");
  const bar = { ...venue, venue_type: "bar" };
  assert.equal(decideVenue({ venue: bar, claims: [claim("a", old), claim("b", old)] }, NOW).decision, "publish");
});

test("angustifolia variants do not count", () => {
  const d = decideVenue({ venue, claims: [claim("a"), claim("espadilla", undefined, { angustifolia_variant: true })] }, NOW);
  assert.equal(d.decision, "hold");
});
