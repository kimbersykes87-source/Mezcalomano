import { addDays } from "@/lib/admin/summary";
import { londonToday, londonYesterday } from "@/lib/metrics/time";

export const PERIODS = [
  { key: "7", label: "7 days" },
  { key: "28", label: "28 days" },
  { key: "90", label: "90 days" },
  { key: "week", label: "Last full week" },
  { key: "launch", label: "Since launch" },
  { key: "ytd", label: "Year to date" },
] as const;

/** Pre-orders opened on this day (MAP_00_INDEX key facts). "Since launch" starts here. */
export const LAUNCH_DAY = "2026-10-27";
/** First day the shop had a sale (a friends and family order). Year to date never starts earlier than this. */
export const FIRST_SALE_DAY = "2026-10-25";

/** Running totals ("Since launch", "Year to date") have no fair previous period, so pages show no change for them. */
export const isCumulative = (key: string) => key === "launch" || key === "ytd";

/** Reads the ?p= value from the address, falling back to 7 days. */
export const periodKey = (p: string | undefined) => (PERIODS.some((x) => x.key === p) ? (p as string) : "7");

/**
 * "week" = the last full Monday to Sunday; numbers = that many days ending today so far (London);
 * "launch" = LAUNCH_DAY to today; "ytd" = 1 January (or FIRST_SALE_DAY in 2026) to today.
 */
export function periodRange(key: string): { from: string; to: string } {
  const yesterday = londonYesterday();
  if (key === "week") {
    const dow = new Date(`${yesterday}T12:00:00Z`).getUTCDay(); // 0 Sun .. 6 Sat
    const lastSunday = addDays(yesterday, -(dow === 0 ? 0 : dow));
    return { from: addDays(lastSunday, -6), to: lastSunday };
  }
  const today = londonToday();
  if (key === "launch") return { from: LAUNCH_DAY, to: today };
  if (key === "ytd") {
    const jan1 = `${today.slice(0, 4)}-01-01`;
    return { from: jan1 < FIRST_SALE_DAY ? FIRST_SALE_DAY : jan1, to: today };
  }
  const n = Number(key) || 7;
  return { from: addDays(today, -(n - 1)), to: today }; // includes today so far
}

export const longDay = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });

/** Every London day from `from` to `to` inclusive. */
export function eachDay(from: string, to: string): string[] {
  const out: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}
