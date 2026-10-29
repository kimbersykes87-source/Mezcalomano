import { NextResponse } from "next/server";
import { collectDay, collectLatest } from "@/lib/metrics/run";
import { isIsoDay } from "@/lib/metrics/time";

/**
 * Analytics collection job for the admin dashboard.
 * Vercel Cron calls it once a day at 17:00 UTC (see vercel.json) with
 * `Authorization: Bearer <CRON_SECRET>`. It collects yesterday (final) and
 * today so far (partial) from every source and saves them to Supabase
 * `metrics_daily`, one source at a time, so one failing source never blocks the
 * others. Each source's result is logged to `metrics_runs`.
 *
 * Manual rerun (same header): /api/cron/daily?day=2026-10-29&sources=shop,email
 */

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const dayParam = url.searchParams.get("day");
  const wanted = url.searchParams.get("sources")?.split(",").map((s) => s.trim()).filter(Boolean);

  const results = isIsoDay(dayParam) ? { [dayParam]: await collectDay(dayParam, wanted) } : await collectLatest();
  const ok = Object.values(results).every((day) => Object.values(day).every((r) => r.startsWith("ok")));
  return NextResponse.json({ ok, results }, { status: ok ? 200 : 207 });
}
