#!/usr/bin/env node
/**
 * Producer link checker for the /directory.
 *
 * Reads `data/Species_Final - Website.csv` (the website data master), checks every
 * producer link and reports whether it is live and still points at a product page
 * for that species, not a homepage or a generic shop page.
 *
 * Verdicts (worst first):
 *   BAD_URL  malformed, two URLs run together, or producer/link counts don't match
 *   DEAD     404/410/5xx or the host does not answer
 *   GENERIC  homepage, redirected to the homepage, or the species is never mentioned
 *   BLOCKED  403/429 or a bot wall (Cloudflare "Just a moment"); check by hand
 *   INFO     species page but no price / buy button (brand info page, review site)
 *   OK       species-specific product page with a buy signal
 *
 * Usage:
 *   node scripts/check-producer-links.mjs                 # markdown report to stdout
 *   node scripts/check-producer-links.mjs --json out.json  # also write JSON
 *   node scripts/check-producer-links.mjs --only tobala    # one species (slug or name)
 *
 * Exit code is 1 when any BAD_URL or DEAD links exist, so a scheduled run fails loudly.
 * No dependencies: Node 20+ (global fetch).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.join(__dirname, "..", "data", "Species_Final - Website.csv");
const TIMEOUT_MS = 20000;
const CONCURRENCY = 8;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 MezcalomanoLinkCheck/1.0 (+https://mezcalomano.com)";

/** Extra words that identify a species on a producer page (spelling variants, trade names). */
const SPECIES_ALIASES = {
  espadin: ["espadín", "angustifolia"],
  tobala: ["tobalá", "potatorum"],
  tepextate: ["tepeztate", "tepestate", "tepezate", "marmorata"],
  cuishe: ["cuixe", "cuishe", "karwinskii"],
  barril: ["karwinskii"],
  madrecuixe: ["madrecuishe", "madre cuishe", "madre-cuishe", "madre cuixe", "karwinskii"],
  bicuixe: ["bicuishe", "karwinskii"],
  tobaziche: ["tobasiche", "tobasichi", "karwinskii"],
  lumbre: ["lumbre"],
  montana: ["montana", "montaña"],
  arroqueno: ["arroqueño", "americana"],
  sierra_negra: ["sierra negra", "sierranegra", "americana"],
  coyote: ["coyote"],
  mexicano: ["mexicano", "rhodacantha"],
  masparillo: ["maximiliana"],
  papalote: ["cupreata"],
  alto: ["inaequidens"],
  salmiana: ["salmiana"],
  cimarron: ["cimarrón", "san luis potosi", "san luis potosí", "ahualulco"],
  cenizo: ["durangensis", "durango"],
  manso_sahuayo: ["manso", "sahuayo", "cementerio"],
  lyobaa_coyote: ["coyote", "lyobaa"],
  churique: ["lechuguilla"],
  weber_azul: ["azul", "tequilana", "weber"],
  verde: ["verde"],
  warash: ["warash"],
  rayo: ["rayo"],
  henequen: ["henequén", "fourcroydes"],
  pacifica: ["bacanora", "pacifica"],
  wocomahi: ["sierreño", "sierreno", "wocomahi"],
  jabali: ["jabalí", "convallis"],
  lamparillo: ["lamparillo"],
  tepemete: ["tepemete", "angustiarum"],
  chahuiqui: ["chahuiqui", "ensemble", "ensamble"],
  espadilla: ["espadilla", "angustifolia"],
  cincoanero: ["cincoañero", "macroacantha"],
  castilla: ["castilla", "karwinskii"],
  chuparrosa: ["chuparrosa", "nussaviorum"],
  pulquero: ["pulquero", "mapisaga"],
  pulque_chino: ["pulque chino", "pulquechino"],
};

const BUY_RE =
  /(add to cart|add to bag|añadir al carrito|agregar al carrito|a[ñn]adir|add-to-cart|buy now|comprar|checkout|"@type"\s*:\s*"Product"|og:type"\s+content="product|product:price|data-product-id|\$\s?\d{2,4}(\.\d\d)?|\d{2,4}(\.\d\d)?\s?(MXN|USD)|MX\$|price)/i;
