// Species alias table (plan v2, section 4.3).
// Built from data/Species_Final - Website.csv (the 40 deck species) plus an
// extended list of other agave names, so species outside the deck still count
// as "not espadin". Pure functions; the CSV text is passed in.

import Papa from "papaparse";
import { foldAccents } from "./text.mjs";

/** Same rule as src/lib/slug.ts toSlug (kept in sync by hand, tested). */
export function toSlug(name) {
  return String(name).trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

export const ESPADIN_SLUG = "espadin";

/**
 * Extra spellings per deck species slug (folded form is computed later).
 * Typos listed here are the ones seen on real menus; anything else near an alias
 * goes to unknown_terms for a person to decide.
 */
const VARIANTS = {
  espadin: ["espadin", "espadon", "agave angustifolia", "angustifolia"],
  tobala: ["tobala", "tobalas", "agave potatorum", "potatorum"],
  tepextate: ["tepextate", "tepeztate", "tepextates", "tepeztates", "agave marmorata", "marmorata"],
  arroqueno: ["arroqueno", "arroquenos", "agave americana var oaxacensis"],
  sierra_negra: ["sierra negra"],
  jabali: ["jabali", "agave convallis", "convallis"],
  cimarron: ["cimarron", "agave salmiana subsp crassispina"],
  salmiana: ["salmiana", "agave salmiana"],
  cenizo: ["cenizo", "agave durangensis", "durangensis"],
  henequen: ["henequen", "agave fourcroydes"],
  pacifica: ["pacifica", "agave angustifolia var pacifica"],
  cincoanero: ["cincoanero", "cinco anero", "agave cantala"],
  weber_azul: ["weber azul", "agave tequilana", "tequilana"],
  papalote: ["papalote", "cupreata", "agave cupreata"],
  masparillo: ["masparillo", "maximiliana", "agave maximiliana"],
  alto: ["alto", "inaequidens", "agave inaequidens"],
  lamparillo: ["lamparillo", "asperrima", "agave asperrima"],
  lyobaa_coyote: ["lyobaa coyote", "lyobaa", "agave lyobaa"],
};

/**
 * Names that are also ordinary words (alto, verde, coyote...). They only count
 * when the line or its heading also mentions agave, maguey, mezcal or similar.
 */
export const CONTEXT_REQUIRED = new Set([
  "alto", "verde", "mexicano", "montana", "coyote", "rayo", "lumbre", "castilla",
  "pacifica", "barril", "cenizo", "jabali", "papalote", "chuparrosa", "pulquero",
]);

/**
 * Ambiguous alias groups: local names that overlap in practice, so a menu
 * saying one of them proves "this group", not one deck species.
 */
export const GROUPS = {
  cuishe_group: {
    label: "Cuishe group",
    scientific: "agave karwinskii",
    aliases: [
      "cuishe", "cuishes", "cuixe", "cuixes", "madrecuishe", "madrecuixe", "madre cuishe", "madre cuixe",
      "bicuishe", "bicuixe", "barril", "barriles", "tobasiche", "tobaziche", "tobasiches", "tobaziches",
      "agave karwinskii", "karwinskii", "agave kerchovei", "kerchovei",
    ],
  },
  americana_group: { label: "Agave americana group", scientific: "agave americana", aliases: ["agave americana"] },
  rhodacantha_group: { label: "Agave rhodacantha group", scientific: "agave rhodacantha", aliases: ["agave rhodacantha"] },
};

/** Species that belong to a group by scientific name are still matched by their own common name. */
const GROUP_MEMBER_SLUGS = new Set(["cuishe", "barril", "madrecuixe", "bicuixe", "tobaziche"]);

/** Other agave names that are not in the deck. They count as non espadin. */
export const EXTENDED_SPECIES = [
  { slug: "x_lechuguilla", name: "Lechuguilla", scientific: "Agave lechuguilla", aliases: ["lechuguilla", "agave lechuguilla"] },
  { slug: "x_palmeri", name: "Palmeri", scientific: "Agave palmeri", aliases: ["agave palmeri"] },
  { slug: "x_bovicornuta", name: "Bovicornuta", scientific: "Agave bovicornuta", aliases: ["agave bovicornuta", "lechuguilla verde"] },
  { slug: "x_pelon", name: "Pelon", scientific: "Agave sp.", aliases: [] },
];

/** Words that mark a blend (ensamble). */
export const BLEND_WORDS = ["ensamble", "ensambles", "ensemble", "blend", "blended", "blends", "mixed agaves", "multi agave", "poliagave"];

/** Generic agave words used for context checks and "agave X" unknown term detection. */
export const AGAVE_CONTEXT_WORDS = [
  "agave", "agaves", "maguey", "magueyes", "mezcal", "mezcales", "mescal", "destilado", "destilados",
  "ensamble", "ensambles", "palenque", "mezcalero", "joven", "reposado", "anejo",
];

function addAlias(map, folded, entry) {
  const key = folded.trim();
  if (!key) return;
  const prev = map.get(key);
  if (prev && prev.id !== entry.id) {
    // Same alias for two different entries: keep the ambiguous one as a group if either is a group.
    if (prev.type === "group") return;
    if (entry.type === "group") { map.set(key, entry); return; }
    return; // first species wins; the CSV order is stable
  }
  map.set(key, entry);
}

/**
 * Build the alias table.
 * @param {string} csvText contents of data/Species_Final - Website.csv
 * @returns {{aliases: Map<string, object>, species: object[], groups: object, espadinSlug: string}}
 */
export function buildAliasTable(csvText) {
  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  const rows = parsed.data.filter((r) => r.common_name && r.common_name.trim());
  if (rows.length === 0) throw new Error("species CSV has no rows");

  const species = rows.map((r) => ({
    slug: toSlug(r.common_name),
    name: r.common_name.trim(),
    scientific: (r.scientific_name || "").trim(),
    deck: true,
  }));

  const aliases = new Map();
  const groupEntry = (id) => ({ id, type: "group", slug: null, group: id, label: GROUPS[id].label, deck: true });

  for (const [id, g] of Object.entries(GROUPS)) {
    for (const a of g.aliases) addAlias(aliases, foldAccents(a).replace(/[^a-z0-9]+/g, " "), groupEntry(id));
  }

  // Scientific names shared by several deck species map to a group (or to espadin for angustifolia).
  const bySci = new Map();
  for (const s of species) {
    const sci = foldAccents(s.scientific).replace(/[^a-z0-9]+/g, " ").trim();
    if (!sci || sci.includes(" sp ")) continue;
    bySci.set(sci, [...(bySci.get(sci) || []), s]);
  }

  for (const s of species) {
    const entry = {
      id: s.slug, type: "species", slug: s.slug, group: null, label: s.name,
      scientific: s.scientific, deck: true, espadin: s.slug === ESPADIN_SLUG,
    };
    const names = new Set([foldAccents(s.name).replace(/[^a-z0-9]+/g, " ").trim(), ...(VARIANTS[s.slug] || [])]);
    if (GROUP_MEMBER_SLUGS.has(s.slug)) {
      for (const n of [...names]) addAlias(aliases, n, groupEntry("cuishe_group"));
      continue;
    }
    const sci = foldAccents(s.scientific).replace(/[^a-z0-9]+/g, " ").trim();
    const sharing = bySci.get(sci) || [];
    if (sci && !sci.includes(" sp ")) {
      if (sharing.length === 1) names.add(sci);
      else if (sci === "agave angustifolia") names.add(sci); // bare latin name means espadin
    }
    for (const n of names) {
      if (s.slug !== ESPADIN_SLUG && n === "agave angustifolia") continue;
      addAlias(aliases, n, entry);
    }
    // Angustifolia relatives are separate deck cards; flag them so reviewers see the link to espadin.
    if (sci === "agave angustifolia" && s.slug !== ESPADIN_SLUG) entry.angustifoliaVariant = true;
  }

  for (const x of EXTENDED_SPECIES) {
    for (const a of x.aliases) {
      addAlias(aliases, foldAccents(a).replace(/[^a-z0-9]+/g, " "), {
        id: x.slug, type: "species", slug: x.slug, group: null, label: x.name, scientific: x.scientific, deck: false, espadin: false,
      });
    }
  }

  return { aliases, species, groups: GROUPS, espadinSlug: ESPADIN_SLUG };
}

/** Only the plain common name is context gated; latin names are specific enough. */
export function aliasNeedsContext(aliasKey) {
  return CONTEXT_REQUIRED.has(aliasKey);
}

/** Sorted alias keys, longest first, for greedy matching. */
export function sortedAliasKeys(table) {
  return [...table.aliases.keys()].sort((a, b) => b.split(" ").length - a.split(" ").length || b.length - a.length);
}
