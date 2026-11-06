import { requireAdmin } from "@/lib/admin/auth";
import { buildSummary, latestRuns, type Period } from "@/lib/admin/summary";
import { latestInstagram, postCards } from "@/lib/admin/instagram-manual";
import { periodKey as readPeriod, periodRange, longDay } from "@/lib/admin/period";
import SocialView, { type SocialData, type Stat } from "./SocialView";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const metadata = { title: "Social Media" };

const LEVELS = new Set(["followers", "following", "posts"]);

function stat(cur: Period, prev: Period, key: string, label: string, help: string, metrics: string[]): Stat {
  const metric = metrics.find((m) => cur.value("instagram", m) !== null) ?? metrics[0];
  return {
    key,
    label,
    value: cur.value("instagram", metric),
    previous: prev.value("instagram", metric),
    kind: (LEVELS.has(metric) ? "level" : "flow") as Stat["kind"],
    help,
  };
}

export default async function Page({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  await requireAdmin("/social");
  const { p } = await searchParams;
  const key = readPeriod(p);
  const { from, to } = periodRange(key);
  const [summary, runs, ig, posts] = await Promise.all([buildSummary(from, to), latestRuns(), latestInstagram(), postCards()]);
  const cur = summary.current;
  const prev = summary.previous;
  const run = runs.find((r) => r.source === "instagram");
  const followers = summary.headlines.find((h) => h.key === "ig_followers");
  const tiktok = summary.headlines.find((h) => h.key === "tt_followers");

  const audience: Stat[] = [
    {
      key: "followers",
      label: "Followers",
      value: followers?.value ?? null,
      previous: followers?.previous ?? null,
      kind: "level" as const,
      help: "People following @mezcalomano",
    },
    stat(cur, prev, "following", "Following", "Accounts we follow", ["following"]),
    stat(cur, prev, "posts", "Posts", "Posts on the profile", ["posts"]),
  ].filter((s) => s.value !== null);

  const activity: Stat[] = [
    stat(cur, prev, "views", "Views", "Times posts and reels were seen", ["views"]),
    stat(cur, prev, "reach", "Viewers", "Different people who saw something", ["reach"]),
    stat(cur, prev, "profile_views", "Profile visits", "People who opened the profile", ["profile_views"]),
    stat(cur, prev, "interactions", "Interactions", "Likes, comments, saves and shares", ["total_interactions", "interactions"]),
    stat(cur, prev, "accounts_engaged", "Accounts engaged", "People who interacted at all", ["accounts_engaged"]),
    stat(cur, prev, "link_taps", "Link taps", "Taps on the link in the bio", ["profile_links_taps", "website_clicks"]),
  ].filter((s) => s.value !== null);

  const tapMetric = cur.value("instagram", "profile_links_taps") !== null ? "profile_links_taps" : "website_clicks";
  const socialVisits = cur
    .top("web_main", "visits_by_referrer", 40)
    .filter((r) => /instagram|tiktok|facebook|fb\.|meta/i.test(r.name))
    .slice(0, 8);

  const data: SocialData = {
    periodKey: key,
    rangeText: `${longDay(from)} to ${longDay(to)} (London time).${key === "week" ? "" : " Includes today so far."}`,
    instagram: {
      ok: run ? run.ok : ig ? true : null,
      lastRun: run ? new Date(run.ran_at).toLocaleString("en-GB", { timeZone: "Europe/London", dateStyle: "medium", timeStyle: "short" }) : null,
      figuresDay: ig?.day ?? null,
      tokenDays: ig?.values.token_days_left ?? null,
      detail: run?.detail ?? null,
    },
    audience,
    activity,
    viewsChart: [
      { name: "Views", color: "#dfb725", points: cur.series("instagram", "views") },
      { name: "Viewers", color: "#b86744", points: cur.series("instagram", "reach") },
    ],
    actionsChart: [
      { name: "Profile visits", color: "#dfb725", points: cur.series("instagram", "profile_views") },
      { name: "Link taps", color: "#b86744", points: cur.series("instagram", tapMetric) },
    ],
    posts: posts.cards,
    socialVisits,
    tiktokFollowers: tiktok?.value ?? null,
  };

  return <SocialView data={data} />;
}
