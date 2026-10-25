#!/usr/bin/env node
/**
 * Weekly directory upkeep (run by .github/workflows/directory-weekly.yml, Monday and Thursday).
 *
 * 1. Checks every producer link (scripts/check-producer-links.mjs).
 * 2. Remembers failing links between runs (state file). A link that fails on two runs at
 *    least two days apart is fixed automatically:
 *      - swapped for the same producer's bottle of that species at a US shop, if one is in stock;
 *      - otherwise removed, unless it is the species' last producer or its last working US link
 *        (those are flagged as urgent instead).
 * 3. Monday only: scans US shop catalogs (data/us-catalogs.json) for in-stock single-species
 *    bottles not yet listed, and writes them as suggestions (a second CSV for a pull request).
 * 4. Writes a report (JSON + Markdown) for the run summary and the hola@ email.
 *
 * Usage:
 *   node scripts/directory-weekly.mjs --mode monday|thursday [--state .bot/link-health.json]
 *        [--out .bot] [--dry-run] [--check-json existing-report.json]
 *
 * Outputs in --out: report.json, report.md, suggestions.csv (Monday, only when there are suggestions).
 * Without --dry-run, automatic fixes are written to data/Species_Final - Website.csv.
 * Node 20+, no dependencies.
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CSV_PATH = path.join(ROOT, "data", "Species_Final - Website.csv");
const CATALOGS = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "us-catalogs.json"), "utf8"));
const US_HOSTS = new Set(JSON.parse(fs.readFileSync(path.join(ROOT, "data", "us-shops.json"), "utf8")).hosts.map((h) => h.replace(/^www\./, "")));
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 MezcalomanoDirectoryBot/1.0 (+https://mezcalomano.com)";
const DAY = 86400000;

const args = process.argv.slice(2);
const arg = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const MODE = arg("--mode", "monday");
const STATE_PATH = arg("--state", path.join(ROOT, ".bot", "link-health.json"));
const OUT = arg("--out", path.join(ROOT, ".bot"));
const DRY = args.includes("--dry-run");
const CHECK_JSON = arg("--check-json", null);
const NOW = new Date();
const TODAY = NOW.toISOString().slice(0, 10);

// ---------- helpers ----------
const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const toSlug = (n) => norm(n).trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };
const isUs = (u) => US_HOSTS.has(host(u));
const cleanUrl = (u) => { try { const x = new URL(u); return `${x.origin}${x.pathname}`.replace(/\/$/, ""); } catch { return u; } };
const producerKey = (s) => norm(s).replace(/\bmezcal(es)?\b/g, "").replace(/[^a-z0-9]+/g, " ").trim();

function parseCsv(text) {
  const rows = []; let row = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(field); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => v !== ""));
}
const csvField = (v) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const writeCsv = (rows, nl) => rows.map((r) => r.map(csvField).join(",")).join(nl) + nl;

/** The species table with producers and links split into pairs; write() puts changes back. */
function loadDirectory() {
  const raw = fs.readFileSync(CSV_PATH, "utf8");
  const nl = raw.includes("\r\n") ? "\r\n" : "\n";
  const rows = parseCsv(raw);
  const h = rows[0], iN = h.indexOf("common_name"), iP = h.indexOf("producers"), iL = h.indexOf("producer_links"), iS = h.indexOf("scientific_name");
  const species = rows.slice(1).map((r) => {
    const quoted = r[iP].startsWith('"') && r[iP].endsWith('"');
    const names = r[iP].replace(/^"+|"+$/g, "").split(",").map((s) => s.trim()).filter(Boolean);
    const links = r[iL].split(",").map((s) => s.trim()).filter(Boolean);
    return { row: r, name: r[iN].trim(), slug: toSlug(r[iN]), scientific: r[iS], quoted, pairs: names.map((n, i) => ({ producer: n, url: links[i] || "" })) };
  });
  return {
    species,
    clone() { return loadDirectory(); },
    write(file = CSV_PATH) {
      for (const s of species) {
        const p = s.pairs.map((x) => x.producer).join(",");
        s.row[iP] = s.quoted ? `"${p}"` : p;
        s.row[iL] = s.pairs.map((x) => x.url).join(",");
      }
      fs.writeFileSync(file, writeCsv(rows, nl));
    },
  };
}

