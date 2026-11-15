#!/usr/bin/env node
// Build a labelling sheet for the gold set. Samples mezcal product titles from real US retailer
// catalogs (data/us-shops.json) and writes a CSV for a person to label.
// Columns: store, product_title, matched_species, counted, human_species_correct (yes/no/partial),
// human_should_count (yes/no), notes. Claude must not fill the human columns.
// Usage: node scripts/venues/gold_export.mjs [productsPerStore=25] [out.csv]

import fs from "node:fs";
import Papa from "papaparse";
import { buildAliasTable } from "./lib/aliases.mjs";
import { politeGet } from "./lib/http.mjs";
import { analyzeCatalog, fetchCatalog, isMezcalProduct } from "./lib/catalog.mjs";

const per = Number(process.argv[2] || 25);
const out = process.argv[3] || ".cache/venues/gold_sheet.csv";
const table = buildAliasTable(fs.readFileSync("data/Species_Final - Website.csv", "utf8"));
const shops = JSON.parse(fs.readFileSync("data/us-shops.json", "utf8"));
const sites = [...new Set(shops.hosts.map((h) => `https://${h}`))];
const rows = [];
for (const site of sites.slice(0, 40)) {
  let c;
  try { c = await fetchCatalog(site, politeGet); } catch { continue; }
  if (!c.ok) continue;
  const mezcal = c.products.filter(isMezcalProduct);
  const shuffled = mezcal.sort(() => Math.random() - 0.5).slice(0, per);
  for (const p of shuffled) {
    const r = analyzeCatalog([p], table);
    rows.push({
      store: new URL(site).hostname, product_title: p.title,
      matched_species: r.claims.map((x) => x.species_slug || x.species_group).join("; "),
      counted: r.claims.some((x) => x.counts) ? "yes" : "no",
      human_species_correct: "", human_should_count: "", notes: "",
    });
  }
  console.log(`${new URL(site).hostname}: ${mezcal.length} mezcal products, sampled ${shuffled.length}`);
}
fs.mkdirSync(".cache/venues", { recursive: true });
fs.writeFileSync(out, Papa.unparse(rows));
console.log(`wrote ${rows.length} rows to ${out}`);
