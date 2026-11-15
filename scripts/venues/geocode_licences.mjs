#!/usr/bin/env node
// Fill lat/lng for licence records that have none, using the free US Census batch geocoder
// (no key, 10,000 rows per request). Usage: node scripts/venues/geocode_licences.mjs [TX CA]
// Reads and rewrites .cache/venues/licences/<STATE>.json. Adds geocode_match: Exact, Non_Exact or none.

import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import { USER_AGENT } from "./lib/robots.mjs";

const DIR = path.resolve(".cache/venues/licences");
const URL_ = "https://geocoding.geo.census.gov/geocoder/locations/addressbatch";
const BATCH = 5000;

async function batch(rows) {
  const csv = rows.map((r) => [r.i, r.address, r.city, r.licence_state, r.zip].map((v) => `"${String(v ?? "").replace(/"/g, "")}"`).join(",")).join("\n");
  const form = new FormData();
  form.append("addressFile", new Blob([csv], { type: "text/csv" }), "a.csv");
  form.append("benchmark", "Public_AR_Current");
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(URL_, { method: "POST", body: form, headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(600000) });
      if (res.ok) return Papa.parse((await res.text()).trim(), { skipEmptyLines: true }).data;
    } catch { /* retry */ }
    await new Promise((r) => setTimeout(r, 5000 * attempt));
  }
  return [];
}

const states = (process.argv.slice(2).length ? process.argv.slice(2) : ["TX", "CA"]).map((s) => s.toUpperCase());
for (const st of states) {
  const file = path.join(DIR, `${st}.json`);
  const rows = JSON.parse(fs.readFileSync(file, "utf8"));
  const todo = rows.map((r, i) => ({ ...r, i })).filter((r) => r.lat == null && r.address);
  console.log(`${st}: ${todo.length} to geocode of ${rows.length}`);
  let done = 0;
  for (let k = 0; k < todo.length; k += BATCH) {
    const out = await batch(todo.slice(k, k + BATCH));
    for (const o of out) {
      const row = rows[Number(o[0])];
      if (!row) continue;
      if (o[2] === "Match" && o[5]) {
        const [lng, lat] = o[5].split(",").map(Number);
        row.lat = lat; row.lng = lng; row.geocode_match = o[3];
      } else row.geocode_match = "none";
    }
    done += out.length;
    fs.writeFileSync(file, JSON.stringify(rows));
    console.log(`${st}: ${done}/${todo.length} processed`);
  }
  const m = rows.filter((r) => r.lat != null).length;
  console.log(`${st}: ${m} of ${rows.length} now have coordinates`);
}
