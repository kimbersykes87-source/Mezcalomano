import { createClient } from "@supabase/supabase-js";
import { after, NextResponse } from "next/server";
import { BOT_UA } from "@/lib/press-links";

/**
 * mezcalomano.com/win
 *
 * The tracked link handed to Mezcal Culture for the 19 Nov 2026 newsletter.
 * Logs the click to Supabase `giveaway_clicks`, then sends the reader to the
 * giveaway entry page with the campaign UTMs, so Shopify attributes the
 * session and any order to the newsletter.
 *
 * It is a redirect rather than a raw UTM link on purpose: once James has
 * scheduled the email the URL is frozen, but the destination and the logging
 * live here, so both can still be changed.
 *
 * Stores no IP address and no cookies, like `/r/<slug>` and `/g/<code>`.
 * Country, region and city come from Vercel's edge headers. Mail scanners and
 * link previewers are logged with is_bot = true rather than dropped, because a
 * newsletter audience sits behind a lot of them and the raw count would lie.
 * The redirect never waits for the log, and a logging failure is invisible to
 * the reader.
 */

export const dynamic = "force-dynamic";

const ENTRY_PAGE = "https://shop.mezcalomano.com/pages/giveaway-mezcal-culture";

/** Kept in one place: the UTMs must match what the run sheet reports on. */
function destination(): string {
  const utm = new URLSearchParams({
    utm_source: "mezcal-culture",
    utm_medium: "newsletter",
    utm_campaign: "giveaway-2026",
    utm_content: "win-link",
  });
  return `${ENTRY_PAGE}?${utm.toString()}`;
}

function envValue(name: string): string | null {
  const value = process.env[name];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** Vercel percent-encodes city and region names ("New%20York"). */
function geo(headers: Headers, name: string, max: number): string | null {
  const raw = headers.get(name);
  if (!raw) return null;
  let value = raw;
  try {
    value = decodeURIComponent(raw);
  } catch {
    /* a malformed header is used as sent */
  }
  value = value.trim();
  return value ? value.slice(0, max) : null;
}

function hostOf(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).hostname.replace(/^www\./, "").slice(0, 100);
  } catch {
    return null;
  }
}

async function logClick(headers: Headers) {
  try {
    const url = envValue("SUPABASE_URL") || envValue("NEXT_PUBLIC_SUPABASE_URL");
    const key = envValue("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !key) {
      console.error("[giveaway-click] Missing Supabase env vars");
      return;
    }
    const ua = headers.get("user-agent") ?? "";
    const db = createClient(url, key, { auth: { persistSession: false } });
    const { error } = await db.from("giveaway_clicks").insert({
      slug: "mezcal-culture",
      is_bot: !ua || BOT_UA.test(ua),
      country: geo(headers, "x-vercel-ip-country", 2),
      region: geo(headers, "x-vercel-ip-country-region", 10),
      city: geo(headers, "x-vercel-ip-city", 100),
      device: /mobile|iphone|android/i.test(ua) ? "mobile" : "desktop",
      referrer_host: hostOf(headers.get("referer")),
      user_agent: ua.slice(0, 200) || null,
    });
    if (error) console.error("[giveaway-click] Insert failed:", error.message);
  } catch (err) {
    console.error("[giveaway-click] Error:", err instanceof Error ? err.message : err);
  }
}

export async function GET(request: Request) {
  after(() => logClick(request.headers));
  const res = NextResponse.redirect(destination(), 302);
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}
