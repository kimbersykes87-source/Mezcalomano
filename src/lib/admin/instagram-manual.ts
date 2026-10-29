import { serviceClient } from "@/lib/metrics/store";
import { londonToday } from "@/lib/metrics/time";
import { addDays } from "./summary";

/**
 * Hand-entered Instagram figures (used until the Instagram API connection works).
 * Stored in metrics_daily under source 'instagram', dated the Sunday that ends
 * the week, so the dashboard and the Monday email read them like API data.
 * followers is a level (the count on that day); profile_views and reach are
 * the week's totals.
 */

export type InstagramEntry = { weekEnd: string; followers: number; profileViews: number; reach?: number | null };

const METRICS = ["followers", "profile_views", "reach"];

/** The most recent Sunday on or before today (London): tonight if it is Sunday, otherwise the Sunday just gone. */
export function defaultWeekEnd(): string {
  const today = londonToday();
  const dow = new Date(`${today}T12:00:00Z`).getUTCDay();
  return addDays(today, -dow);
}

export function validateEntry(input: Record<string, unknown>): { ok: true; entry: InstagramEntry } | { ok: false; error: string } {
  const weekEnd = String(input.weekEnd ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekEnd) || Number.isNaN(Date.parse(weekEnd))) return { ok: false, error: "Pick a valid week." };
  if (new Date(`${weekEnd}T12:00:00Z`).getUTCDay() !== 0) return { ok: false, error: "The week must end on a Sunday." };
  if (weekEnd < "2026-10-28") return { ok: false, error: "Tracking starts on 28 Oct 2026." };

  const whole = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? Number(v.replace(/[, ]/g, "")) : typeof v === "number" ? v : NaN);
  const followers = whole(input.followers);
  const profileViews = whole(input.profileViews);
  const reachRaw = input.reach;
  const reach = reachRaw === "" || reachRaw == null ? null : whole(reachRaw);

  const bad = (n: number | null) => n !== null && (!Number.isInteger(n) || n < 0 || n > 100_000_000);
  if (bad(followers) || Number.isNaN(followers)) return { ok: false, error: "Followers must be a whole number." };
  if (bad(profileViews) || Number.isNaN(profileViews)) return { ok: false, error: "Profile views must be a whole number." };
  if (reach !== null && (bad(reach) || Number.isNaN(reach))) return { ok: false, error: "Reach must be a whole number, or left blank." };
  return { ok: true, entry: { weekEnd, followers, profileViews, reach } };
}

export async function saveInstagramEntry(e: InstagramEntry, by: string): Promise<void> {
  const db = serviceClient();
  const del = await db.from("metrics_daily").delete().eq("day", e.weekEnd).eq("source", "instagram").in("metric", METRICS);
  if (del.error) throw new Error(del.error.message);
  const rows = [
    { metric: "followers", value: e.followers },
    { metric: "profile_views", value: e.profileViews },
    ...(e.reach != null ? [{ metric: "reach", value: e.reach }] : []),
  ].map((r) => ({ day: e.weekEnd, source: "instagram", dimension: "", ...r }));
  const ins = await db.from("metrics_daily").insert(rows);
  if (ins.error) throw new Error(ins.error.message);
  await db.from("metrics_runs").insert({
    day: e.weekEnd,
    source: "instagram_manual",
    ok: true,
    detail: `entered by hand (${by}): followers ${e.followers}, profile views ${e.profileViews}${e.reach != null ? `, reach ${e.reach}` : ""}`,
  });
}

/** The entry already saved for a week, if any (to prefill the form). */
export async function savedEntry(weekEnd: string): Promise<{ followers?: number; profileViews?: number; reach?: number }> {
  const { data } = await serviceClient()
    .from("metrics_daily")
    .select("metric, value")
    .eq("day", weekEnd)
    .eq("source", "instagram")
    .eq("dimension", "")
    .in("metric", METRICS);
  const get = (m: string) => {
    const r = (data ?? []).find((x) => x.metric === m);
    return r ? Number(r.value) : undefined;
  };
  return { followers: get("followers"), profileViews: get("profile_views"), reach: get("reach") };
}

export async function hasEntry(weekEnd: string): Promise<boolean> {
  const e = await savedEntry(weekEnd);
  return e.followers !== undefined && e.profileViews !== undefined;
}
