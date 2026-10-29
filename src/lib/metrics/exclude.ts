import { londonDayStartUtc } from "./time";

/**
 * Visits from Morocco are left out of the dashboard numbers until the end of
 * 14 Nov 2026 (London), because they are Kimber's own browsing while travelling.
 * Remove this file and its two uses after that date.
 */
export const EXCLUDED_COUNTRY_NAME = "Morocco";
export const EXCLUDED_COUNTRY_CODE = "MA";
/** First instant after 14 Nov 2026 (London). */
export const EXCLUDE_UNTIL = londonDayStartUtc("2026-11-15");
