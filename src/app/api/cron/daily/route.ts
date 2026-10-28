import { NextResponse } from "next/server";
import { collectCloudflare, CF_SITES } from "@/lib/metrics/cloudflare";
import { collectInstagram } from "@/lib/metrics/instagram";
import { collectClicks, collectContacts } from "@/lib/metrics/local";
import { collectEmailList, collectShop } from "@/lib/metrics/shopify";
import { collectTiktok } from "@/lib/metrics/tiktok";
import { logRun, saveMetrics, type MetricRow } from "@/lib/metrics/store";
import { isIsoDay, londonDayRange, londonYesterday } from "@/lib/metrics/time";

/**
 * Nightly analytics job for the admin dashboard.
 * Vercel Cron calls it once a day (see vercel.json) with
 * `Authorization: Bearer <CRON_SECRET>`. It collects yesterday (London time)
 * from every source and saves it to Supabase `metrics_daily`, one source at a
 * time, so one failing source never blocks the others. Each source's result is
 * logged to `metrics_runs`.
 *
 * Manual rerun (same header): /api/cron/daily?day=2026-10-29&sources=shop,email
 */

export const maxDuration = 60;
export const dynamic = "force-dynamic";

type Collector = (day: string, start: Date, end: Date) => Promise<MetricRow[]>;

const COLLECTORS: Record<string, Collector> = {
  web_main: (_d, s, e) => collectCloudflare(CF_SITES.web_main, s, e),
  web_shop: (_d, s, e) => collectCloudflare(CF_SITES.web_shop, s, e),
  shop: (d, s, e) => collectShop(d, s, e),
  email: (_d, s, e) => collectEmailList(s, e),
  contact: (_d, s, e) => collectContacts(s, e),
  clicks: (_d, s, e) => collectClicks(s, e),
  instagram: (_d, s, e) => collectInstagram(s, e),
  tiktok: () => collectTiktok(),
};

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const dayParam = url.searchParams.get("day");
  const day = isIsoDay(dayParam) ? dayParam : londonYesterday();
  const wanted = url.searchParams.get("sources")?.split(",").map((s) => s.trim()).filter(Boolean);
  const names = Object.keys(COLLECTORS).filter((n) => !wanted?.length || wanted.includes(n));
  const { start, end } = londonDayRange(day);

  const results: Record<string, string> = {};
  for (const name of names) {
    try {
      const rows = await COLLECTORS[name](day, start, end);
      const saved = await saveMetrics(day, name, rows);
      results[name] = `ok (${saved} rows)`;
      await logRun(day, name, true, results[name]);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      results[name] = `error: ${message}`;
      console.error(`[cron/daily] ${day} ${name}: ${message}`);
      await logRun(day, name, false, message);
    }
  }

  const ok = Object.values(results).every((r) => r.startsWith("ok"));
  return NextResponse.json({ ok, day, results }, { status: ok ? 200 : 207 });
}
