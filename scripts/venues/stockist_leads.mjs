#!/usr/bin/env node
// Collect stockist leads from producer sites and match them to licence records.
// Hosts come from the producer_links column of data/Species_Final - Website.csv. Leads are discovery only.
// Writes .cache/venues/stockist_leads.json and stockist_matches.json. Usage: node scripts/venues/stockist_leads.mjs

import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import { politeGet } from "./lib/http.mjs";
import { dedupeLeads, leadsFromJsonLd, leadsFromStockistJson, leadsFromText, leadsFromWpsl, locatorLinks, stockistWidgetId, wpslBase, wpslUrls } from "./lib/stockists.mjs";
import { htmlToText } from "./lib/text.mjs";
import { nameScore } from "./lib/website_finder.mjs";

const rows = Papa.parse(fs.readFileSync("data/Species_Final - Website.csv", "utf8"), { header: true, skipEmptyLines: true }).data;
const shops = new Set(JSON.parse(fs.readFileSync("data/us-shops.json", "utf8")).hosts.map((h) => h.replace(/^www\./, "")));
const brandSites = new Map();
for (const r of rows) {
  for (const u of String(r.producer_links ?? "").match(/https?:\/\/[^\s|;,"]+/g) ?? []) {
    const host = new URL(u).host.replace(/^www\./, "");
    if (!shops.has(host)) brandSites.set(host, `https://${host}`);
  }
}
console.log(`${brandSites.size} brand sites`);

async function leadsFor(site) {
  const home = await politeGet(site);
  if (!home.ok) return { leads: [], note: home.reason };
  const pages = [{ url: site, html: home.text }];
  for (const l of locatorLinks(home.text, site)) {
    const p = await politeGet(l);
    if (p.ok) pages.push({ url: l, html: p.text });
  }
  const leads = [];
  for (const p of pages) {
    leads.push(...leadsFromJsonLd(p.html));
    const id = stockistWidgetId(p.html);
    if (id) {
      const res = await politeGet(`https://stockist.co/api/v1/${id}/locations/all`);
      try { if (res.ok) leads.push(...leadsFromStockistJson(JSON.parse(res.text ?? res.body.toString("utf8")))); } catch { /* not json */ }
    }
    const wp = wpslBase(p.html, p.url);
    if (wp) {
      for (const u of wpslUrls(wp)) {
        const res = await politeGet(u);
        try { if (res.ok) leads.push(...leadsFromWpsl(JSON.parse(res.text ?? res.body.toString("utf8")))); } catch { /* not json */ }
      }
    }
    leads.push(...leadsFromText(htmlToText(p.html)));
  }
  return { leads: dedupeLeads(leads), note: pages.length > 1 ? "locator page read" : "home only" };
}

const all = [];
const hosts = [...brandSites.entries()];
let i = 0;
await Promise.all(Array.from({ length: 8 }, async () => {
  while (i < hosts.length) {
    const [host, site] = hosts[i++];
    try {
      const { leads, note } = await leadsFor(site);
      for (const l of leads) all.push({ ...l, brand_site: host });
      console.log(`${host}: ${leads.length} leads (${note})`);
    } catch { console.log(`${host}: error`); }
  }
}));
const leads = dedupeLeads(all.filter((l) => l.state && l.zip));
fs.writeFileSync(path.resolve(".cache/venues/stockist_leads.json"), JSON.stringify(leads));

// Match to licence records by zip and name.
const matches = [];
for (const st of ["NY", "TX", "CA", "CO"]) {
  const recs = JSON.parse(fs.readFileSync(path.resolve(`.cache/venues/licences/${st}.json`), "utf8"));
  const byZip = new Map();
  for (const r of recs) { const z = r.zip; if (z) { if (!byZip.has(z)) byZip.set(z, []); byZip.get(z).push(r); } }
  for (const l of leads.filter((x) => x.state === st)) {
    let best = null;
    for (const r of byZip.get(String(l.zip).slice(0, 5)) ?? []) {
      const s = nameScore(l.name, r.name);
      if (s >= 0.6 && (!best || s > best.s)) best = { r, s };
    }
    if (best) matches.push({ lead: l, licence_state: st, licence_number: best.r.licence_number, name: best.r.name, venue_type: best.r.venue_type, website: best.r.website ?? null, score: best.s });
  }
}
fs.writeFileSync(path.resolve(".cache/venues/stockist_matches.json"), JSON.stringify(matches));
const byState = {};
for (const l of leads) byState[l.state] = (byState[l.state] ?? 0) + 1;
console.log(`\n${leads.length} US leads (with state and zip); pilot states: ${["NY", "TX", "CA", "CO"].map((s) => `${s} ${byState[s] ?? 0}`).join(", ")}`);
console.log(`matched to a licence record: ${matches.length}; with a website: ${matches.filter((m) => m.website).length}`);
