/**
 * Real content dates for the sitemap (lastmod). Update a date only when the page content really changes.
 * Static pages use the date of their last real edit; species pages use the date of the last change to
 * data/Species_Final - Website.csv (the species table has no updated_at column, only created_at).
 * Do not use the build time: Google learns to ignore lastmod when it is always "now".
 */
export const CONTENT_DATES = {
  home: "2026-11-09",
  about: "2026-11-09",
  contact: "2026-11-09",
  directory: "2026-11-09",
  map: "2026-11-09",
  press: "2026-11-09",
  sources: "2026-10-29",
  /** Last change to the species CSV that seeds Supabase. */
  speciesData: "2026-11-08",
} as const;

/** Midday UTC so the date never shifts across time zones. */
export function dateOnly(iso: string): Date {
  return new Date(`${iso}T12:00:00Z`);
}

/** Later of two ISO dates (YYYY-MM-DD compares correctly as text). */
export function laterOf(a: string, b?: string): string {
  return b && b > a ? b : a;
}
