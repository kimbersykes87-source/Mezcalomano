import { serviceClient, type MetricRow } from "./store";

/**
 * Instagram figures for @mezcalomano via the Meta Graph API, using the
 * "Mezcalomano Site Metrics" app (Facebook Login for Business, read only
 * configuration: instagram_basic + instagram_manage_insights).
 *
 * Env (see .env.local.example):
 *   META_APP_ID       not secret
 *   META_APP_SECRET   secret, Sensitive in Vercel, never in the repo
 *   META_CONFIG_ID    the Facebook Login for Business configuration ID
 * Optional:
 *   META_GRAPH_VERSION          defaults to v23.0
 *   INSTAGRAM_EXPECTED_ID       defaults to the @mezcalomano account ID, so only that account can be saved
 *
 * The 60 day token lives in Supabase `admin_tokens` (service role only) and is
 * refreshed by the nightly job when fewer than 21 days are left. Figures only
 * are stored (counts and insights), not copies of posts or media.
 */

export const META_VERSION = process.env.META_GRAPH_VERSION?.trim() || "v23.0";
export const GRAPH = `https://graph.facebook.com/${META_VERSION}`;
export const IG_REDIRECT_PATH = "/api/admin/instagram/connect/callback";
export const expectedAccountId = () => process.env.INSTAGRAM_EXPECTED_ID?.trim() || "17841478133224919";

export function metaEnv() {
  const appId = process.env.META_APP_ID?.trim();
  const secret = process.env.META_APP_SECRET?.trim();
  const configId = process.env.META_CONFIG_ID?.trim();
  return { appId, secret, configId };
}

type TokenRow = { token: string; account_id: string | null; account_name: string | null; expires_at: string | null; refreshed_at: string };

export async function saveInstagramToken(token: string, expiresInSeconds: number, accountId: string, accountName: string) {
  const { error } = await serviceClient()
    .from("admin_tokens")
    .upsert({
      provider: "instagram",
      account_id: accountId,
      account_name: accountName,
      token,
      expires_at: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
      refreshed_at: new Date().toISOString(),
    });
  if (error) throw new Error(`saving Instagram token: ${error.message}`);
}

async function loadToken(): Promise<TokenRow> {
  const { data, error } = await serviceClient()
    .from("admin_tokens")
    .select("token, account_id, account_name, expires_at, refreshed_at")
    .eq("provider", "instagram")
    .maybeSingle();
  if (error) throw new Error(`loading Instagram token: ${error.message}`);
  if (!data) throw new Error("Instagram is not connected yet (log in to the admin and open /api/admin/instagram/connect)");
  return data as TokenRow;
}

