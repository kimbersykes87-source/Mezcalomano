import { serviceClient, type MetricRow } from "./store";

/**
 * Instagram figures for @mezcalomano via "Instagram API with Instagram Login"
 * (works with a professional account that is not linked to Facebook).
 *
 * Env: INSTAGRAM_APP_ID (not secret), INSTAGRAM_APP_SECRET (secret).
 * Optional: INSTAGRAM_EXPECTED_USERNAME (defaults to mezcalomano), so only that
 * account can be connected.
 *
 * The long-lived token (60 days) lives in Supabase `admin_tokens` and is
 * refreshed by the nightly job once it is a week old.
 */

const GRAPH = "https://graph.instagram.com";
export const IG_SCOPES = "instagram_business_basic,instagram_business_manage_insights";
export const IG_REDIRECT_PATH = "/api/instagram/callback";
export const expectedUsername = () =>
  (process.env.INSTAGRAM_EXPECTED_USERNAME?.trim() || "mezcalomano").toLowerCase();

type TokenRow = { token: string; expires_at: string | null; refreshed_at: string };

export async function saveInstagramToken(
  token: string,
  expiresInSeconds: number,
  accountId: string,
  accountName: string
) {
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
    .select("token, expires_at, refreshed_at")
    .eq("provider", "instagram")
    .maybeSingle();
  if (error) throw new Error(`loading Instagram token: ${error.message}`);
  if (!data) throw new Error("Instagram is not connected yet (open /api/instagram/connect)");
  return data as TokenRow;
}

async function igGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${GRAPH}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { cache: "no-store" });
  const json = (await res.json().catch(() => null)) as (T & { error?: { message?: string } }) | null;
  if (!res.ok || !json || json.error) {
    throw new Error(`Instagram ${path}: ${json?.error?.message ?? `HTTP ${res.status}`}`);
  }
  return json;
}

/** Refreshes the token when it is more than 7 days old; returns a usable token. */
async function freshToken(): Promise<{ token: string; expiresAt: Date | null }> {
  const row = await loadToken();
  const age = Date.now() - new Date(row.refreshed_at).getTime();
  if (age < 7 * 86400_000) {
    return { token: row.token, expiresAt: row.expires_at ? new Date(row.expires_at) : null };
  }
  const r = await igGet<{ access_token: string; expires_in: number }>("/refresh_access_token", {
    grant_type: "ig_refresh_token",
    access_token: row.token,
  });
  const me = await igGet<{ user_id?: string; id?: string; username: string }>("/me", {
    fields: "user_id,username",
    access_token: r.access_token,
  });
  await saveInstagramToken(r.access_token, r.expires_in, me.user_id ?? me.id ?? "", me.username);
  return { token: r.access_token, expiresAt: new Date(Date.now() + r.expires_in * 1000) };
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

export async function collectInstagram(start: Date, end: Date): Promise<MetricRow[]> {
  const { token, expiresAt } = await freshToken();
  const rows: MetricRow[] = [];

  const profile = await igGet<{ followers_count?: number; follows_count?: number; media_count?: number }>("/me", {
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
      const params: Record<string, string> = {
        metric,
        period: "day",
        metric_type: "total_value",
        since,
        until,
        access_token: token,
      };
      if (metric === "follows_and_unfollows") params.breakdown = "follow_type";
      const r = await igGet<InsightsResponse>("/me/insights", params);
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

  if (missing.length) rows.push({ metric: "source_note", dimension: `not available: ${missing.join(",")}`, value: 1 });
  if (expiresAt) {
    rows.push({ metric: "token_days_left", value: Math.round((expiresAt.getTime() - Date.now()) / 86400_000) });
  }
  return rows;
}