// ---------- species matching in shop titles ----------
// Longer, more specific terms first so "madre cuishe" is not also read as "cuishe".
const TERMS = {
  lyobaa_coyote: ["lyobaa"], madrecuixe: ["madrecuishe", "madrecuixe", "madre cuishe", "madre cuixe", "madre-cuishe"],
  manso_sahuayo: ["manso sahuayo", "sahuayo"], sierra_negra: ["sierra negra", "sierranegra"], pulque_chino: ["pulque chino"],
  weber_azul: ["tequilana", "weber", "maguey azul", "agave azul"], espadin: ["espadin"], tobala: ["tobala"],
  tepextate: ["tepextate", "tepeztate", "tepestate"], cuishe: ["cuishe", "cuixe"], barril: ["barril"], bicuixe: ["bicuishe", "bicuixe"],
  tobaziche: ["tobaziche", "tobasiche", "tobasichi"], lumbre: ["lumbre"], montana: ["agave montana", "maguey montana"],
  arroqueno: ["arroqueno"], coyote: ["coyote"], mexicano: ["mexicano"], masparillo: ["masparillo", "maximiliana"],
  papalote: ["papalote", "cupreata", "papalometl"], alto: ["inaequidens", "maguey alto"], salmiana: ["salmiana"],
  cimarron: ["cimarron", "cimmaron", "crassispina"], cenizo: ["cenizo", "durangensis"], churique: ["churique", "shrevei"],
  verde: ["gentryi", "maguey verde", "verde puntas"], warash: ["warash"], rayo: ["maguey rayo", "agave rayo"],
  henequen: ["henequen", "fourcroydes"], pacifica: ["bacanora"], wocomahi: ["wocomahi"], jabali: ["jabali", "convallis"],
  lamparillo: ["lamparillo", "asperrima"], tepemete: ["tepemete"], chahuiqui: ["chahuiqui", "multifilifera"],
  espadilla: ["espadilla"], cincoanero: ["cincoanero", "cantala"], castilla: ["castilla"], chuparrosa: ["chuparrosa"],
  pulquero: ["pulquero", "mapisaga"],
};
const TERM_LIST = Object.entries(TERMS).flatMap(([slug, ts]) => ts.map((t) => [slug, t])).sort((a, b) => b[1].length - a[1].length);
const NOT_A_BOTTLE = /\b(kit|sampler|gift|bundle|advent|calendar|glass|copita|gin|cream|liqueur|licor|sotol|tequila|raicilla|shirt|hat|tote|cocktail)\b/;
const BLEND = /\b(ensamble|ensemble|blend|mix|and|con|with)\b|\+|\//;
// Agaves the deck does not cover; a title naming one of these alongside a deck species is a blend.
const OTHER_AGAVES = /\b(largo|cucharilla|san martinero|alineno|becuela|tripon|sacatoro|papalometl cuerno|ixtero|brocha|lineno|chino|bruto|cuerno|sotol)\b/;

/** The single species a product title is for, or null if none / several (a blend). */
function speciesOf(title) {
  const raw = ` ${norm(title).replace(/\s+/g, " ")} `;
  let t = ` ${norm(title).replace(/[^a-z0-9+ ]+/g, " ").replace(/\s+/g, " ")} `;
  if (NOT_A_BOTTLE.test(t) || BLEND.test(raw)) return null;
  const found = new Set();
  for (const [slug, term] of TERM_LIST) {
    const re = new RegExp(`\\b${term.replace(/ /g, "\\s")}\\b`);
    if (re.test(t)) { found.add(slug); t = t.replace(re, " _ "); }
  }
  // "Lyobaa Coyote" is one species; "Coyote" left over after it is the same bottle.
  if (found.has("lyobaa_coyote")) found.delete("coyote");
  if (found.size !== 1) return null;
  if (OTHER_AGAVES.test(t)) return null;
  return [...found][0];
}