const BOT_WALL_RE = /(just a moment|attention required|cf-browser-verification|captcha|access denied)/i;
const AGE_GATE_RE = /(age gate|age verification|are you (over|of legal drinking age)|verify your age|eres mayor de edad)/i;
const STORE_CLOSED_RE =
  /(this store is unavailable|tienda en l[ií]nea ha sido dada de baja|store is currently unavailable|sorry, this shop is currently unavailable)/i;

// ---------- CSV ----------
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [header, ...body] = rows.filter((r) => r.some((v) => v.trim() !== ""));
  return body.map((r) => Object.fromEntries(header.map((h, i) => [h.trim(), (r[i] ?? "").trim()])));
}

function toSlug(name) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function norm(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Same split the site uses (SpeciesCard.tsx): comma separated, outer quotes stripped. */
function splitList(val) {
  return (val || "")
    .replace(/^"+|"+$/g, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// ---------- fetch ----------
async function fetchPage(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": UA, Accept: "text/html,*/*;q=0.8", "Accept-Language": "en,es;q=0.8" },
    });
    let body = "";
    try {
      body = (await res.text()).slice(0, 500000);
    } catch {
      /* ignore body read errors */
    }
    return { status: res.status, finalUrl: res.url || url, body };
  } catch (e) {
    return { status: 0, finalUrl: url, body: "", error: e?.name === "AbortError" ? "timeout" : e?.cause?.code || e?.message || "network" };
  } finally {
    clearTimeout(t);
  }
}

function keywordsFor(slug, row) {
  const words = new Set([norm(row.common_name), ...(SPECIES_ALIASES[slug] || []).map(norm)]);
  const epithet = norm(row.scientific_name).split(/\s+/)[1];
  if (epithet && epithet.length > 4) words.add(epithet);
  return [...words];
}

function classify(slug, row, producer, url) {
  const r = { species: row.common_name, slug, producer, url, status: null, finalUrl: null, title: "", verdict: "", note: "" };
  const httpCount = (url.match(/https?:\/\//g) || []).length;
  if (httpCount === 0) return { ...r, verdict: "BAD_URL", note: "Not a URL (missing comma or a comma inside the URL split it)" };
  if (httpCount > 1) return { ...r, verdict: "BAD_URL", note: "Two URLs run together (missing comma in the sheet)" };
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { ...r, verdict: "BAD_URL", note: "Unparseable URL" };
  }
  if (!parsed.pathname.replace(/\/+$/, "") && !parsed.search && !parsed.hash) {
    r.verdict = "GENERIC";
    r.note = "Links to the homepage, not a product";
  }
  return { r, parsed };
}

/**
 * Shopify stores expose `/products/<handle>.js` with the live title, price and availability.
 * It is far more reliable than scraping a client-rendered theme, so use it when the link
 * is a Shopify product URL. Returns null when the store is not Shopify.
 */
async function shopifyProduct(finalUrl) {
  const m = finalUrl.match(/^(https?:\/\/[^/]+)(?:\/collections\/[^/]+)?\/products\/([^/?#]+)/i);
  if (!m) return null;
  const { status, body } = await fetchPage(`${m[1]}/products/${m[2]}.js`);
  if (status === 404) return { removed: true };
  if (status !== 200) return null;
  try {
    const j = JSON.parse(body);
    if (!j || !j.title) return null;
    return { title: j.title, price: j.price, available: j.available, text: `${j.title} ${j.handle} ${(j.tags || []).join(" ")} ${(j.body_html || "").replace(/<[^>]+>/g, " ")}` };
  } catch {
    return null;
  }
}

async function checkLink(slug, row, producer, url, keywords) {
  const c = classify(slug, row, producer, url);
  if (c.verdict) return c;
  const { r, parsed } = c;
  const { status, finalUrl, body, error } = await fetchPage(url);
  if (/sgcaptcha|meta http-equiv="refresh"[^>]*captcha/i.test(body)) {
    return { ...r, status, finalUrl, verdict: "BLOCKED", note: "Captcha served to automated checks; open it by hand" };
  }
  r.status = status;
  r.finalUrl = finalUrl;
  const m = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  r.title = m ? m[1].replace(/\s+/g, " ").replace(/&ndash;|&#8211;/g, "-").replace(/&amp;/g, "&").trim().slice(0, 100) : "";

  if (status === 0) return { ...r, verdict: "DEAD", note: `No response (${error})` };
  if (status === 404 || status === 410) return { ...r, verdict: "DEAD", note: `HTTP ${status}` };
  if (status >= 500) return { ...r, verdict: "DEAD", note: `HTTP ${status}` };
  if (STORE_CLOSED_RE.test(body) || STORE_CLOSED_RE.test(r.title) || status === 423) return { ...r, verdict: "DEAD", note: "Shop is closed or unavailable" };
  if (status === 403 || status === 429 || status === 401 || status === 406 || BOT_WALL_RE.test(r.title))
    return { ...r, verdict: "BLOCKED", note: `HTTP ${status}, bot wall; open it by hand` };
  if (r.verdict === "GENERIC") return r;

  let fp;
  try {
    fp = new URL(finalUrl);
  } catch {
    fp = parsed;
  }
  const finalPath = fp.pathname.replace(/\/+$/, "");
  if (fp.hostname.replace(/^www\./, "") !== parsed.hostname.replace(/^www\./, "")) r.note = `Redirects to ${fp.hostname}. `;

  // Shopify: ask the store directly whether the product still exists and what it is.
  const shop = await shopifyProduct(parsed.href);
  if (shop?.removed) return { ...r, verdict: "DEAD", note: r.note + "Product removed from the shop (Shopify returns 404 for it)" };
  if (shop?.title) {
    const hit = keywords.find((k) => norm(shop.text).includes(k));
    if (!hit) return { ...r, verdict: "GENERIC", note: r.note + `Shop product is "${shop.title}", species not mentioned` };
    if (shop.available === false) return { ...r, verdict: "INFO", note: r.note + `"${shop.title}" is sold out` };
    return { ...r, verdict: "OK", note: (r.note + `Shopify product "${shop.title}"`).trim() };
  }

  if (!finalPath && parsed.pathname.replace(/\/+$/, "")) return { ...r, verdict: "GENERIC", note: r.note + "Redirects to the homepage (product probably removed)" };
  if (AGE_GATE_RE.test(r.title) && body.length < 60000) return { ...r, verdict: "INFO", note: r.note + "Behind an age gate; checker cannot see the product, open it by hand" };

  const haystack = norm(decodeURIComponent(fp.pathname) + " " + r.title + " " + body.replace(/<[^>]+>/g, " "));
  const hit = keywords.find((k) => haystack.includes(k));
  if (!hit) return { ...r, verdict: "GENERIC", note: r.note + "Species is not mentioned on the page (wrong product or a catalogue page)" };

  const isReview = /mezcalistas\.com|mezcalreviews\.com/.test(fp.hostname);
  if (isReview) return { ...r, verdict: "INFO", note: r.note + "Review site, not a shop" };
  if (BUY_RE.test(body)) return { ...r, verdict: "OK", note: (r.note + `Matched "${hit}"`).trim() };
  return { ...r, verdict: "INFO", note: r.note + `Species page ("${hit}") but no price or buy button` };
}

// ---------- main ----------
async function main() {
  const args = process.argv.slice(2);
  const jsonOut = args.includes("--json") ? args[args.indexOf("--json") + 1] : null;
  const only = args.includes("--only") ? toSlug(args[args.indexOf("--only") + 1]) : null;

  const rows = parseCsv(fs.readFileSync(CSV_PATH, "utf8"));
  const results = [];
  const structural = [];
  const jobs = [];

  for (const row of rows) {
    const slug = toSlug(row.common_name);
    if (only && slug !== only) continue;
    const producers = splitList(row.producers);
    const links = splitList(row.producer_links);
    if (producers.length !== links.length) {
      structural.push({
        species: row.common_name,
        slug,
        problem: `${producers.length} producers but ${links.length} links. Names after the first gap are paired with the wrong link on the site.`,
      });
    }
    if (producers.length === 0) structural.push({ species: row.common_name, slug, problem: "No producers listed" });
    const keywords = keywordsFor(slug, row);
    const n = Math.max(producers.length, links.length);
    for (let i = 0; i < n; i++) {
      const producer = producers[i] ?? "(no producer name)";
      const url = links[i];
      if (!url) {
        results.push({ species: row.common_name, slug, producer, url: "", status: null, finalUrl: null, title: "", verdict: "BAD_URL", note: "Producer has no link" });
        continue;
      }
      jobs.push(() => checkLink(slug, row, producer, url, keywords));
    }
  }

  // run with limited concurrency
  let idx = 0;
  async function worker() {
    while (idx < jobs.length) {
      const j = jobs[idx++];
      results.push(await j());
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  const order = { BAD_URL: 0, DEAD: 1, GENERIC: 2, BLOCKED: 3, INFO: 4, OK: 5 };
  results.sort((a, b) => order[a.verdict] - order[b.verdict] || a.species.localeCompare(b.species) || a.producer.localeCompare(b.producer));
  const counts = Object.fromEntries(Object.keys(order).map((k) => [k, results.filter((r) => r.verdict === k).length]));

  // species with no OK/INFO link at all
  const bySpecies = new Map();
  for (const r of results) {
    if (!bySpecies.has(r.slug)) bySpecies.set(r.slug, { species: r.species, ok: 0, total: 0 });
    const s = bySpecies.get(r.slug);
    s.total++;
    if (r.verdict === "OK") s.ok++;
  }
  const noBuy = [...bySpecies.values()].filter((s) => s.ok === 0);

  const date = new Date().toISOString().slice(0, 10);
  const md = [];
  md.push(`# Directory producer link check, ${date}`);
  md.push("");
  md.push(`${results.length} links across ${bySpecies.size} species. ` + Object.entries(counts).map(([k, v]) => `**${k}** ${v}`).join(" · "));
  md.push("");
  if (structural.length) {
    md.push("## Data problems in the sheet (fix these first)");
    md.push("");
    for (const s of structural) md.push(`- **${s.species}**: ${s.problem}`);
    md.push("");
  }
  if (noBuy.length) {
    md.push("## Species with no working purchase link");
    md.push("");
    md.push(noBuy.map((s) => `${s.species} (${s.total} link${s.total === 1 ? "" : "s"})`).join(", "));
    md.push("");
  }
  const bad = results.filter((r) => r.verdict !== "OK");
  md.push(`## Links needing attention (${bad.length})`);
  md.push("");
  md.push("| Verdict | Species | Producer | Status | Link | Note |");
  md.push("|---|---|---|---|---|---|");
  for (const r of bad) {
    const link = r.url ? `[${r.url.replace(/^https?:\/\/(www\.)?/, "").slice(0, 60)}](${r.url})` : "";
    md.push(`| ${r.verdict} | ${r.species} | ${r.producer} | ${r.status ?? ""} | ${link} | ${r.note.replace(/\|/g, "/")} |`);
  }
  md.push("");
  md.push(`<details><summary>Working product links (${counts.OK})</summary>`);
  md.push("");
  md.push("| Species | Producer | Link |");
  md.push("|---|---|---|");
  for (const r of results.filter((r) => r.verdict === "OK")) md.push(`| ${r.species} | ${r.producer} | ${r.url} |`);
  md.push("");
  md.push("</details>");
  md.push("");
  md.push("Verdicts: BAD_URL malformed or mispaired · DEAD not responding or 404 · GENERIC homepage or wrong product · BLOCKED bot wall, check by hand · INFO species page without a buy button · OK product page.");

  const report = md.join("\n");
  console.log(report);
  if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ date, counts, structural, noBuy, results }, null, 2));
  const mdOut = args.includes("--md") ? args[args.indexOf("--md") + 1] : null;
  if (mdOut) fs.writeFileSync(mdOut, report);

  if (counts.BAD_URL || counts.DEAD || structural.length) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
