import { addDays } from "@/lib/admin/summary";
import { londonToday, londonYesterday } from "@/lib/metrics/time";

export const PERIODS = [
  { key: "7", label: "7 days" },
  { key: "28", label: "28 days" },
  { key: "90", label: "90 days" },
  { key: "week", label: "Last full week" },
] as const;

/** Reads the ?p= value from the address, falling back to 7 days. */
export const periodKey = (p: string | undefined) => (PERIODS.some((x) => x.key === p) ? (p as string) : "7");

/** "week" = the last full Monday to Sunday; numbers = that many days ending today so far (London). */
export function periodRange(key: string): { from: string; to: string } {
  const yesterday = londonYesterday();
  if (key === "week") {
    const dow = new Date(`${yesterday}T12:00:00Z`).getUTCDay(); // 0 Sun .. 6 Sat
    const lastSunday = addDays(yesterday, -(dow === 0 ? 0 : dow));
    return { from: addDays(lastSunday, -6), to: lastSunday };
  }
  const n = Number(key) || 7;
  const today = londonToday();
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