/** Producer name from a product title: the text before the species name or the first " - ". */
function producerFromTitle(title) {
  let t = title.replace(/\s+/g, " ").trim();
  t = t.split(/\s+-\s*|-\s+|\s*\(|-(?=[A-Z])/)[0];
  const n = norm(t);
  let cut = t.length;
  for (const [, term] of TERM_LIST) {
    const m = new RegExp(`\\b${term.replace(/ /g, "\\s")}\\b`).exec(n);
    if (m && m.index > 0 && m.index < cut) cut = m.index;
  }
  return t.slice(0, cut).replace(/\b(series|vol\.?|edition|batch)\b.*$/i, "").replace(/[\s,.-]+$/, "").trim() || t.trim();
}

// ---------- shop catalogs ----------
async function getJson(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" }, signal: AbortSignal.timeout(30000) });
      if (r.status === 200) return await r.json();
      if (r.status === 404) return null;
    } catch { /* retry */ }
    await new Promise((res) => setTimeout(res, 2000 * (attempt + 1)));
  }
  return null;
}

async function loadCatalogs() {
  const products = [];
  for (const shop of CATALOGS.shops) {
    let page = 1, got = 0;
    while (page < 40) {
      const d = await getJson(`https://${shop.host}/products.json?limit=250&page=${page}`);
      if (!d?.products?.length) break;
      for (const p of d.products) {
        if ((shop.skipVendors || []).includes(p.vendor)) continue;
        const available = (p.variants || []).some((v) => v.available);
        let producer = "";
        if (shop.producerFrom === "title") producer = producerFromTitle(p.title);
        else if (shop.producerFrom === "vendor") producer = p.vendor;
        else if (shop.producerFrom.startsWith("tag:")) {
          const pre = shop.producerFrom.slice(4);
          producer = (p.tags || []).find((t) => t.startsWith(pre))?.slice(pre.length) || p.title.split(/\s+/).slice(0, 2).join(" ");
        }
        const typeText = norm(`${p.product_type} ${(p.tags || []).join(" ")} ${p.title}`);
        if (!/mezcal|destilado|agave|bacanora|maguey/.test(typeText)) continue;
        products.push({
          shop: shop.name, host: shop.host, title: p.title, producer: producer.trim(),
          url: `https://${shop.host}/products/${p.handle}`, price: Number(p.variants?.[0]?.price || 0), available,
          species: speciesOf(p.title),
        });
      }
      got += d.products.length; page++;
    }
    console.error(`catalog ${shop.host}: ${got} products read`);
  }
  return products;
}

