/**
 * Shared validation for the directory's producer and purchase link data.
 *
 * `scripts/check-producer-links.mjs` (the weekly link check) and
 * `scripts/seed-species-from-csv.mjs` (what pushes the CSV to Supabase) both import this,
 * so one rule is enforced in one place. Everything here is offline: no network, no env.
 *
 * Every problem carries `blocking`. Blocking problems stop `npm run seed:species`, because
 * they put a wrong link in front of a customer. Non blocking ones are reported and looked at
 * by a person.
 */

import fs from "node:fs";
import path from "node:path";

/** Same split the site uses (src/lib/producers.ts): comma separated, outer quotes stripped. */
export function splitList(val) {
  return (val || "")
    .replace(/^"+|"+$/g, "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function norm(s) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function toSlug(name) {
  return norm(name).trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

export function hostOf(url) {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Hosts that are a shop, an importer or a review site rather than one producer's own site.
 * A shop host is never expected to match the producer name, so the producer/host check skips it.
 *
 * The US shop hosts come from the two data files the rest of the directory already uses
 * (`data/us-shops.json` and `data/us-catalogs.json`), so there is no second copy to keep in step:
 * add a US shop host there, as MAP_WEBSITE_OPS already requires, and this check follows.
 *
 * EXTRA_RETAILER_HOSTS is for sellers that are NOT US shops, so they do not belong in
 * us-shops.json, but still carry other people's bottles. Add the date you checked.
 */
export const EXTRA_RETAILER_HOSTS = {
  "mezcalistas.com": "2026-11-07 review site, carries many producers",
  "skurnik.com": "2026-11-07 importer",
  "bswliquor.com": "2026-11-07 US liquor retailer, not set up for the catalog scan",
  "buen-mezcal.myshopify.com": "2026-11-07 retailer",
  "cuchillo.ca": "2026-11-07 retailer, Canada, so not a US shop",
  "lot001brands.com": "2026-11-07 brand portfolio site, carries several producers",
};

export function loadShopHosts(projectRoot) {
  const hosts = new Map();
  const add = (h, why) => {
    const k = String(h).toLowerCase().replace(/^www\./, "");
    if (k && !hosts.has(k)) hosts.set(k, why);
  };
  try {
    const j = JSON.parse(fs.readFileSync(path.join(projectRoot, "data", "us-shops.json"), "utf8"));
    for (const h of j.hosts || []) add(h, "us-shops.json");
  } catch {
    /* missing file: the producer/host check just gets noisier, it never crashes the run */
  }
  try {
    const j = JSON.parse(fs.readFileSync(path.join(projectRoot, "data", "us-catalogs.json"), "utf8"));
    for (const s of j.shops || []) if (s.host) add(s.host, "us-catalogs.json");
  } catch {
    /* same */
  }
  for (const [h, why] of Object.entries(EXTRA_RETAILER_HOSTS)) add(h, why);
  return hosts;
}

/**
 * Just the Shopify stores the weekly job scans (`data/us-catalogs.json`).
 *
 * Their product handles are machine generated and go stale: Madre Shop still serves
 * "Agua Del Sol - Coyote" at `/products/agua-del-sol-mexicano-2024`, and
 * "Dixeebe - Pulquero Edition 2" at `/products/copy-of-dixeebe-espadin-1`. So a handle on
 * one of these hosts is no evidence of which species a bottle is, and the species in the
 * path check below skips them. The live product title is the evidence, and the link check
 * already reads it straight from the store.
 */
export function loadCatalogHosts(projectRoot) {
  const hosts = new Set();
  try {
    const j = JSON.parse(fs.readFileSync(path.join(projectRoot, "data", "us-catalogs.json"), "utf8"));
    for (const s of j.shops || []) if (s.host) hosts.add(String(s.host).toLowerCase().replace(/^www\./, ""));
  } catch {
    /* missing file: the species in path check just gets noisier */
  }
  return hosts;
}

/**
 * Producers whose own website is named after something other than the producer, so the
 * producer/host check cannot match the two by name. Keyed by the producer name as the CSV
 * spells it, lowercased. This is deliberately per producer, not a list of allowed hosts:
 * allowing a host outright would have let the Koch/Cortijo mix up through, which is the
 * whole reason this check exists.
 */
export const BRAND_DOMAINS = {
  "gracias a dios": ["thankgad.com"],
  "el jolgorio": ["casacortes.mx"],
  "la medida": ["espiritusmisticos.site"],
  mezcalosfera: ["agavebymontiel.com"],
};

/** Words in a producer name that say nothing about which producer it is. */
const NAME_STOPWORDS = new Set([
  "mezcal", "mezcales", "destilado", "destilados", "agave", "spirits", "shop", "brands",
  "de", "del", "la", "el", "los", "las", "y", "and", "ensemble", "ensamble",
]);

export function nameTokens(producer) {
  return norm(producer)
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((t) => t.length >= 4 && !NAME_STOPWORDS.has(t));
}

/**
 * Words in a URL path that name one species. Used to catch a link filed against the wrong
 * species (a `cuixe` slug on a Tobala row). A word can belong to more than one species, which
 * is how Coyote and Lyobaa Coyote, or the karwinskii varietals, avoid flagging each other.
 * Botanical epithets are left out on purpose: several species share one.
 */
const SPECIES_PATH_WORDS = {
  espadin: ["espadin"],
  tobala: ["tobala"],
  tepextate: ["tepextate", "tepeztate", "tepestate", "tepezate"],
  cuishe: ["cuishe", "cuixe"],
  barril: ["barril"],
  madrecuixe: ["madrecuixe", "madrecuishe", "madre-cuixe", "madre-cuishe", "madrecuish"],
  bicuixe: ["bicuixe", "bicuishe"],
  tobaziche: ["tobaziche", "tobasiche", "tobasichi"],
  lumbre: ["lumbre"],
  montana: ["montana"],
  arroqueno: ["arroqueno"],
  sierra_negra: ["sierranegra", "sierra-negra"],
  coyote: ["coyote"],
  mexicano: ["mexicano"],
  masparillo: ["masparillo"],
  papalote: ["papalote"],
  salmiana: ["salmiana"],
  cimarron: ["cimarron"],
  cenizo: ["cenizo"],
  manso_sahuayo: ["sahuayo"],
  lyobaa_coyote: ["coyote", "lyobaa"],
  churique: ["churique"],
  weber_azul: ["tequilana"],
  warash: ["warash"],
  henequen: ["henequen"],
  pacifica: ["bacanora"],
  wocomahi: ["wocomahi", "sierreno"],
  jabali: ["jabali"],
  lamparillo: ["lamparillo"],
  tepemete: ["tepemete"],
  chahuiqui: ["chahuiqui", "chawi"],
  espadilla: ["espadilla"],
  cincoanero: ["cincoanero"],
  castilla: ["castilla"],
  chuparrosa: ["chuparrosa"],
  pulquero: ["pulquero"],
  pulque_chino: ["pulquechino", "pulque-chino"],
};

/** word -> set of slugs it may legitimately appear on. */
const WORD_OWNERS = (() => {
  const m = new Map();
  for (const [slug, words] of Object.entries(SPECIES_PATH_WORDS)) {
    for (const w of words) {
      if (!m.has(w)) m.set(w, new Set());
      m.get(w).add(slug);
    }
  }
  return m;
})();

/** Links that are a file to download rather than a page to buy from. */
const DOCUMENT_LINK_RE = /\.(pdf|docx?|xlsx?|pptx?|jpe?g|png|gif|webp|zip|csv)(?:$|[?#])/i;

/**
 * Every offline problem in the producer data.
 *
 * @param rows   parsed CSV rows, each with common_name, producers, producer_links
 * @param projectRoot repo root, used to read the two shop data files
 * @returns [{ species, slug, kind, problem, blocking }]
 */
export function producerDataProblems(rows, projectRoot) {
  const shopHosts = loadShopHosts(projectRoot);
  const catalogHosts = loadCatalogHosts(projectRoot);
  const out = [];
  for (const row of rows) {
    const species = String(row.common_name ?? "").trim();
    const slug = toSlug(species);
    const producers = splitList(row.producers);
    const links = splitList(row.producer_links);
    const push = (kind, problem, blocking) => out.push({ species, slug, kind, problem, blocking });

    // 0. counts, and a species with nothing listed
    if (producers.length !== links.length) {
      push(
        "count_parity",
        `${producers.length} producers but ${links.length} links. Names after the first gap are paired with the wrong link on the site.`,
        true
      );
    }
    if (producers.length === 0 && links.length === 0) {
      // Deliberate: Cincoanero has no bottling on sale, and the species page says so.
      // Reported so it stays visible, but it is not a fault and must not fail a run.
      push("no_bottling", "No producers and no links. Expected only where there is no bottling on sale.", false);
    } else if (producers.length === 0) {
      push("no_producers", `${links.length} link(s) but no producer names.`, true);
    }

    // 1. the same URL twice on one species (how the Koch/Cortijo copy paste survived)
    const urlSeen = new Map();
    links.forEach((u, i) => {
      const k = u.trim().toLowerCase();
      if (!urlSeen.has(k)) urlSeen.set(k, []);
      urlSeen.get(k).push(producers[i] ?? `link ${i + 1}`);
    });
    for (const [u, who] of urlSeen) {
      if (who.length > 1) {
        push("duplicate_url", `${who.join(" and ")} share one URL: ${u}. One of them is wrong.`, true);
      }
    }

    // 2. the same producer name twice on one species
    const nameSeen = new Map();
    producers.forEach((p) => {
      const k = norm(p).replace(/\s+/g, " ").trim();
      nameSeen.set(k, (nameSeen.get(k) || 0) + 1);
    });
    for (const [p, n] of nameSeen) {
      if (n > 1) push("duplicate_producer", `"${p}" is listed ${n} times.`, true);
    }

    // 3. producer name against the host it points at
    producers.forEach((producer, i) => {
      const url = links[i];
      if (!url) return;
      const host = hostOf(url);
      if (!host) return;
      if (shopHosts.has(host)) return;
      const allowed = BRAND_DOMAINS[norm(producer).trim()] || [];
      if (allowed.some((h) => host === h || host.endsWith(`.${h}`))) return;
      const flat = norm(host).replace(/[^a-z0-9]+/g, "");
      const tokens = nameTokens(producer);
      if (!tokens.length) return;
      if (tokens.some((t) => flat.includes(t))) return;
      push(
        "producer_host",
        `"${producer}" points at ${host}, which is neither their own domain nor a known shop. Either the link belongs to another producer, or add the host to data/us-shops.json (US shop) or to EXTRA_RETAILER_HOSTS / BRAND_DOMAINS in scripts/lib/producer-data.mjs.`,
        true
      );
    });

    // 4. a URL path naming a different species
    producers.forEach((producer, i) => {
      const url = links[i];
      if (!url) return;
      const host4 = hostOf(url);
      if (host4 && catalogHosts.has(host4)) return; // handle is the shop's and often stale
      let pathText;
      try {
        const u = new URL(url);
        pathText = norm(decodeURIComponent(u.pathname + u.search + u.hash)).replace(/[^a-z0-9-]+/g, "-");
      } catch {
        return;
      }
      const present = [...WORD_OWNERS.keys()].filter((w) => pathText.includes(w));
      // keep only the longest match in any overlapping pair, so "cuixe" inside "madrecuixe" is ignored
      const longest = present.filter((w) => !present.some((o) => o !== w && o.length > w.length && o.includes(w)));
      if (!longest.length) return;
      if (longest.some((w) => WORD_OWNERS.get(w).has(slug))) return;
      push(
        "foreign_species",
        `"${producer}" link path says "${longest.join('", "')}" but this row is ${species}: ${url}`,
        false
      );
    });

    // 5. a link to a file rather than a page someone can buy from
    producers.forEach((producer, i) => {
      const url = links[i];
      if (url && DOCUMENT_LINK_RE.test(url)) {
        push("document_link", `"${producer}" link is a file to download, not a page to buy from: ${url}`, false);
      }
    });
  }
  return out;
}
