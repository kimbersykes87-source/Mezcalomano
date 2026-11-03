// Menu extraction (plan v2, section 4.3). Pure functions, no network.
//
// analyzeMenu() reads menu text and returns proposed claims, never approved ones.
// A match counts toward the non espadin tally only when the line looks like a
// bottle listing (price, volume, ABV, village or producer) or sits under a
// mezcal, agave or destilados heading. Cocktail and marketing mentions are
// kept as "weak" and go to human review, never auto counted.

import { aliasNeedsContext, sortedAliasKeys, AGAVE_CONTEXT_WORDS, BLEND_WORDS, ESPADIN_SLUG } from "./aliases.mjs";
import { capLine, foldAccents, htmlToText, looksImageOnly, toMatchText } from "./text.mjs";

/** Fixed failure reasons (plan section 6). */
export const FAILURE_REASONS = ["blocked", "no_menu_found", "image_only", "no_species", "timeout", "parse_error"];

const BLOCK_PHRASES = /(verify you are (a )?human|just a moment|attention required|access denied|are you a robot|enable javascript and cookies|request blocked|pardon our interruption|checking your browser|captcha|bot detection|unusual traffic)/i;

const COCKTAIL_RE = /\b(cocktail|cocktails|coctel|cocteles|margarita|margaritas|paloma|negroni|old fashioned|mule|spritz|sour|highball|martini|daiquiri|mojito|infused|shaken|stirred|garnish|garnished|syrup|bitters|served with|topped with|rinse|twist on|riff)\b/;
const MARKETING_RE = /\b(we|our|ours|we're|nuestro|nuestra|nuestros|nuestras|welcome|bienvenidos?|since \d{4}|desde \d{4}|passion|journey|story|history|love|experience|discover|come in|visit us)\b/;

const HEADING_AGAVE_RE = /\b(mezcal|mezcales|mescal|agave|agaves|maguey|destilado|destilados|destilados de agave|agave spirits)\b/;
const HEADING_COCKTAIL_RE = /\b(cocktail|cocktails|coctel|cocteles|signature|margarita|margaritas|drinks list|long drinks)\b/;
const HEADING_WORDS_RE = /\b(mezcal|mezcales|agave|destilados?|cocktails?|cocteles?|signature|tequila|whisk(e)?y|beer|cerveza|wine|vino|spirits|bottle list|by the glass|flights?|menu|carta|drinks|bebidas|food|comida|brunch|dinner|lunch|desserts?|postres|sotol|raicilla|bacanora)\b/;

const PRICE_RES = [
  /[$€£]\s?\d/,
  /\d\s?[$€£]/,
  /\b\d{1,4}(?:[.,]\d{1,2})?\s?(?:eur|usd|gbp|euros|dollars)\b/i,
  /(?:\.{2,}|\s[-|·•:]\s|\t|\s{2,})\s*\d{1,3}(?:[.,]\d{1,2})?\s*$/,
];
const VOLUME_RE = /\b\d+(?:[.,]\d+)?\s?(?:ml|cl|oz|fl\.?\s?oz|ltr|litro|litros|l)\b/i;
const ABV_RE = /(?:\b\d{2}(?:[.,]\d+)?\s?%|\b\d{2}(?:[.,]\d+)?\s?(?:abv|alc\.?|vol\.?)\b|\babv\b|\balc\/vol\b)/i;
const ORIGIN_RE = /\b(san|santa|santo|santiago|villa|ejutla|matatlan|miahuatlan|sola de vega|tlacolula|yautepec|candelaria|ocotlan|mitla|lachigui|lachiguiri|oaxaca|durango|guerrero|michoacan|puebla|jalisco|zacatecas|san luis potosi|sonora|chihuahua|tamaulipas|veracruz|palenque|productor|producer|maestro mezcalero|mezcalero|destilador|destileria|distillery|distiller|hecho por|made by)\b|\bby\s+[A-Z][a-z]+/;

const FUNCTION_WORDS = new Set(["the", "a", "an", "of", "and", "with", "is", "are", "our", "your", "to", "for", "in", "on", "that", "this",
  "de", "del", "la", "el", "los", "las", "un", "una", "con", "y", "que", "es", "en", "para", "por", "su", "sus", "se", "al", "lo", "todo", "esto"]);

function functionWordCount(line) {
  return foldAccents(line).split(/[^a-z]+/).filter((w) => FUNCTION_WORDS.has(w)).length;
}

const STOP_AFTER_AGAVE = new Set([
  "horno", "madura", "capon", "capado", "puede", "cadenas", "cocido", "tostado", "crudo", "valles", "trabajado", "pinata", "pinas", "cultivo",
  "de", "del", "la", "el", "y", "and", "spirits", "spirit", "azul", "blue", "nectar", "syrup", "sirope", "distillate",
  "distillates", "silvestre", "silvestres", "cultivado", "sin", "con", "para", "es", "en", "or", "o", "that", "which",
  "from", "with", "plants", "plant", "hearts", "piñas", "pinas", "wild", "cultivated", "roasted", "baked", "based",
]);
const COMMON_NEAR_WORDS = new Set(["mexicana", "mexicanos", "mexicanas", "montanas", "montanes", "verdes", "altos", "altas"]);

function hasAny(text, words) {
  return words.some((w) => text.includes(` ${w} `));
}

function isAllCaps(line) {
  const letters = line.replace(/[^A-Za-zÀ-ÿ]/g, "");
  return letters.length >= 3 && letters === letters.toUpperCase();
}

/** Levenshtein distance with an early cutoff. */
export function editDistance(a, b, max = 3) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      cur[j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** Find alias matches in a line. Longest alias wins, overlaps are dropped. */
export function findMatches(line, table, keys = sortedAliasKeys(table)) {
  const text = toMatchText(line);
  const taken = [];
  const found = [];
  for (const key of keys) {
    const entry = table.aliases.get(key);
    let from = 0;
    for (;;) {
      const at = text.indexOf(` ${key} `, from);
      let hit = at, len = key.length;
      if (at < 0) {
        if (aliasNeedsContext(key)) break; // everyday words: no plural leniency
        const plural = [`${key}s`, `${key}es`].find((p) => text.indexOf(` ${p} `, from) >= 0 && !table.aliases.has(p));
        if (!plural) break;
        hit = text.indexOf(` ${plural} `, from);
        len = plural.length;
      }
      const start = hit + 1, end = start + len;
      from = end;
      if (taken.some(([s, e]) => start < e && end > s)) continue;
      taken.push([start, end]);
      found.push({ alias: key, entry, start, needsContext: aliasNeedsContext(key) });
    }
  }
  return found.sort((a, b) => a.start - b.start);
}

function detectFeatures(line) {
  const price = PRICE_RES.some((re) => re.test(line));
  const volume = VOLUME_RE.test(line);
  const abv = ABV_RE.test(line);
  const origin = ORIGIN_RE.test(foldAccents(line).replace(/[^a-z0-9 ]+/g, " ")) || /\bby\s+[A-Z][a-z]+/.test(line);
  return { price, volume, abv, origin, count: [price, volume, abv, origin].filter(Boolean).length };
}

function headingKindOf(heading) {
  const f = foldAccents(heading);
  if (HEADING_COCKTAIL_RE.test(f) && !HEADING_AGAVE_RE.test(f)) return "cocktail";
  if (HEADING_AGAVE_RE.test(f)) return "agave";
  return "other";
}

function classifyHeading(raw, hasAlias) {
  const line = raw.trim();
  if (/^#{1,6}\s+/.test(line)) return line.replace(/^#{1,6}\s+/, "").trim();
  if (hasAlias || line.length > 60) return null;
  const f = foldAccents(line);
  const feats = detectFeatures(line);
  if (feats.count > 0) return null;
  if (/:\s*$/.test(line) && line.split(/\s+/).length <= 6) return line.replace(/:\s*$/, "");
  if (isAllCaps(line) && line.split(/\s+/).length <= 6) return line;
  if (HEADING_WORDS_RE.test(f) && line.split(/\s+/).length <= 4 && !/[.!?]$/.test(line)) return line;
  return null;
}

function unknownTermsIn(line, heading, table, ctxOk) {
  if (!ctxOk) return [];
  const out = [];
  const folded = foldAccents(line).replace(/[^a-z0-9 ]+/g, " ");
  const known = new Set(table.aliases.keys());
  for (const m of folded.matchAll(/\b(?:agave|maguey)\s+([a-z]{4,})/g)) {
    const w = m[1];
    if (STOP_AFTER_AGAVE.has(w) || known.has(w) || known.has(`agave ${w}`)) continue;
    if ([...known].some((k) => k.startsWith(`agave ${w}`))) continue;
    out.push({ term: w, kind: "after_agave_word", nearest: null });
  }
  const singles = [...known].filter((k) => !k.includes(" ") && k.length >= 6);
  for (const tok of new Set(folded.split(/\s+/).filter((t) => t.length >= 6))) {
    if (known.has(tok) || COMMON_NEAR_WORDS.has(tok)) continue;
    if ([...known].some((k) => k.includes(" ") && k.split(" ").includes(tok))) continue;
    const max = tok.length >= 9 ? 2 : 1;
    let best = null;
    for (const k of singles) {
      const d = editDistance(tok, k, max);
      if (d <= max && (!best || d < best.d)) best = { k, d };
    }
    if (best && !out.some((o) => o.term === tok)) out.push({ term: tok, kind: "near_alias", nearest: best.k });
  }
  return out.map((o) => ({ ...o, line: capLine(line), heading: heading ? capLine(heading, 120) : null }));
}

/**
 * @param {object} input
 * @param {string} [input.text] plain text (PDF or OCR output) or pre-converted HTML text
 * @param {string} [input.html] raw HTML, converted with htmlToText when text is absent
 * @param {"html"|"pdf"|"ocr"|"owner_file"} [input.format]
 * @param {number} [input.httpStatus]
 * @param {boolean} [input.imageOnly] caller knows the menu is a picture
 * @param {object} table result of buildAliasTable()
 */
export function analyzeMenu(input, table) {
  const format = input.format || "html";
  const result = {
    status: "ok", failureReason: null, format, lowConfidence: format === "ocr",
    claims: [], espadin: [], unknownTerms: [], mezcalLines: [], distinctNonEspadin: [], counts: {},
  };
  const text = input.text ?? (input.html ? htmlToText(input.html) : "");

  if ([401, 403, 429].includes(input.httpStatus) || (text.length < 2500 && BLOCK_PHRASES.test(text))) {
    return { ...result, status: "blocked", failureReason: "blocked" };
  }
  const bare = text.replace(/\s+/g, "");
  if (input.imageOnly || (input.html && looksImageOnly(input.html, text)) || (format === "pdf" && bare.length < 40)) {
    return { ...result, status: "image_only", failureReason: "image_only" };
  }
  if (bare.length === 0) return { ...result, status: "parse_error", failureReason: "parse_error" };

  const keys = sortedAliasKeys(table);
  const lines = text.split(/\r?\n/).map((l) => l.replace(/^\s*[-*•·]\s+/, "").trim()).filter(Boolean);
  let heading = null, headingKind = "other";
  let sawMezcalWord = false;
  const seen = new Set();
  const unknown = new Map();

  for (const line of lines) {
    const folded = foldAccents(line);
    const matchText = toMatchText(line);
    if (HEADING_AGAVE_RE.test(folded)) sawMezcalWord = true;
    const matches = findMatches(line, table, keys);

    const h = classifyHeading(line, matches.length > 0 && !/^#{1,6}\s+/.test(line));
    if (h) { heading = h; headingKind = headingKindOf(h); continue; }

    const feats = detectFeatures(line);
    const agaveHeading = headingKind === "agave";
    const lineHasAgaveWord = hasAny(matchText, AGAVE_CONTEXT_WORDS);
    // Everyday words (alto, verde...) need an agave word on the line itself, or a bottle signal under an agave heading.
    const ctxOk = lineHasAgaveWord || (agaveHeading && feats.count > 0);

    for (const u of unknownTermsIn(line, heading, table, lineHasAgaveWord || agaveHeading || feats.count > 0)) {
      const prev = unknown.get(u.term);
      if (prev) prev.seen += 1; else unknown.set(u.term, { ...u, seen: 1 });
    }
    if (matches.length === 0) continue;

    const isCocktail = headingKind === "cocktail" || COCKTAIL_RE.test(folded);
    const words = line.split(/\s+/).length;
    const fnWords = functionWordCount(line);
    const sentence = /[.!?]$/.test(line);
    const proseLike = line.length > 220 || words >= 28 || MARKETING_RE.test(folded)
      || (feats.count === 0 && (fnWords >= 3 || (fnWords >= 2 && sentence)));
    const isBlend = hasAny(matchText, BLEND_WORDS);
    const listingBase = !isCocktail && (feats.count >= 1 || agaveHeading) && !(proseLike && feats.count < 2);
    const distinctOnLine = new Set(matches.map((m) => m.entry.id)).size;
    const listLike = distinctOnLine > 3 && !isBlend;

    result.mezcalLines.push({ line: capLine(line), heading: heading ? capLine(heading, 120) : null });

    for (const m of matches) {
      const e = m.entry;
      const reasons = [];
      let confidence;
      if (isCocktail) reasons.push("cocktail_mention");
      if (proseLike && feats.count < 2) reasons.push("marketing_or_prose");
      if (!listingBase && !isCocktail && !proseLike) reasons.push("no_listing_signal");
      if (m.needsContext && !ctxOk) reasons.push("ambiguous_word_no_context");
      if (listLike) reasons.push("multi_species_line");

      if (reasons.length > 0) confidence = "weak";
      else confidence = feats.count >= 2 ? "strong" : "normal";
      if (format === "ocr") { reasons.push("ocr_low_confidence"); confidence = "low_ocr"; }

      const base = {
        line_text: capLine(line),
        heading: heading ? capLine(heading, 120) : null,
        matched_alias: m.alias,
        features: { price: feats.price, volume: feats.volume, abv: feats.abv, origin: feats.origin },
        blend: isBlend,
        reasons,
      };
      const isEspadin = e.type === "species" && e.slug === ESPADIN_SLUG;
      if (isEspadin) {
        result.espadin.push({ ...base, species_slug: ESPADIN_SLUG, confidence });
        continue;
      }
      const key = e.type === "group" ? e.group : e.slug;
      const dedupe = `${key}|${base.line_text}`;
      if (seen.has(dedupe)) continue;
      seen.add(dedupe);
      result.claims.push({
        kind: "species_listed",
        species_slug: e.type === "species" ? e.slug : null,
        species_group: e.type === "group" ? e.group : null,
        species_name: e.label,
        in_deck: e.deck !== false,
        angustifolia_variant: Boolean(e.angustifoliaVariant),
        confidence,
        counts: (confidence === "strong" || confidence === "normal") && format !== "ocr",
        ...base,
      });
    }
  }

  result.distinctNonEspadin = countDistinct(result.claims);
  result.unknownTerms = [...unknown.values()];
  result.mezcalLines = result.mezcalLines.slice(0, 60);
  result.counts = {
    lines: lines.length,
    claims: result.claims.length,
    counted_claims: result.claims.filter((c) => c.counts).length,
    weak_claims: result.claims.filter((c) => c.confidence === "weak").length,
    espadin_mentions: result.espadin.length,
    distinct_non_espadin: result.distinctNonEspadin.length,
    unknown_terms: result.unknownTerms.length,
  };
  if (!sawMezcalWord && result.claims.length === 0 && result.espadin.length === 0) {
    return { ...result, status: "no_menu_found", failureReason: "no_menu_found" };
  }
  if (result.distinctNonEspadin.length === 0) result.failureReason = "no_species";
  return result;
}

/** Distinct species (or groups) with at least one counted claim. */
export function countDistinct(claims) {
  const set = new Set();
  for (const c of claims) if (c.counts) set.add(c.species_slug || c.species_group);
  return [...set];
}

/** Badge from section 4.2: "Species listed" for 2 to 4 distinct species, "Deep list" for 5 or more. */
export function badgeFor(distinctCount) {
  if (distinctCount >= 5) return "Deep list";
  if (distinctCount >= 2) return "Species listed";
  return null;
}
