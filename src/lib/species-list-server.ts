import { createClient } from "@supabase/supabase-js";
import { speciesDirectorySlug } from "@/lib/slug";
import type { Species } from "@/types/species";

/**
 * URL segments for `/directory/[slug]`, matching `speciesDirectorySlug` used in the app.
 */
export async function fetchSpeciesDirectorySegments(): Promise<string[]> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return [];

    const supabase = createClient(url, key);
    const { data, error } = await supabase.from("species").select("slug, common_name");
    if (error || !data?.length) return [];

    const segments = new Set<string>();
    for (const row of data as Pick<Species, "slug" | "common_name">[]) {
      const seg = speciesDirectorySlug(row);
      if (seg) segments.add(seg);
    }
    return [...segments].sort((a, b) => a.localeCompare(b, "en"));
  } catch {
    return [];
  }
}

/**
 * All species for the directory list, sorted by common name, fetched on the server so the
 * first card is in the HTML a phone gets after scanning the box QR. Returns [] on any error;
 * the client then falls back to fetching in the browser.
 */
export async function fetchAllSpecies(): Promise<Species[]> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return [];
    const supabase = createClient(url, key);
    const { data, error } = await supabase.from("species").select("*");
    if (error || !data?.length) return [];
    return (data as Species[]).sort((a, b) => a.common_name.localeCompare(b.common_name, "en"));
  } catch {
    return [];
  }
}
