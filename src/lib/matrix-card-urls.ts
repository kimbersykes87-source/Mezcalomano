/**
 * Fallback image URLs for directory species using the site's matrix card assets.
 * When Supabase image_url is null or broken, we resolve from this mapping.
 */

const MATRIX_INDEX_URL = "/assets/matrix/cards/index.json";

/** Aliases: CSV / Supabase common_name → index.json common_name */
const COMMON_NAME_ALIASES: Record<string, string> = {
  Tepextate: "Tepeztate",
  Montana: "Mountain Agave",
  "Cenizo ": "Cenizo Durangensis",
  Cenizo: "Cenizo Durangensis",
  "Manso Sahuayo ": "Chato de Sahuayo",
  "Churique": "Lechuguilla Ceniza",
  "Weber Azul": "Blue Weber",
  "Masparillo ": "Masparillo",
  "Lyobaa Coyote": "Coyote",
  "Arroqueño": "Arroqueño",
  "Cincoañero": "Cincoanero",
  "Pacífica": "Pacífica",
};

export type MatrixCardEntry = {
  species_id: string;
  common_name: string;
  image_800: string;
  image_400: string;
};

let cachedMap: Record<string, string> | null = null;

/**
 * Fetch matrix card index and build common_name → image_800 path map.
 * Uses in-memory cache after first successful fetch.
 */
export async function getMatrixCardUrlMap(): Promise<Record<string, string>> {
  if (cachedMap) return cachedMap;

  try {
    const res = await fetch(MATRIX_INDEX_URL);
    if (!res.ok) return {};
    const list = (await res.json()) as MatrixCardEntry[];
    const map: Record<string, string> = {};
    for (const entry of list) {
      map[entry.common_name] = entry.image_800;
    }
    for (const [alias, canonical] of Object.entries(COMMON_NAME_ALIASES)) {
      if (map[canonical] && !map[alias]) map[alias.trim()] = map[canonical];
    }
    cachedMap = map;
    return map;
  } catch {
    return {};
  }
}

/**
 * Resolve image URL for a species: use image_url if present, else matrix card fallback.
 */
export function resolveSpeciesImageUrl(
  imageUrl: string | null,
  commonName: string,
  matrixCardMap: Record<string, string> | null
): string | null {
  if (imageUrl?.trim()) return imageUrl.trim();
  if (!matrixCardMap) return null;
  return (
    matrixCardMap[commonName] ??
    matrixCardMap[COMMON_NAME_ALIASES[commonName]] ??
    null
  );
}
