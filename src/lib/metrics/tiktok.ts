import { serviceClient, type MetricRow } from "./store";

/**
 * TikTok figures for @mezcalomano via TikTok for Developers (Login Kit +
 * Display API). Env: TIKTOK_CLIENT_KEY (not secret), TIKTOK_CLIENT_SECRET
 * (secret). Optional TIKTOK_EXPECTED_USERNAME (defaults to mezcalomano).
 *
 * Access tokens last 24 hours and refresh tokens a year, so the nightly job
 * refreshes on every run and saves both to Supabase admin_tokens.
 */

export const TT_SCOPES = "user.info.basic,user.info.profile,user.info.stats,video.list";
export const TT_REDIRECT_PATH = "/api/tiktok/callback";
export const ttExpectedUsername = () =>
  (process.env.TIKTOK_EXPECTED_USERNAME?.trim() || "mezcalomano").toLowerCase();

const API = "https://open.tiktokapis.com/v2";

type TokenResponse = {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  refresh_expires_in?: number;
  open_id?: string;
  error?: string;
  error_description?: string;
};

export async function tiktokToken(params: Record<string, string>): Promise<TokenResponse> {
  const key = process.env.TIKTOK_CLIENT_KEY?.trim();
  const secret = process.env.TIKTOK_CLIENT_SECRET?.trim();
  if (!key || !secret) throw new Error("TIKTOK_CLIENT_KEY or TIKTOK_CLIENT_SECRET is not set");
  const res = await fetch(`${API}/oauth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "Cache-Control": "no-cache" },
    body: new URLSearchParams({ client_key: key, client_secret: secret, ...params }),
  });
  const json = (await res.json().catch(() => ({}))) as TokenResponse;
  if (!json.access_token) throw new Error(`TikTok token: ${json.error_description || json.error || `HTTP ${res.status}`}`);
  return json;
}

export async function saveTiktokTokens(t: TokenResponse, username: string) {
  const { error } = await serviceClient()
    .from("admin_tokens")
    .upsert({
      provider: "tiktok",
      account_id: t.open_id ?? null,
      account_name: username,
      token: t.access_token,
      expires_at: new Date(Date.now() + (t.expires_in ?? 86400) * 1000).toISOString(),
      refresh_token: t.refresh_token ?? null,
      refresh_expires_at: t.refresh_expires_in ? new Date(Date.now() + t.refresh_expires_in * 1000).toISOString() : null,
      refreshed_at: new Date().toISOString(),
    });
  if (error) throw new Error(`saving TikTok token: ${error.message}`);
}

type UserInfo = {
  data?: {
    user?: {
      username?: string;
      follower_count?: number;
      following_count?: number;
      likes_count?: number;
      video_count?: number;
    };
  };
  error?: { code?: string; message?: string };
};

export async function tiktokUser(accessToken: string) {
  const res = await fetch(`${API}/user/info/?fields=username,follower_count,following_count,likes_count,video_count`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as UserInfo;
  if (json.error?.code && json.error.code !== "ok") throw new Error(`TikTok user info: ${json.error.message || json.error.code}`);
  return json.data?.user ?? {};
}

type VideoList = {
  data?: { videos?: { view_count?: number }[]; cursor?: number; has_more?: boolean };
  error?: { code?: string; message?: string };
};

/** Sum of view counts across up to 100 most recent videos (a running total, so the dashboard shows its change). */
async function recentVideoViews(accessToken: string): Promise<number> {
  let cursor: number | undefined;
  let total = 0;
  for (let page = 0; page < 5; page++) {
    const res = await fetch(`${API}/video/list/?fields=id,view_count`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(cursor ? { max_count: 20, cursor } : { max_count: 20 }),
    });
    const json = (await res.json().catch(() => ({}))) as VideoList;
    if (json.error?.code && json.error.code !== "ok") throw new Error(`TikTok videos: ${json.error.message || json.error.code}`);
    for (const v of json.data?.videos ?? []) total += v.view_count ?? 0;
    if (!json.data?.has_more) break;
    cursor = json.data.cursor;
  }
  return total;
}

export async function collectTiktok(): Promise<MetricRow[]> {
  const { data, error } = await serviceClient()
    .from("admin_tokens")
    .select("refresh_token, account_name")
    .eq("provider", "tiktok")
    .maybeSingle();
  if (error) throw new Error(`loading TikTok token: ${error.message}`);
  if (!data?.refresh_token) throw new Error("TikTok is not connected yet (open /api/tiktok/connect)");

  const t = await tiktokToken({ grant_type: "refresh_token", refresh_token: data.refresh_token });
  await saveTiktokTokens(t, data.account_name ?? "");

  const user = await tiktokUser(t.access_token!);
  const rows: MetricRow[] = [
    { metric: "followers", value: user.follower_count ?? 0 },
    { metric: "following", value: user.following_count ?? 0 },
    { metric: "likes_total", value: user.likes_count ?? 0 },
    { metric: "videos", value: user.video_count ?? 0 },
  ];
  try {
    rows.push({ metric: "total_video_views", value: await recentVideoViews(t.access_token!) });
  } catch (err) {
    rows.push({ metric: "source_note", dimension: `video views not available: ${err instanceof Error ? err.message : err}`, value: 1 });
  }
  return rows;
}
