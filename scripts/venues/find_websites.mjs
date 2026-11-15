#!/usr/bin/env node
// Attach websites to licence records from an Overture places CSV.
// Usage: node scripts/venues/find_websites.mjs places.csv [NY TX CA CO]
// Reads and rewrites .cache/venues/licences/<STATE>.json, adding website, website_match.

import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import { cleanWebsite, findWebsite, indexPlaces } from "./lib/website_finder.mjs";

const DIR = path.resolve(".cache/venues/licences");
const [csvPath, ...rest] = process.argv.slice(2);
if (!csvPath) { console.error("usage: find_websites.mjs places.csv [STATES]"); process.exit(1); }
const places = Papa.parse(fs.readFileSync(csvPath, "utf8"), { header: true, skipEmptyLines: true, dynamicTyping: false }).data
  .map((p) => ({ ...p, lat: Number(p.lat), lng: Number(p.lng), website: cleanWebsite(p.website) }));
const states = (rest.length ? rest : ["NY", "TX", "CA", "CO"]).map((s) => s.toUpperCase());
for (const st of states) {
  const index = indexPlaces(places.filter((p) => p.region === st));
  const file = path.join(DIR, `${st}.json`);
  const rows = JSON.parse(fs.readFileSync(file, "utf8"));
  let found = 0;
  for (const r of rows) {
    const m = findWebsite(r, index);
    if (m) { r.website = m.website; r.website_match = { place_id: m.place_id, score: m.score, how: m.how, distance_m: m.distance_m }; found++; }
  }
  fs.writeFileSync(file, JSON.stringify(rows));
  const stores = rows.filter((r) => r.venue_type === "store");
  console.log(`${st}: websites for ${found} of ${rows.length}; stores ${stores.filter((r) => r.website).length} of ${stores.length}`);
}
