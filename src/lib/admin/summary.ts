import { serviceClient } from "@/lib/metrics/store";
import { londonYesterday } from "@/lib/metrics/time";

/**
 * Reads metrics_daily and turns it into the figures shown on the dashboard
 * and in the Monday email. Flow figures (visits, orders) are summed over the
 * period; level figures (list size, followers) take the latest value.
 */

type Row = { day: string; source: string; metric: string; dimension: string; value: number };

const LEVEL_METRICS = new Set(["list_total", "followers", "following", "posts", "token_days_left", "total_video_views", "likes_total", "videos"]);

export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86400_000) + 1;
}

async function loadRows(from: string, to: string): Promise<Row[]> {
  const out: Row[] = [];
  for (let offset = 0; offset < 200_000; offset += 1000) {
    const { data, error } = await serviceClient()
      .from("metrics_daily")
      .select("day, source, metric, dimension, value")
      .gte("day", from)
      .lte("day", to)
      .order("day")
      .range(offset, offset + 999);
    if (error) throw new Error(`metrics_daily: ${error.message}`);
    out.push(...((data ?? []) as Row[]).map((r) => ({ ...r, value: Number(r.value) })));
    if (!data || data.length < 1000) break;
  }
  return out;
}

export class Period {
  constructor(public from: string, public to: string, private rows: Row[]) {}

  private pick(source: string, metric: string, dimension = "") {
    return this.rows.filter(
      (r) => r.source === source && r.metric === metric && r.dimension === dimension && r.day >= this.from && r.day <= this.to
    );
  }

  /** Sum for flow metrics, latest value for level metrics; null when no data in the period. */
  value(source: string, metric: string): number | null {
    const rows = this.pick(source, metric);
    if (!rows.length) return null;
    if (LEVEL_METRICS.has(metric)) return rows.reduce((a, r) => (r.day > a.day ? r : a)).value;
    return rows.reduce((a, r) => a + r.value, 0);
  }

  /** Change in a level metric across the period (last value minus the value the day before the period, or the first value). */
  change(source: string, metric: string, before: Period): number | null {
    const now = this.value(source, metric);
    if (now === null) return null;
    const prior = before.value(source, metric) ?? this.firstValue(source, metric);
    return prior === null ? null : now - prior;
  }

  private firstValue(source: string, metric: string): number | null {
    const rows = this.pick(source, metric);
    return rows.length ? rows.reduce((a, r) => (r.day < a.day ? r : a)).value : null;
  }

  /** Daily series across the period (missing days are null). */
  series(source: string, metric: string): { day: string; value: number | null }[] {
    const byDay = new Map(this.pick(source, metric).map((r) => [r.day, r.value]));
    const out: { day: string; value: number | null }[] = [];
    for (let d = this.from; d <= this.to; d = addDays(d, 1)) out.push({ day: d, value: byDay.get(d) ?? null });
    return out;
  }

  /** Top dimensions for a breakdown metric, summed over the period. */
  top(source: string, metric: string, n = 10): { name: string; value: number }[] {
    const sums = new Map<string, number>();
    for (const r of this.rows) {
      if (r.source !== source || r.metric !== metric || !r.dimension || r.day < this.from || r.day > this.to) continue;
      sums.set(r.dimension, (sums.get(r.dimension) ?? 0) + r.value);
    }
    return [...sums.entries()]
      .map(([name, value]) => ({ name, value }))
      .filter((x) => x.value !== 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, n);
  }

  notes(source: string): string[] {
    return [...new Set(this.rows.filter((r) => r.source === source && r.metric === "source_note" && r.day >= this.from && r.day <= this.to).map((r) => r.dimension))];
  }
}

export type Headline = {
  key: string;
  label: string;
  value: number | null;
  previous: number | null;
  format: "number" | "money" | "change";
  /** "level" figures (list size, followers) compare as a plain difference, not a percentage. */
  kind?: "flow" | "level";
};

export type Summary = {
  current: Period;
  previous: Period;
  headlines: Headline[];
  funnel: { label: string; value: number | null }[];
};