export async function graphGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(path.startsWith("http") ? path : `${GRAPH}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { cache: "no-store" });
  const json = (await res.json().catch(() => null)) as (T & { error?: { message?: string } }) | null;
  if (!res.ok || !json || json.error) {
    throw new Error(`Meta ${path.split("?")[0]}: ${json?.error?.message ?? `HTTP ${res.status}`}`);
  }
  return json;
}

/** Exchanges a token for a new 60 day one. Used for the refresh and by the callback. */
export async function exchangeFor60Days(token: string): Promise<{ access_token: string; expires_in: number }> {
  const { appId, secret } = metaEnv();
  if (!appId || !secret) throw new Error("META_APP_ID or META_APP_SECRET missing");
  const r = await graphGet<{ access_token: string; expires_in?: number }>("/oauth/access_token", {
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: secret,
    fb_exchange_token: token,
    set_token_expires_in_60_days: "true",
  });
  return { access_token: r.access_token, expires_in: r.expires_in ?? 5184000 };
}

/** Returns a usable token, refreshing it when fewer than 21 days are left. A failed refresh never blocks today's fetch. */
async function freshToken(): Promise<{ token: string; igId: string; expiresAt: Date | null }> {
  const row = await loadToken();
  const igId = row.account_id || expectedAccountId();
  const expiresAt = row.expires_at ? new Date(row.expires_at) : null;
  const daysLeft = expiresAt ? (expiresAt.getTime() - Date.now()) / 86400_000 : 0;
  if (daysLeft >= 21) return { token: row.token, igId, expiresAt };
  try {
    const r = await exchangeFor60Days(row.token);
    await saveInstagramToken(r.access_token, r.expires_in, igId, row.account_name ?? "");
    return { token: r.access_token, igId, expiresAt: new Date(Date.now() + r.expires_in * 1000) };
  } catch (err) {
    console.error("[instagram] token refresh failed:", err instanceof Error ? err.message : err);
    if (daysLeft <= 0) throw new Error("Instagram token expired and could not be refreshed: reconnect from the admin");
    return { token: row.token, igId, expiresAt };
  }
}

// Daily account insights. Each is fetched on its own so one retired or
// unavailable metric (Meta changes these often) never blocks the rest.
const DAY_METRICS = [
  "reach",
  "views",
  "profile_views",
  "accounts_engaged",
  "total_interactions",
  "website_clicks",
  "profile_links_taps",
  "follows_and_unfollows",
];

type InsightsResponse = {
  data: {
    name: string;
    total_value?: { value?: number; breakdowns?: { results?: { dimension_values: string[]; value: number }[] }[] };
    values?: { value: number }[];
  }[];
};

type MediaList = {
  data: { id: string; shortcode?: string; like_count?: number; comments_count?: number }[];
};

export async function collectInstagram(start: Date, end: Date): Promise<MetricRow[]> {
  const { token, igId, expiresAt } = await freshToken();
  const rows: MetricRow[] = [];

  const profile = await graphGet<{ followers_count?: number; follows_count?: number; media_count?: number }>(`/${igId}`, {
    fields: "followers_count,follows_count,media_count",
    access_token: token,
  });
  rows.push({ metric: "followers", value: profile.followers_count ?? 0 });
  rows.push({ metric: "following", value: profile.follows_count ?? 0 });
  rows.push({ metric: "posts", value: profile.media_count ?? 0 });

  const since = String(Math.floor(start.getTime() / 1000));
  const until = String(Math.floor(end.getTime() / 1000));
  const missing: string[] = [];

  for (const metric of DAY_METRICS) {
    try {
      const params: Record<string, string> = { metric, period: "day", metric_type: "total_value", since, until, access_token: token };
      if (metric === "follows_and_unfollows") params.breakdown = "follow_type";
      const r = await graphGet<InsightsResponse>(`/${igId}/insights`, params);
      const item = r.data?.[0];
      if (!item) {
        missing.push(metric);
        continue;
      }
      if (metric === "follows_and_unfollows") {
        for (const b of item.total_value?.breakdowns?.[0]?.results ?? []) {
          const kind = (b.dimension_values?.[0] ?? "").toLowerCase();
          rows.push({ metric: kind.includes("non") ? "unfollows" : "new_followers", value: b.value });
        }
      } else {
        const value = item.total_value?.value ?? item.values?.reduce((a, v) => a + (v.value ?? 0), 0) ?? 0;
        rows.push({ metric, value });
      }
    } catch {
      missing.push(metric);
    }
  }

  // Per post figures for the latest 25 posts: likes, comments and views, keyed by shortcode.
  try {
    const media = await graphGet<MediaList>(`/${igId}/media`, {
      fields: "id,shortcode,like_count,comments_count",
      limit: "25",
      access_token: token,
    });
    for (const m of media.data ?? []) {
      if (!m.shortcode) continue;
      rows.push({ metric: "post_likes", dimension: m.shortcode, value: m.like_count ?? 0 });
      rows.push({ metric: "post_comments", dimension: m.shortcode, value: m.comments_count ?? 0 });
      try {
        const v = await graphGet<InsightsResponse>(`/${m.id}/insights`, { metric: "views", access_token: token });
        const item = v.data?.[0];
        const value = item?.total_value?.value ?? item?.values?.[0]?.value;
        if (typeof value === "number") rows.push({ metric: "post_views", dimension: m.shortcode, value });
      } catch {
        // Some posts (older, or in a format without views) have no insight; skip them quietly.
      }
    }
  } catch (err) {
    missing.push("posts");
    console.error("[instagram] posts:", err instanceof Error ? err.message : err);
  }

  if (missing.length) rows.push({ metric: "source_note", dimension: `not available: ${missing.join(",")}`, value: 1 });
  if (expiresAt) rows.push({ metric: "token_days_left", value: Math.round((expiresAt.getTime() - Date.now()) / 86400_000) });
  return rows;
}
