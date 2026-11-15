#!/usr/bin/env node
// Score the matcher against a human labelled gold sheet (from gold_export.mjs).
// Precision = of rows the matcher counted, the share a person marked should count.
// Species accuracy = of rows with a match, the share where the person said the species were right.
// Recall = of rows a person says should count, the share the matcher counted.
// Usage: node scripts/venues/gold_score.mjs labelled.csv

import fs from "node:fs";
import Papa from "papaparse";
import { wilson } from "./lib/audit.mjs";

const rows = Papa.parse(fs.readFileSync(process.argv[2], "utf8"), { header: true, skipEmptyLines: true }).data
  .filter((r) => r.human_should_count);
const yes = (v) => String(v).trim().toLowerCase() === "yes";
const counted = rows.filter((r) => r.counted === "yes");
const should = rows.filter((r) => yes(r.human_should_count));
const matched = rows.filter((r) => r.matched_species);
const fmt = (label, s, t) => {
  const w = wilson(s, t);
  return `${label}: ${s}/${t}` + (t ? ` = ${(w.p * 100).toFixed(1)}% (95% CI ${(w.low * 100).toFixed(1)} to ${(w.high * 100).toFixed(1)})` : "");
};
console.log(`labelled rows: ${rows.length}`);
console.log(fmt("precision (counted rows a person agrees with)", counted.filter((r) => yes(r.human_should_count)).length, counted.length));
console.log(fmt("species accuracy (matched rows with right species)", matched.filter((r) => yes(r.human_species_correct)).length, matched.length));
console.log(fmt("recall (should-count rows the matcher counted)", should.filter((r) => r.counted === "yes").length, should.length));
const wrong = counted.filter((r) => !yes(r.human_should_count));
if (wrong.length) { console.log("false positives:"); for (const r of wrong.slice(0, 30)) console.log(`  ${r.store} | ${r.product_title} | ${r.matched_species}`); }
