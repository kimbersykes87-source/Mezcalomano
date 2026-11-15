#!/usr/bin/env node
// Pilot crawl for Gate A (plan v3). Samples licence venues that have a website, reads them politely,
// and reports per state and venue type: readable share, species-naming share, auto-verified count.
// Stores use the catalog reader; bars and restaurants use the menu pages. Results go to
// .cache/venues/pilot_<date>.json. Usage: node scripts/venues/pilot_crawl.mjs [perGroup=40] [concurrency=8]
// Needs NODE_USE_ENV_PROXY=1 behind a proxy. 1 request per second per host, robots.txt obeyed.

import fs from "node:fs";
import path from "node:path";
import { buildAliasTable } from "./lib/aliases.mjs";
import { politeGet, pickMenuLinks } from "./lib/http.mjs";
import { analyzeCatalog, fetchCatalog, needsAudit, storeQualifies } from "./lib/catalog.mjs";
import { analyzeMenu } from "./lib/extract.mjs";
import { fetchPage } from "./lib/menu_fetch.mjs";

const per = Number(process.argv[2] || 40);
const conc = Number(process.argv[3] || 8);
const table = buildAliasTable(fs.readFileSync("data/Species_Final - Website.csv", "utf8"));
const DIR = path.resolve(".cache/venues/licences");

async function checkStore(v) {
  const c = await fetchCatalog(v.website, politeGet);
  if (!c.ok) return { readable: false, reason: c.reason };
  const r = analyzeCatalog(c.products, table);
  return { readable: true, platform: c.platform, mezcal_products: r.catalog.mezcal_products, species: r.distinctNonEspadin, qualifies: storeQualifies(r), audit: needsAudit(r) };
}

async function checkMenu(v) {
  const home = await politeGet(v.website);
  if (!home.ok) return { readable: false, reason: home.reason };
  const pages = [{ html: home.text }];
  for (const link of pickMenuLinks(home.text ?? "", v.website, 3)) {
    const p = await fetchPage(link);
    if (p.ok && (p.text || p.html)) pages.push({ html: p.html, text: p.format === "pdf" ? p.text : undefined, format: p.format });
  }
  const species = new Set();
  let imageOnly = false, sawMezcal = false;
  for (const p of pages) {
    const r = analyzeMenu({ html: p.html, text: p.text, format: p.format === "pdf" ? "pdf" : "html" }, table);
    if (r.status === "image_only") imageOnly = true;
    if (r.mezcalLines?.length || r.espadin?.length) sawMezcal = true;
    for (const s of r.distinctNonEspadin) species.add(s);
  }
  return { readable: !imageOnly || sawMezcal, mezcal_seen: sawMezcal, species: [...species], qualifies: species.size >= 2, pages: pages.length };
}

const jobs = [];
for (const st of ["NY", "TX", "CA", "CO"]) {
  const rows = JSON.parse(fs.readFileSync(path.join(DIR, `${st}.json`), "utf8")).filter((r) => r.website);
  for (const type of ["store", "bar", "restaurant"]) {
    const pool = rows.filter((r) => r.venue_type === type && r.chain_status === "independent");
    const pick = pool.sort(() => Math.random() - 0.5).slice(0, per);
    for (const v of pick) jobs.push({ st, type, v });
  }
}
console.log(`${jobs.length} venues to check`);
const results = [];
let next = 0;
async function worker() {
  while (next < jobs.length) {
    const j = jobs[next++];
    let res;
    try { res = j.type === "store" ? await checkStore(j.v) : await checkMenu(j.v); } catch { res = { readable: false, reason: "error" }; }
    results.push({ state: j.st, type: j.type, name: j.v.name, website: j.v.website, ...res });
    if (results.length % 40 === 0) console.log(`${results.length}/${jobs.length}`);
  }
}
await Promise.all(Array.from({ length: conc }, worker));
const out = path.resolve(`.cache/venues/pilot_${new Date().toISOString().slice(0, 10)}.json`);
fs.writeFileSync(out, JSON.stringify(results));
console.log("\nstate type: tried | readable | named a non-espadin species | auto-verified (2+ species)");
for (const st of ["NY", "TX", "CA", "CO"]) for (const type of ["store", "bar", "restaurant"]) {
  const g = results.filter((r) => r.state === st && r.type === type);
  if (!g.length) continue;
  console.log(`${st} ${type}: ${g.length} | ${g.filter((r) => r.readable).length} | ${g.filter((r) => r.species?.length >= 1).length} | ${g.filter((r) => r.qualifies).length}`);
}
