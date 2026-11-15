#!/usr/bin/env node
// Download the open licence lists for the pilot states, adapt them, label chains, and write
// .cache/venues/licences/<STATE>.json plus a summary. Usage: node scripts/venues/licences_ingest.mjs [NY TX CA CO]
// Needs no keys. Free lists only. Run with NODE_USE_ENV_PROXY=1 behind a proxy.

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import Papa from "papaparse";
import { ADAPTERS } from "./lib/licences/index.mjs";
import { labelChains } from "./lib/chain.mjs";
import { USER_AGENT } from "./lib/robots.mjs";

const OUT = path.resolve(".cache/venues/licences");
const SOURCES = {
  NY: { json: "https://data.ny.gov/resource/9s3h-dpkz.json?$limit=100000" },
  CO: { json: "https://data.colorado.gov/resource/ier5-5ms2.json?$limit=50000" },
  TX: { json: "https://data.texas.gov/resource/7hf9-qc9f.json?$limit=100000&$where=" + encodeURIComponent("license_type in('P','MB')") },
  CA: { zip: "https://www.abc.ca.gov/wp-content/uploads/DailyExport-CSV.zip" },
};

async function get(url) {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT }, signal: AbortSignal.timeout(120000) });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function load(state) {
  const src = SOURCES[state];
  if (src.json) return JSON.parse((await get(src.json)).toString("utf8"));
  const zip = path.join(OUT, "ca.zip");
  fs.writeFileSync(zip, await get(src.zip));
  const csv = execFileSync("unzip", ["-p", zip], { maxBuffer: 1 << 30 }).toString("utf8").replace(/^﻿/, "");
  return Papa.parse(csv.split("\n").slice(1).join("\n"), { header: true, skipEmptyLines: true }).data;
}

const states = process.argv.slice(2).map((s) => s.toUpperCase());
const run = states.length ? states : Object.keys(SOURCES);
fs.mkdirSync(OUT, { recursive: true });
const today = new Date().toISOString().slice(0, 10);
const all = [];
for (const st of run) {
  if (!SOURCES[st]) { console.error(`unknown state ${st}`); continue; }
  const rows = await load(st);
  const kept = rows.map((r) => ADAPTERS[st](r, today)).filter(Boolean);
  all.push(...kept);
  console.log(`${st}: raw ${rows.length}, kept ${kept.length}`);
}
// Chain labels need every state together so national chains are counted across the pilot.
const labelled = labelChains(all);
for (const st of run) {
  const rows = labelled.filter((r) => r.licence_state === st);
  fs.writeFileSync(path.join(OUT, `${st}.json`), JSON.stringify(rows));
  const chains = rows.filter((r) => r.chain_status === "chain").length;
  console.log(`${st}: wrote ${rows.length} (chains ${chains}, with coordinates ${rows.filter((r) => r.lat != null).length})`);
}
