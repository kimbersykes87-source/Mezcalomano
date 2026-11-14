import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Tracked links for press and creators: https://mezcalomano.com/r/<slug>.
 *
 * Made from the launch tracker sheet (Promo list > "Tracked links" menu), which
 * calls POST /api/press-links. A link never changes once made (the database
 * refuses edits and deletes). Server-only: uses the Supabase service role.
 */

export const PRESS_LINK_BASE = "https://mezcalomano.com/r/";
export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;
export const BOT_UA =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|headless|lighthouse|python|curl|wget|go-http|okhttp|safelinks|proofpoint|mimecast|barracuda|scanner|urldefense/i;

const PRODUCT_URL = "https://shop.mezcalomano.com/products/discovery-deck";

/** Where a press link lands: the Discovery Deck with the outlet in the UTMs. */
export function pressDestination(slug: string | null): string {
  const p = new URLSearchParams({ utm_source: slug ?? "press", utm_medium: "press", utm_campaign: "press_links" });
  if (slug) p.set("utm_content", slug);
  return `${PRODUCT_URL}?${p.toString()}`;
}

/** Outlet or handle to a short, readable slug: "@Mezcal Culture!" -> "mezcal-culture". */
export function slugify(input: string): string {
  const base = input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/^https?:\/\/(www\.)?/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  let s = base.slice(0, 30);
  if (base.length > 30 && s.includes("-")) s = s.slice(0, s.lastIndexOf("-"));
  s = s.replace(/-+$/g, "");
  return s || "press";
}

function envValue(name: string): string | null {
  const v = process.env[name];
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export function pressDb(): SupabaseClient | null {
  const url = envValue("SUPABASE_URL") || envValue("NEXT_PUBLIC_SUPABASE_URL");
  const key = envValue("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
