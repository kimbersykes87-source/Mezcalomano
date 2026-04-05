/**
 * Fallback image URLs for directory species using the site's matrix card assets.
 * When Supabase image_url is null or broken, we resolve from this mapping.
 */

const MATRIX_INDEX_URL = "/assets/matrix/cards/index.json";

/**
 * Legacy `common_name` spellings → `common_name` key in `index.json`.
 * Index and CSV are aligned for most species; keep only true renames/typos.
 */
/** Legacy directory / matrix labels → `common_name` keys in `index.json` */
export const COMMON_NAME_ALIASES: Record<string, string> = {
  Tepeztate: "Tepextate",
  "Cenizo Durangensis": "Cenizo",
  "Mountain Agave": "Montana",
  "Chato de Sahuayo": "Manso Sahuayo",
  "Lechuguilla Ceniza": "Churique",
  "Blue Weber": "Weber Azul",
  "Maguey Verde": "Verde",
  "Lechuguilla de la Sierra": "Masparillo",
  Espadita: "Espadilla",
};

export type MatrixCardEntry = {
  species_id?: string;
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
      const a = alias.trim();
      if (map[canonical] && !map[a]) map[a] = map[canonical];
    }
    cachedMap = map;
    return map;
  } catch {
    return {};
  }
}

/**
 * Resolve image URL for a species: prefer matrix card when available, else Supabase image_url.
 */
export function resolveSpeciesImageUrl(
  imageUrl: string | null,
  commonName: string,
  matrixCardMap: Record<string, string> | null
): string | null {
  const key = commonName.trim();
  if (matrixCardMap) {
    const matrixPath =
      matrixCardMap[key] ?? matrixCardMap[COMMON_NAME_ALIASES[key]];
    if (matrixPath) return matrixPath;
  }
  return imageUrl?.trim() ?? null;
}
