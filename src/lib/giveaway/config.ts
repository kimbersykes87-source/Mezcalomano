/** Shared settings for the Mezcal Culture giveaway reveal page (giveaway.mezcalomano.com). */

/** Rendered draw videos, end stills and poster (Cloudflare R2 bucket mezcalomano-giveaway). */
export const GIVEAWAY_MEDIA = "https://media.mezcalomano.com";

/**
 * Real results are only looked up from this moment. Deliberately LATER than the 05:00 UTC entry close, so Siona has the
 * morning of 7 Dec to draw the winner and tag them. If this matched the close time, anyone looking in the gap would be
 * told the live answer from Shopify before the winner was tagged, so the real winner would be told they had lost.
 * Override per environment with GIVEAWAY_RESULTS_AT. See DOCS/GIVEAWAY_RUN_SHEET_2026-12-07.md.
 */
export const DEFAULT_RESULTS_AT = "2026-12-07T17:00:00Z";

/** Shopify customer tags: set by the entry page, and by Siona on the winner after the draw. */
export const ENTRANT_TAG = "giveaway-mezcal-culture";
export const WINNER_TAG = "giveaway-winner";
/** Set by us when someone successfully looks up their own result, so Siona can segment the nudge on who has NOT looked. */
export const CHECKED_TAG = "giveaway-checked";

export type LookupResult =
  // `code` is only ever set for non-winners, and only server side: see GIVEAWAY_CODE in lookup.ts. Do not move the
  // code string into this file, which ships to the browser.
  | { status: "result"; won: boolean; slug: string; name: string; test: boolean; code?: string }
  | { status: "not-yet" }
  | { status: "not-entered" };
