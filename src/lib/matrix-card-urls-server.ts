import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { MatrixCardEntry } from "@/lib/matrix-card-urls";
import { COMMON_NAME_ALIASES } from "@/lib/matrix-card-urls";

/**
 * Resolve matrix card image path for OG / server metadata (reads index.json from disk).
 */
export function resolveMatrixImagePathForCommonName(commonName: string): string | null {
  const p = join(process.cwd(), "public", "assets", "matrix", "cards", "index.json");
  if (!existsSync(p)) return null;

  const list = JSON.parse(readFileSync(p, "utf-8")) as MatrixCardEntry[];
  const map: Record<string, string> = {};
  for (const entry of list) {
    map[entry.common_name] = entry.image_800;
  }
  for (const [alias, canonical] of Object.entries(COMMON_NAME_ALIASES)) {
    const c = map[canonical];
    if (c && !map[alias.trim()]) map[alias.trim()] = c;
  }

  const key = commonName.trim();
  return map[key] ?? map[COMMON_NAME_ALIASES[key]] ?? null;
}
