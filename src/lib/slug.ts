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

/** URL segment for `/directory/[slug]` — prefers DB `slug` when set. */
export function speciesDirectorySlug(species: {
  slug?: string | null;
  common_name: string;
}): string {
  const s = species.slug && String(species.slug).trim();
  return s || toSlug(species.common_name);
}
