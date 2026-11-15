import test from "node:test";
import assert from "node:assert/strict";
import { pickAudit, pausedTypes, wilson } from "../lib/audit.mjs";
import { prefilter, prefilterReason } from "../lib/prefilter.mjs";

const venues = (type, n, flagged = 0) => Array.from({ length: n }, (_, i) => ({ id: `${type}${i}`, venue_type: type, needs_audit: i < flagged }));

test("audit sample is 20, spread across types, includes flagged, and is reproducible", () => {
  const all = [...venues("store", 100, 2), ...venues("bar", 100), ...venues("restaurant", 100)];
  const a = pickAudit(all, { seed: 7 });
  assert.equal(a.length, 20);
  assert.equal(a.filter((v) => v.needs_audit).length, 2);
  for (const t of ["store", "bar", "restaurant"]) assert.ok(a.some((v) => v.venue_type === t));
  assert.deepEqual(pickAudit(all, { seed: 7 }).map((v) => v.id), a.map((v) => v.id));
});

test("two misses in 30 days pause a venue type", () => {
  const audits = [
    { venue_type: "store", result: "miss", at: "2026-11-01" },
    { venue_type: "store", result: "miss", at: "2026-11-10" },
    { venue_type: "bar", result: "miss", at: "2026-11-10" },
    { venue_type: "bar", result: "miss", at: "2026-09-01" },
  ];
  assert.deepEqual(pausedTypes(audits, "2026-11-15"), ["store"]);
});

test("wilson interval", () => {
  const w = wilson(19, 20);
  assert.ok(w.low > 0.73 && w.high < 1.0 && w.p === 0.95);
  assert.equal(wilson(0, 0).p, null);
});

test("prefilter drops grocery and gas but keeps liquor stores", () => {
  assert.equal(prefilterReason("Shell Food Mart"), "grocery_or_convenience");
  assert.equal(prefilterReason("7-Eleven #123"), "grocery_or_convenience");
  assert.equal(prefilterReason("Hollywood Wine & Spirits Market"), null);
  const { kept, dropped } = prefilter([{ name: "Chevron", venue_type: "store" }, { name: "Joe's Bar", venue_type: "bar" }]);
  assert.equal(kept.length, 1);
  assert.equal(dropped[0].drop_reason, "grocery_or_convenience");
});
