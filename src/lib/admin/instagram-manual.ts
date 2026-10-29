import { serviceClient } from "@/lib/metrics/store";
import { londonToday } from "@/lib/metrics/time";
import { addDays } from "./summary";

/**
 * Hand-entered Instagram figures (used until the Instagram API connection works).
 * Stored in metrics_daily under source 'instagram', dated the Sunday that ends
 * the week, so the dashboard and the Monday email read them like API data.
 * followers and posts are levels (the count on that day); the rest are the week's totals
 * (Instagram's last 7 days).
 */

/** The figures on Instagram's Professional dashboard (Insights), named as the dashboard names them. */
export const FIELDS = [
  { key: "followers", metric: "followers", label: "Total followers", required: true },
  { key: "profileVisits", metric: "profile_views", label: "Profile visits", required: true },
  { key: "views", metric: "views", label: "Views", required: false },
  { key: "viewers", metric: "reach", label: "Viewers", required: false },
  { key: "interactions", metric: "interactions", label: "Interactions", required: false },
  { key: "accountsEngaged", metric: "accounts_engaged", label: "Accounts engaged", required: false },
  { key: "linkTaps", metric: "website_clicks", label: "External link taps", required: false },
  { key: "posts", metric: "posts", label: "Posts", required: false },
] as const;

export type FieldKey = (typeof FIELDS)[number]["key"];
export type InstagramEntry = { weekEnd: string; values: Partial<Record<FieldKey, number>> };

const METRICS: string[] = FIELDS.map((f) => f.metric);

/** The week the form defaults to: the most recent Sunday on or before today (London), or the first Sunday after tracking began if that is earlier. */
export const FIRST_WEEK = "2026-10-25"; // baseline Sunday, the day before the figures start
const TRACKING_START = "2026-10-28";

export function upcomingSunday(): string {
  const today = londonToday();
  const dow = new Date(`${today}T12:00:00Z`).getUTCDay();
  return addDays(today, (7 - dow) % 7);
}

export function defaultWeekEnd(): string {
  const today = londonToday();
  const dow = new Date(`${today}T12:00:00Z`).getUTCDay();
  const recent = addDays(today, -dow);
  return recent < TRACKING_START ? upcomingSunday() : recent;
}

export function validateEntry(input: Record<string, unknown>): { ok: true; entry: InstagramEntry } | { ok: false; error: string } {
  const weekEnd = String(input.weekEnd ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekEnd) || Number.isNaN(Date.parse(weekEnd))) return { ok: false, error: "Pick a valid week." };
  if (new Date(`${weekEnd}T12:00:00Z`).getUTCDay() !== 0) return { ok: false, error: "The week must end on a Sunday." };
  if (weekEnd < FIRST_WEEK) return { ok: false, error: "Tracking starts on 28 Oct 2026." };
  if (weekEnd > upcomingSunday()) return { ok: false, error: "That week has not finished yet." };

  const values: InstagramEntry["values"] = {};
  for (const f of FIELDS) {
    const raw = input[f.key];
    const blank = raw === "" || raw == null;
    if (blank) {
      if (f.required) return { ok: false, error: `${f.label} is needed.` };
      continue;
    }
    const n = typeof raw === "number" ? raw : Number(String(raw).replace(/[, ]/g, ""));
    if (!Number.isInteger(n) || n < 0 || n > 100_000_000) return { ok: false, error: `${f.label} must be a whole number${f.required ? "" : ", or left blank"}.` };
    values[f.key] = n;
  }
  return { ok: true, entry: { weekEnd, values } };
}

export async function saveInstagramEntry(e: InstagramEntry, by: string): Promise<void> {
  const db = serviceClient();
  const del = await db.from("metrics_daily").delete().eq("day", e.weekEnd).eq("source", "instagram").in("metric", METRICS);
  if (del.error) throw new Error(del.error.message);
  const rows = FIELDS.filter((f) => e.values[f.key] !== undefined).map((f) => ({
    day: e.weekEnd,
    source: "instagram",
    dimension: "",
    metric: f.metric,
    value: e.values[f.key] as number,
  }));
  const ins = await db.from("metrics_daily").insert(rows);
  if (ins.error) throw new Error(ins.error.message);
  await db.from("metrics_runs").insert({
    day: e.weekEnd,
    source: "instagram_manual",
    ok: true,
    detail: `entered by hand (${by}): ${FIELDS.filter((f) => e.values[f.key] !== undefined).map((f) => `${f.label} ${e.values[f.key]}`).join(", ")}`,
  });
}

