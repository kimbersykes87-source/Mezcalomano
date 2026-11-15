#!/usr/bin/env node
// Directory shops route (plan v3). Takes the online shops we already know sell mezcal (data/us-shops.json,
// data/us-catalogs.json and producer link hosts), finds the licence records that share their website
// domain, checks each store's catalog, finds a contact email, and runs the auto-publish decision.
// Writes .cache/venues/verified_stores.json. Staging only, nothing goes to the database.
// Usage: node scripts/venues/verify_shops.mjs   (NODE_USE_ENV_PROXY=1 behind a proxy)

import fs from "node:fs";
import path from "node:path";
import { buildAliasTable } from "./lib/aliases.mjs";
import { politeGet } from "./lib/http.mjs";
import { analyzeCatalog, fetchCatalog, needsAudit, storeQualifies } from "./lib/catalog.mjs";
import { analyzeSlugs, fetchSitemapUrls } from "./lib/sitemap.mjs";
import { findContactEmail } from "./lib/contact.mjs";
import { decideVenue } from "./lib/autopublish.mjs";

const table = buildAliasTable(fs.readFileSync("data/Species_Final - Website.csv", "utf8"));
const DIR = path.resolve(".cache/venues/licences");
// Multi tenant hosts (myshopify.com and similar) must match on the full host, not the shared root.
const MULTI_TENANT = /(myshopify\.com|business\.site|wixsite\.com|square\.site|squarespace\.com|weebly\.com|godaddysites\.com)$/;
const root = (u) => {
  try {
    const h = new URL(/^https?:/.test(u) ? u : `https://${u}`).hostname.toLowerCase().replace(/^www\./, "");
    return MULTI_TENANT.test(h) ? h : h.split(".").slice(-2).join(".");
  } catch { return null; }
};

const shops = JSON.parse(fs.readFileSync("data/us-shops.json", "utf8")).hosts;
const catalogs = JSON.parse(fs.readFileSync("data/us-catalogs.json", "utf8")).shops.map((s) => s.host);
const knownRoots = new Set([...shops, ...catalogs].map(root).filter(Boolean));

const records = [];
for (const st of ["NY", "TX", "CA", "CO"]) {
  for (const r of JSON.parse(fs.readFileSync(path.join(DIR, `${st}.json`), "utf8"))) {
    if (r.website && knownRoots.has(root(r.website))) records.push(r);
  }
}
console.log(`${knownRoots.size} known shop domains, ${records.length} licence records share one`);

const getPage = async (u) => { const r = await politeGet(u); return r.ok ? { ok: true, text: r.text } : { ok: false }; };
const now = new Date();
const out = [];
for (const r of records) {
  let result = null, via = null;
  try {
    const c = await fetchCatalog(r.website, politeGet);
    if (c.ok) { result = analyzeCatalog(c.products, table); via = "catalog"; }
    else {
      const s = await fetchSitemapUrls(r.website, politeGet);
      if (s.ok) { result = analyzeSlugs(s.urls, table).result; via = "sitemap"; }
    }
  } catch { /* unreachable */ }
  if (!result) { out.push({ ...r, evidence: null, decision: { decision: "hold", reasons: ["site_unreadable"] } }); continue; }
  const observed_at = now.toISOString();
  const claims = result.claims.filter((c) => c.counts).map((c) => ({ ...c, observed_at }));
  const wm = r.website_match;
  const venue = {
    venue_type: r.venue_type, chain_status: r.chain_status, licence_status: r.licence_status, licence_expires_on: r.licence_expires_on,
    website: r.website, pin_distance_m: wm?.how === "name_and_distance" ? wm.distance_m : null, closed_signals: [], needs_audit: needsAudit(result),
  };
  const decision = decideVenue({ venue, claims }, now);
  let contact = null;
  if (storeQualifies(result)) {
    try { contact = await findContactEmail(r.website, getPage, r.overture_email ?? null); } catch { /* none */ }
  }
  out.push({ ...r, evidence: { via, species: result.distinctNonEspadin, claims: claims.map((c) => ({ species: c.species_slug || c.species_group, line: c.line_text })) }, contact, decision });
  console.log(`${r.licence_state} ${r.name} | ${via} | ${result.distinctNonEspadin.length} species | ${decision.decision} ${decision.reasons.join(",")} | email ${contact ? "yes" : "no"}`);
}
fs.writeFileSync(path.resolve(".cache/venues/verified_stores.json"), JSON.stringify(out));
const by = (k) => out.filter((o) => o.decision.decision === k).length;
console.log(`\npublish ${by("publish")}, hold ${by("hold")}, hide ${by("hide")}; with email ${out.filter((o) => o.contact).length}`);
const holds = {};
for (const o of out.filter((x) => x.decision.decision === "hold")) for (const r of o.decision.reasons) holds[r] = (holds[r] ?? 0) + 1;
console.log("hold reasons:", JSON.stringify(holds));
