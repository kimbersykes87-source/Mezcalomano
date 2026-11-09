import type { Species } from "@/types/species";
import { parseStates } from "@/lib/agave-cards";

/** Plain labels for the sheet's management_category values. */
const MANAGEMENT_LABELS: Record<string, string> = {
  cultivated_workhorse: "cultivated",
  managed_wild: "wild and semi managed",
  wild_stable: "mostly wild",
  wild_at_risk: "wild and at risk",
};

export function managementLabel(category: string | null | undefined): string | null {
  const key = (category ?? "").trim().toLowerCase();
  return MANAGEMENT_LABELS[key] ?? null;
}

/** "Agave sp. (not formally classified)" becomes "Agave sp." for titles. */
export function shortScientificName(name: string): string {
  return name.replace(/\s*\(.*\)\s*$/, "").trim();
}

/**
 * Alt text for a species card image, the main content image on directory pages:
 * "Alto agave card from the Mezcalómano Discovery Deck, Agave inaequidens".
 * One helper so every place that shows a card uses the same wording.
 */
export function cardImageAlt(commonName: string, scientificName: string): string {
  const sci = shortScientificName(scientificName);
  return `${commonName} agave card from the Mezcalómano Discovery Deck${sci ? `, ${sci}` : ""}`;
}

export function speciesTitle(s: Pick<Species, "common_name" | "scientific_name">): string {
  return `${s.common_name} Mezcal (${shortScientificName(s.scientific_name)}) | Mezcalómano`;
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** States when there are 3 or fewer, otherwise the region. */
export function placesText(s: Pick<Species, "states" | "geo_region">): string | null {
  const states = parseStates(s.states);
  if (states.length > 0 && states.length <= 3) return joinList(states);
  const region = (s.geo_region ?? "").replace(/\s*\(.*?\)\s*/g, " ").trim();
  return region || (states.length ? joinList(states) : null);
}

/** "very_large" becomes "very large". */
export function sizeClassLabel(v: string | null | undefined): string | null {
  const t = (v ?? "").replace(/_/g, " ").trim();
  return t || null;
}

/**
 * Meta description, at most 160 characters. Each candidate is a whole sentence or two, so a
 * long one is dropped rather than cut mid sentence.
 */
export function speciesMetaDescription(s: Species): string {
  const sci = shortScientificName(s.scientific_name);
  const label = managementLabel(s.management_category);
  const places = placesText(s);
  const kind = label ? `${label} agave` : "agave";
  const where = !places ? "" : /^widespread/i.test(places) ? " grown across Mexico" : ` from ${places}`;
  const first = `${s.common_name} mezcal comes from ${sci}, ${kind}${where}.`;
  const candidates = [
    `${first} Size, taste, producers and where to buy.`,
    `${first} Size, taste and producers.`,
    first,
    `${s.common_name} mezcal comes from ${sci}.`,
  ];
  return candidates.find((c) => c.length <= 160) ?? candidates[candidates.length - 1];
}

/** Compass words stored as one cell, split on commas, slashes, dots or spaces. */
export function compassWords(v: string | null | undefined): string[] {
  return (v ?? "")
    .split(/[,;/·|]|\s+/)
    .map((w) => w.trim())
    .filter(Boolean);
}

/** Case-insensitive unique producer names, in order. */
export function uniqueProducerNames(names: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const n of names) {
    const k = n.trim().toLowerCase();
    if (k && !seen.has(k)) {
      seen.add(k);
      out.push(n.trim());
    }
  }
  return out;
}
