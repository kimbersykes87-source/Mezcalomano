/**
 * Convert common_name to URL slug, e.g. "Sierra Negra" -> "sierra_negra"
 */
export function toSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}
