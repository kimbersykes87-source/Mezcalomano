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
