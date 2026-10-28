import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase access for the analytics job (server-only, service role).
 * Table `metrics_daily`: one row per (day, source, metric, dimension).
 * `dimension` is '' for a headline figure, or a page path, country, SKU, etc.
 */

export type MetricRow = {
  metric: string;
  dimension?: string;
  value: number;
};

let client: SupabaseClient | null = null;

export function serviceClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL?.trim() || process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new Error("Supabase env vars missing (SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)");
  client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

/** Replaces every row for (day, source) with the given rows, so a rerun never double counts. */
export async function saveMetrics(day: string, source: string, rows: MetricRow[]): Promise<number> {
  const db = serviceClient();
  const clean = rows
    .filter((r) => Number.isFinite(r.value))
    .map((r) => ({
      day,
      source,
      metric: r.metric,
      dimension: (r.dimension ?? "").slice(0, 300),
      value: r.value,
    }));

  // Merge duplicates (same metric and dimension) by summing, so the insert never conflicts.
  const merged = new Map<string, (typeof clean)[number]>();
  for (const r of clean) {
    const k = `${r.metric}\u0000${r.dimension}`;
    const prev = merged.get(k);
    if (prev) prev.value += r.value;
    else merged.set(k, { ...r });
  }

  const del = await db.from("metrics_daily").delete().eq("day", day).eq("source", source);
  if (del.error) throw new Error(`delete ${source}: ${del.error.message}`);
  if (merged.size === 0) return 0;
  const ins = await db.from("metrics_daily").insert([...merged.values()]);
  if (ins.error) throw new Error(`insert ${source}: ${ins.error.message}`);
  return merged.size;
}

export async function logRun(day: string, source: string, ok: boolean, detail: string) {
  try {
    await serviceClient().from("metrics_runs").insert({ day, source, ok, detail: detail.slice(0, 1000) });
  } catch {
    // Logging must never break the job.
  }
}
