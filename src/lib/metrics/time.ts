/**
 * Days for the analytics dashboard are London calendar days (the Shopify store
 * also runs on Europe/London), so a "day" is 00:00 to 24:00 London time.
 */

const LONDON = "Europe/London";

function londonHour(instant: Date): number {
  return Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: LONDON, hour: "2-digit", hourCycle: "h23" }).format(instant)
  );
}

/** The UTC instant at which the given London date (YYYY-MM-DD) starts. */
export function londonDayStartUtc(day: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  const guess = new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
  // London is UTC+0 (GMT) or UTC+1 (BST). If midnight UTC is 01:00 in London, the day began an hour earlier.
  return londonHour(guess) === 1 ? new Date(guess.getTime() - 3600_000) : guess;
}

/** UTC start (inclusive) and end (exclusive) of a London day. */
export function londonDayRange(day: string): { start: Date; end: Date } {
  const [y, m, d] = day.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
  return { start: londonDayStartUtc(day), end: londonDayStartUtc(next) };
}

/** Today's date in London as YYYY-MM-DD. */
export function londonToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: LONDON }).format(now);
}

/** Yesterday's date in London as YYYY-MM-DD (the day the nightly job collects). */
export function londonYesterday(now = new Date()): string {
  const [y, m, d] = londonToday(now).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
}

export function isIsoDay(value: string | null | undefined): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
