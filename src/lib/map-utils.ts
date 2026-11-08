/**
 * Map species "states" column values to GeoJSON state_name.
 * GeoJSON (mexico-leaflet) uses full official names; CSV often uses short names.
 */
const DATA_TO_GEO: Record<string, string> = {
  "Estado de México": "México",
  "Estado de Mexico": "México",
  Michoacán: "Michoacán de Ocampo",
  Veracruz: "Veracruz de Ignacio de la Llave",
  Coahuila: "Coahuila de Zaragoza",
};

/**
 * Normalize a state name from species data to match GeoJSON state_name.
 */
export function normalizeStateForGeo(state: string): string {
  const trimmed = state.trim();
  return DATA_TO_GEO[trimmed] ?? trimmed;
}

/**
 * Parse species.states (semicolon-separated) into an array of normalized state names for GeoJSON matching.
 */
export function parseStatesForGeo(states: string | null): string[] {
  if (!states?.trim()) return [];
  return states
    .split(";")
    .map((s) => normalizeStateForGeo(s))
    .filter(Boolean);
}

/**
 * Get the set of all state names (normalized for GeoJSON) that appear in the species data.
 */
export function getStatesInData(
  species: { states: string | null }[]
): Set<string> {
  const set = new Set<string>();
  for (const s of species) {
    for (const state of parseStatesForGeo(s.states)) {
      set.add(state);
    }
  }
  return set;
}

/**
 * Everyday name for a state, as our copy writes it, keyed by GeoJSON state_name.
 * "México" and "Distrito Federal" are deliberately absent: linking the word "México"
 * would catch the country, not the state.
 */
const GEO_TO_SHORT: Record<string, string> = {
  "Michoacán de Ocampo": "Michoacán",
  "Veracruz de Ignacio de la Llave": "Veracruz",
  "Coahuila de Zaragoza": "Coahuila",
};

/** States we will never auto-link, because the word is ambiguous in running copy. */
const NOT_LINKABLE = new Set(["México", "Distrito Federal"]);

/** "Michoacán de Ocampo" and "Michoacán" both give "michoacan". */
export function stateSlug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** The everyday name for a GeoJSON state_name ("Veracruz de Ignacio de la Llave" gives "Veracruz"). */
export function shortStateName(geoName: string): string {
  return GEO_TO_SHORT[geoName] ?? geoName;
}

/**
 * Resolve a /map?state= value to a GeoJSON state_name, forgiving accents, case and
 * the long official forms. Returns null when nothing matches.
 */
export function resolveStateParam(param: string, geoNames: string[]): string | null {
  const wanted = stateSlug(param);
  if (!wanted) return null;
  for (const geo of geoNames) {
    if (stateSlug(geo) === wanted) return geo;
    if (stateSlug(shortStateName(geo)) === wanted) return geo;
  }
  return null;
}

/** Every state name our copy may mention, longest first so "Baja California Sur" wins over "Baja California". */
export function linkableStateNames(geoNames: string[]): { name: string; slug: string }[] {
  const out: { name: string; slug: string }[] = [];
  for (const geo of geoNames) {
    if (NOT_LINKABLE.has(geo)) continue;
    const short = shortStateName(geo);
    out.push({ name: short, slug: stateSlug(short) });
    if (short !== geo) out.push({ name: geo, slug: stateSlug(short) });
  }
  return out.sort((a, b) => b.name.length - a.name.length);
}

/**
 * Every state_name in public/geo/mexico-states.geojson, as a plain list so this module stays
 * usable on the client. Keep in step with that file if it is ever replaced.
 */
export const MEXICO_STATE_NAMES: string[] = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Coahuila de Zaragoza",
  "Colima",
  "Distrito Federal",
  "Durango",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "México",
  "Michoacán de Ocampo",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz de Ignacio de la Llave",
  "Yucatán",
  "Zacatecas",
];
