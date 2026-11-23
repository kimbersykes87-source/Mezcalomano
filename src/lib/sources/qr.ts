import { pressDb } from "@/lib/press-links";
import { londonDayStartUtc, londonToday } from "@/lib/metrics/time";

/**
 * Box QR scans for the Box QR page: rows of Supabase `qr_scans`, written by
 * /api/qr-scan when a visit starts on /directory with no referrer.
 * Counted from QR_COUNT_FROM only; nothing earlier exists and nothing is back filled.
 */

export const QR_COUNT_FROM = "2026-11-20";
const DAYS_SHOWN = 30;

export type QrDay = { day: string; scans: number };
export type QrData = {
  total: number;
  today: number;
  last7: number;
  mobile: number;
  desktop: number;
  lastScan: string | null;
  days: QrDay[];
  countries: { country: string; scans: number }[];
};

const londonDay = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date(iso));

const addDays = (day: string, n: number) => {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};

export async function liveQr(): Promise<QrData> {
  const db = pressDb();
  if (!db) throw new Error("Supabase service role is not configured");

  const { data, error } = await db
    .from("qr_scans")
    .select("created_at, country, device")
    .gte("created_at", londonDayStartUtc(QR_COUNT_FROM).toISOString())
    .order("created_at", { ascending: true })
    .limit(50000);
  if (error) throw new Error(`Scans: ${error.message}`);

  const rows = data ?? [];
  const today = londonToday();
  const weekStart = addDays(today, -6);
  const byDay = new Map<string, number>();
  const byCountry = new Map<string, number>();
  let mobile = 0;
  let last7 = 0;

  for (const r of rows) {
    const day = londonDay(r.created_at);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
    if (day >= weekStart) last7++;
    if (r.device === "mobile") mobile++;
    const c = r.country || "Unknown";
    byCountry.set(c, (byCountry.get(c) ?? 0) + 1);
  }

  // Every day from the first counted day (or the last 30) to today, newest first, zeros included.
  const days: QrDay[] = [];
  for (let day = today, i = 0; day >= QR_COUNT_FROM && i < DAYS_SHOWN; day = addDays(day, -1), i++) {
    days.push({ day, scans: byDay.get(day) ?? 0 });
  }

  return {
    total: rows.length,
    today: byDay.get(today) ?? 0,
    last7,
    mobile,
    desktop: rows.length - mobile,
    lastScan: rows.length ? rows[rows.length - 1].created_at : null,
    days,
    countries: [...byCountry].map(([country, scans]) => ({ country, scans })).sort((a, b) => b.scans - a.scans),
  };
}