// ---------- main ----------
async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const dir = loadDirectory();
  const state = fs.existsSync(STATE_PATH) ? JSON.parse(fs.readFileSync(STATE_PATH, "utf8")) : { links: {} };

  // 1. link check
  let check;
  if (CHECK_JSON) check = JSON.parse(fs.readFileSync(CHECK_JSON, "utf8"));
  else {
    const tmp = path.join(OUT, "link-check.json");
    try { execFileSync(process.execPath, [path.join(__dirname, "check-producer-links.mjs"), "--json", tmp], { stdio: ["ignore", "ignore", "inherit"] }); } catch { /* exit 1 = problems found */ }
    check = JSON.parse(fs.readFileSync(tmp, "utf8"));
  }
  const failing = (r) => ["DEAD", "BAD_URL"].includes(r.verdict) ||
    (r.verdict === "GENERIC" && /homepage|Product removed/i.test(r.note)) ||
    (r.verdict === "INFO" && /sold out/i.test(r.note));
  const byKey = new Map(check.results.map((r) => [`${r.slug}|${r.url}`, r]));

  // 2. strikes
  const firstStrike = [];
  const nextLinks = {};
  for (const r of check.results) {
    const k = `${r.slug}|${r.url}`;
    if (!failing(r)) continue;
    const prev = state.links[k];
    nextLinks[k] = prev
      ? { ...prev, lastFailed: TODAY, strikes: prev.strikes + (prev.lastFailed === TODAY ? 0 : 1), verdict: r.verdict, note: r.note }
      : { species: r.species, slug: r.slug, producer: r.producer, url: r.url, firstFailed: TODAY, lastFailed: TODAY, strikes: 1, verdict: r.verdict, note: r.note };
    if (nextLinks[k].strikes < 2) firstStrike.push(nextLinks[k]);
  }

  const catalog = await loadCatalogs();
  const inStock = catalog.filter((p) => p.available && p.species && p.price > 0);
  const known = new Map();
  for (const sp of dir.species) for (const p of sp.pairs) known.set(producerKey(p.producer), p.producer);
  const canonicalProducer = (name) => {
    const k = producerKey(name);
    const alias = CATALOGS.producerAliases[k];
    if (alias) return alias;
    return known.get(k) || name;
  };

  // 3. automatic fixes for links failing twice, at least two days apart
  const autoChanges = [], urgent = [];
  for (const [k, s] of Object.entries(nextLinks)) {
    const ageDays = (Date.parse(s.lastFailed) - Date.parse(s.firstFailed)) / DAY;
    if (s.strikes < 2 || ageDays < 2) continue;
    const sp = dir.species.find((x) => x.slug === s.slug);
    const idx = sp?.pairs.findIndex((p) => p.url === s.url);
    if (!sp || idx < 0) { delete nextLinks[k]; continue; }
    const pair = sp.pairs[idx];
    const pk = producerKey(canonicalProducer(pair.producer));
    const listed = new Set(sp.pairs.map((p) => cleanUrl(p.url)));
    const replacement = inStock.find((p) => p.species === sp.slug && producerKey(canonicalProducer(p.producer)) === pk && !listed.has(cleanUrl(p.url)));
    if (replacement) {
      autoChanges.push({ action: "replaced", species: sp.name, producer: pair.producer, from: pair.url, to: replacement.url, why: `${s.note} (failing since ${s.firstFailed})`, shop: replacement.shop });
      pair.url = replacement.url;
      delete nextLinks[k];
      continue;
    }
    const others = sp.pairs.filter((_, i) => i !== idx);
    const otherWorkingUs = others.some((p) => isUs(p.url) && byKey.get(`${sp.slug}|${p.url}`)?.verdict === "OK");
    if (others.length === 0 || (isUs(pair.url) && !otherWorkingUs)) {
      urgent.push({ species: sp.name, producer: pair.producer, url: pair.url, why: `${s.note} (failing since ${s.firstFailed}); not removed because it is the ${others.length === 0 ? "only producer" : "last US buy link"}` });
      continue;
    }
    autoChanges.push({ action: "removed", species: sp.name, producer: pair.producer, from: pair.url, why: `${s.note} (failing since ${s.firstFailed})` });
    sp.pairs.splice(idx, 1);
    delete nextLinks[k];
  }

  // 4. suggestions from US catalogs (Monday)
  const suggestions = [];
  if (MODE === "monday") {
    const max = CATALOGS.maxUsLinksPerSpecies || 5;
    for (const sp of dir.species) {
      const listedUrls = new Set(sp.pairs.map((p) => cleanUrl(p.url)));
      const usProducers = new Set(sp.pairs.filter((p) => isUs(p.url)).map((p) => producerKey(canonicalProducer(p.producer))));
      let room = max - sp.pairs.filter((p) => isUs(p.url)).length;
      const seenProducer = new Set();
      for (const p of inStock.filter((x) => x.species === sp.slug)) {
        if (listedUrls.has(cleanUrl(p.url))) continue;
        const name = canonicalProducer(p.producer);
        const pk = producerKey(name);
        if (usProducers.has(pk) || seenProducer.has(pk)) continue;
        const existing = sp.pairs.find((x) => producerKey(canonicalProducer(x.producer)) === pk);
        if (!existing && room <= 0) continue;
        seenProducer.add(pk);
        if (existing) suggestions.push({ action: "swap", species: sp.name, slug: sp.slug, producer: existing.producer, from: existing.url, to: p.url, title: p.title, shop: p.shop, price: p.price });
        else { suggestions.push({ action: "add", species: sp.name, slug: sp.slug, producer: name, to: p.url, title: p.title, shop: p.shop, price: p.price }); room--; }
      }
    }
  }

  // 5. coverage after automatic fixes
  const coverage = dir.species.map((sp) => {
    const us = sp.pairs.filter((p) => isUs(p.url) && !failing(byKey.get(`${sp.slug}|${p.url}`) || { verdict: "OK", note: "" }));
    return { species: sp.name, producers: sp.pairs.length, us: us.map((p) => p.producer) };
  });
  const blocked = check.results.filter((r) => r.verdict === "BLOCKED").map((r) => ({ species: r.species, producer: r.producer, url: r.url }));

  // write
  if (!DRY && autoChanges.length) dir.write();
  if (suggestions.length) {
    const sdir = loadDirectory();
    // apply the automatic fixes to the copy too, then the suggestions
    for (const c of autoChanges) {
      const sp = sdir.species.find((x) => x.name === c.species);
      const i = sp.pairs.findIndex((p) => p.url === c.from);
      if (i >= 0) { if (c.action === "removed") sp.pairs.splice(i, 1); else sp.pairs[i].url = c.to; }
    }
    for (const s of suggestions) {
      const sp = sdir.species.find((x) => x.slug === s.slug);
      if (s.action === "swap") { const pr = sp.pairs.find((p) => p.url === s.from); if (pr) pr.url = s.to; }
      else sp.pairs.push({ producer: s.producer, url: s.to });
    }
    sdir.write(path.join(OUT, "suggestions.csv"));
  }
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify({ updated: NOW.toISOString(), links: nextLinks }, null, 2));

  const report = {
    date: TODAY, mode: MODE, counts: check.counts, linksChecked: check.results.length,
    autoChanges, urgent, suggestions, firstStrike,
    noUs: coverage.filter((c) => c.us.length === 0).map((c) => c.species),
    oneUs: coverage.filter((c) => c.us.length === 1).map((c) => `${c.species} (${c.us[0]})`),
    blocked, catalogProducts: catalog.length,
  };
  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(OUT, "report.md"), toMarkdown(report));
  console.log(toMarkdown(report));
}

