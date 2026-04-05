import { createClient } from "@supabase/supabase-js";
import directoryLegacySlugRedirects from "../../data/directory-legacy-slug-redirects.json";
import { toSlug } from "@/lib/slug";
import type { Species } from "@/types/species";

const legacySlugToCanonical = directoryLegacySlugRedirects as Record<string, string>;

function canonicalDirectorySlug(slug: string): string {
  return legacySlugToCanonical[slug] ?? slug;
}

/**
 * Server-only fetch for directory species detail (metadata + RSC).
 * Uses public anon key; species table should remain readable as configured for the live site.
 */
export async function fetchSpeciesBySlug(slug: string): Promise<Species | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const resolvedSlug = canonicalDirectorySlug(slug);

  const supabase = createClient(url, key);
  const res = await supabase.from("species").select("*").eq("slug", resolvedSlug).maybeSingle();

  if (res.error) {
    const all = await supabase.from("species").select("*");
    if (all.error || !all.data) return null;
    return (
      (all.data as Species[]).find(
        (s) =>
          s.slug === resolvedSlug ||
          toSlug(s.common_name) === resolvedSlug ||
          s.slug === slug ||
          toSlug(s.common_name) === slug
      ) ?? null
    );
  }

  if (res.data) return res.data as Species;

  const all = await supabase.from("species").select("*");
  if (all.error || !all.data) return null;
  return (
    (all.data as Species[]).find(
      (s) =>
        s.slug === resolvedSlug ||
        toSlug(s.common_name) === resolvedSlug ||
        s.slug === slug ||
        toSlug(s.common_name) === slug
    ) ?? null
  );
}