/** Current period [from, to] and the same length immediately before it. */
export async function buildSummary(from: string, to: string): Promise<Summary> {
  const len = daysBetween(from, to);
  const prevFrom = addDays(from, -len);
  const prevTo = addDays(from, -1);
  const rows = await loadRows(prevFrom, to);
  const current = new Period(from, to, rows);
  const previous = new Period(prevFrom, prevTo, rows);

  const flow = (key: string, label: string, source: string, metric: string, format: Headline["format"] = "number"): Headline => ({
    key,
    label,
    value: current.value(source, metric),
    previous: previous.value(source, metric),
    format,
  });
  const level = (key: string, label: string, source: string, metric: string): Headline => ({
    key,
    label,
    value: current.value(source, metric),
    previous: previous.value(source, metric),
    format: "number",
    kind: "level",
  });

  const headlines: Headline[] = [
    flow("site_visits", "Site visits", "web_main", "visits"),
    flow("site_views", "Site page views", "web_main", "page_views"),
    flow("shop_sessions", "Shop sessions", "shop", "sessions"),
    flow("orders", "Orders", "shop", "orders"),
    flow("units", "Decks sold", "shop", "units"),
    flow("net_sales", "Net sales", "shop", "net_sales", "money"),
    flow("new_subscribers", "New email subscribers", "email", "new_subscribers"),
    level("list_total", "Email list size", "email", "list_total"),
    level("ig_followers", "Instagram followers", "instagram", "followers"),
    flow("ig_profile_views", "Instagram profile views", "instagram", "profile_views"),
    level("tt_followers", "TikTok followers", "tiktok", "followers"),
    flow("producer_clicks", "Producer link clicks", "clicks", "clicks"),
    flow("contact", "Contact messages", "contact", "messages"),
  ];

  // Hand-entered or browser-read Instagram figures are dated the Sunday that ends the week, which can be
  // later than "yesterday". On the live views (ending yesterday) show the newest entry in the Instagram tiles.
  if (to >= londonYesterday()) {
    const ig = await newestInstagram(to);
    if (ig) {
      const followers = headlines.find((h) => h.key === "ig_followers");
      const views = headlines.find((h) => h.key === "ig_profile_views");
      if (followers && ig.values.followers !== undefined) {
        followers.value = ig.values.followers;
        followers.previous = ig.prev.followers ?? followers.previous;
      }
      if (views && ig.values.profile_views !== undefined) {
        views.value = ig.values.profile_views;
        views.previous = ig.prev.profile_views ?? null;
        views.label = "Instagram profile views (latest entry)";
      }
    }
  }

  const funnel = [
    { label: "Shop sessions", value: current.value("shop", "sessions") },
    { label: "Added to cart", value: current.value("shop", "sessions_added_to_cart") },
    { label: "Reached checkout", value: current.value("shop", "sessions_reached_checkout") },
    { label: "Ordered", value: current.value("shop", "sessions_completed_checkout") },
  ];

  return { current, previous, headlines, funnel };
}

/** The newest Instagram snapshot dated after `after`, with the one before it (for the headline tiles). */
async function newestInstagram(after: string): Promise<{ values: Record<string, number>; prev: Record<string, number> } | null> {
  const { data } = await serviceClient()
    .from("metrics_daily")
    .select("day, metric, value")
    .eq("source", "instagram")
    .eq("dimension", "")
    .order("day", { ascending: false })
    .limit(200);
  const rows = (data ?? []) as { day: string; metric: string; value: number }[];
  const days = [...new Set(rows.map((r) => r.day))];
  if (!days.length || days[0] <= after) return null;
  const pick = (d: string) => Object.fromEntries(rows.filter((r) => r.day === d).map((r) => [r.metric, Number(r.value)]));
  return { values: pick(days[0]), prev: days[1] ? pick(days[1]) : {} };
}

export async function latestRuns(): Promise<{ source: string; ok: boolean; ran_at: string; detail: string | null; day: string }[]> {
  const { data } = await serviceClient()
    .from("metrics_runs")
    .select("source, ok, ran_at, detail, day")
    .order("ran_at", { ascending: false })
    .limit(60);
  const seen = new Set<string>();
  const out: { source: string; ok: boolean; ran_at: string; detail: string | null; day: string }[] = [];
  for (const r of data ?? []) {
    if (seen.has(r.source)) continue;
    seen.add(r.source);
    out.push(r);
  }
  return out.sort((a, b) => a.source.localeCompare(b.source));
}

export const fmtNumber = (v: number | null) => (v === null ? "no data" : Math.round(v).toLocaleString("en-US"));
export const fmtMoney = (v: number | null) =>
  v === null ? "no data" : v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

/** "+12%" style change versus the previous period; null when there is nothing to compare. */
export function pctChange(now: number | null, before: number | null): string | null {
  if (now === null || before === null) return null;
  if (before === 0) return now === 0 ? "no change" : "new";
  const pct = Math.round(((now - before) / Math.abs(before)) * 100);
  return pct === 0 ? "no change" : `${pct > 0 ? "+" : ""}${pct}%`;
}

/** Change text for a headline: "+14" for level figures, "+12%" for flow figures. */
export function headlineChange(h: Headline): string | null {
  if (h.kind === "level") {
    if (h.value === null || h.previous === null) return null;
    const d = Math.round(h.value - h.previous);
    return d === 0 ? "no change" : `${d > 0 ? "+" : ""}${d.toLocaleString("en-US")}`;
  }
  return pctChange(h.value, h.previous);
}