function toMarkdown(r) {
  const L = [];
  L.push(`# Directory update, ${r.date} (${r.mode === "monday" ? "Monday scan" : "Thursday recheck"})`, "");
  L.push(`${r.linksChecked} links checked, ${r.catalogProducts} US shop products scanned. ${r.autoChanges.length} fixed automatically, ${r.suggestions.length} suggested, ${r.urgent.length} urgent.`, "");
  if (r.urgent.length) {
    L.push("## Urgent: species about to lose their last link", "");
    for (const u of r.urgent) L.push(`- **${u.species}**, ${u.producer}: ${u.why}. ${u.url}`);
    L.push("");
  }
  if (r.autoChanges.length) {
    L.push("## Fixed automatically (live on the site)", "");
    for (const c of r.autoChanges) L.push(c.action === "replaced"
      ? `- **${c.species}**, ${c.producer}: dead link replaced with ${c.shop} ${c.to} (was ${c.from}; ${c.why})`
      : `- **${c.species}**, ${c.producer}: removed (${c.why}). Was ${c.from}`);
    L.push("");
  }
  if (r.suggestions.length) {
    L.push("## Suggested, waiting for approval in the pull request", "");
    L.push("| Species | Change | Producer | Bottle | Shop | Price |", "|---|---|---|---|---|---|");
    for (const s of r.suggestions) L.push(`| ${s.species} | ${s.action === "add" ? "Add" : "Move to US shop"} | ${s.producer} | [${s.title.replace(/\|/g, "/")}](${s.to}) | ${s.shop} | $${s.price.toFixed(0)} |`);
    L.push("");
  }
  if (r.firstStrike.length) {
    L.push("## Failing for the first time (fixed next run if still failing)", "");
    for (const f of r.firstStrike) L.push(`- ${f.species}, ${f.producer}: ${f.note}. ${f.url}`);
    L.push("");
  }
  L.push("## US coverage", "");
  L.push(`- No US buy link: ${r.noUs.length ? r.noUs.join(", ") : "none"}`);
  L.push(`- Only one US buy link: ${r.oneUs.length ? r.oneUs.join(", ") : "none"}`, "");
  if (r.blocked.length) {
    L.push(`## Check by hand (${r.blocked.length} links on shops that block automated checks)`, "");
    for (const b of r.blocked) L.push(`- ${b.species}, ${b.producer}: ${b.url}`);
    L.push("");
  }
  return L.join("\n");
}

main().catch((e) => { console.error(e); process.exit(2); });