/** The entry already saved for a week, if any (to prefill the form). */
export async function savedEntry(weekEnd: string): Promise<Partial<Record<FieldKey, number>>> {
  const { data } = await serviceClient()
    .from("metrics_daily")
    .select("metric, value")
    .eq("day", weekEnd)
    .eq("source", "instagram")
    .eq("dimension", "")
    .in("metric", METRICS);
  const out: Partial<Record<FieldKey, number>> = {};
  for (const f of FIELDS) {
    const r = (data ?? []).find((x) => x.metric === f.metric);
    if (r) out[f.key] = Number(r.value);
  }
  return out;
}

export async function hasEntry(weekEnd: string): Promise<boolean> {
  const e = await savedEntry(weekEnd);
  return e.followers !== undefined && e.profileVisits !== undefined;
}

export type LatestInstagram = {
  day: string;
  values: Record<string, number>;
  prevDay: string | null;
  prev: Record<string, number>;
};

/** The newest Instagram snapshot (whatever its date) and the one before it, for the dashboard panel. */
export async function latestInstagram(): Promise<LatestInstagram | null> {
  const { data } = await serviceClient()
    .from("metrics_daily")
    .select("day, metric, value")
    .eq("source", "instagram")
    .eq("dimension", "")
    .order("day", { ascending: false })
    .limit(200);
  const rows = (data ?? []) as { day: string; metric: string; value: number }[];
  if (!rows.length) return null;
  const days = [...new Set(rows.map((r) => r.day))];
  const pick = (d: string) => Object.fromEntries(rows.filter((r) => r.day === d).map((r) => [r.metric, Number(r.value)]));
  return { day: days[0], values: pick(days[0]), prevDay: days[1] ?? null, prev: days[1] ? pick(days[1]) : {} };
}

export type PostCard = {
  shortcode: string;
  title: string;
  alt: string;
  thumb: string | null;
  postedOn: string | null;
  views: number;
  change: number | null;
};

/** Every known post with its newest view count (and the change since the snapshot before), most viewed first. */
export async function postCards(): Promise<{ day: string | null; cards: PostCard[] }> {
  const db = serviceClient();
  const [posts, views] = await Promise.all([
    db.from("instagram_posts").select("shortcode, title, alt, thumb, posted_on"),
    db
      .from("metrics_daily")
      .select("day, dimension, value")
      .eq("source", "instagram")
      .eq("metric", "post_views")
      .order("day", { ascending: false })
      .limit(600),
  ]);
  const meta = new Map((posts.data ?? []).map((p) => [p.shortcode as string, p]));
  const latest = new Map<string, { day: string; value: number }>();
  const before = new Map<string, number>();
  for (const r of (views.data ?? []) as { day: string; dimension: string; value: number }[]) {
    const prev = latest.get(r.dimension);
    if (!prev) latest.set(r.dimension, { day: r.day, value: Number(r.value) });
    else if (!before.has(r.dimension) && r.day < prev.day) before.set(r.dimension, Number(r.value));
  }
  const keys = new Set([...meta.keys(), ...latest.keys()]);
  const cards = [...keys].map((k) => {
    const m = meta.get(k);
    const v = latest.get(k);
    return {
      shortcode: k,
      title: (m?.title as string) || "New post",
      alt: (m?.alt as string) || "Instagram post",
      thumb: (m?.thumb as string) ?? null,
      postedOn: (m?.posted_on as string) ?? null,
      views: v?.value ?? 0,
      change: v && before.has(k) ? v.value - (before.get(k) as number) : null,
    };
  });
  cards.sort((a, b) => b.views - a.views);
  const day = [...latest.values()].map((x) => x.day).sort().pop() ?? null;
  return { day, cards };
}
