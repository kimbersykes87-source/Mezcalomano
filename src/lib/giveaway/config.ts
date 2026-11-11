/** Shared settings for the Mezcal Culture giveaway reveal page (giveaway.mezcalomano.com). */

/** Rendered draw videos, end stills and poster: Cloudflare R2 bucket mezcalomano-giveaway (media.mezcalomano.com),
 * fetched through the rewrite in next.config.ts so it works on any host this site serves. */
export const GIVEAWAY_MEDIA = "/giveaway-media";

/** Real results are only looked up from this moment: 2026-12-07 05:00 UTC, when entries close. */
export const DEFAULT_RESULTS_AT = "2026-12-07T05:00:00Z";

/** Shopify customer tags: set by the entry page, and by Siona on the winner after the draw. */
export const ENTRANT_TAG = "giveaway-mezcal-culture";
export const WINNER_TAG = "giveaway-winner";

export type LookupResult =
  | { status: "result"; won: boolean; slug: string; name: string; test: boolean }
  | { status: "not-yet" }
  | { status: "not-entered" };
