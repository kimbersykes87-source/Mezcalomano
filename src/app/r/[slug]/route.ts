import { after, NextResponse } from "next/server";
import { BOT_UA, pressDb, pressDestination, SLUG_RE } from "@/lib/press-links";

/**
 * Press and creator links: mezcalomano.com/r/mezcal-culture
 *
 * Logs the click to Supabase `press_clicks`, then sends the visitor to the
 * Discovery Deck with the outlet's slug in the UTMs, so Shopify orders show
 * which outlet sent the buyer. No IP address or cookies are stored. Crawlers
 * and mail link scanners are logged with is_bot = true. The redirect never
 * waits for the log; a slug that was never made just redirects (the log
 * insert fails on the foreign key and is ignored).
 */

export const dynamic = "force-dynamic";

async function logClick(slug: string, ua: string, country: string | null, referer: string | null) {
  try {
    const db = pressDb();
    if (!db) {
      console.error("[press-click] Missing Supabase env vars");
      return;
    }
    let referrerHost: string | null = null;
    try {
      referrerHost = referer ? new URL(referer).hostname.slice(0, 100) : null;
    } catch {
      referrerHost = null;
    }
    const { error } = await db.from("press_clicks").insert({
      slug,
      is_bot: !ua || BOT_UA.test(ua),
      country: country ? country.slice(0, 2) : null,
      device: /mobile|iphone|android/i.test(ua) ? "mobile" : "desktop",
      referrer_host: referrerHost,
      user_agent: ua.slice(0, 200) || null,
    });
    if (error && error.code !== "23503") console.error("[press-click] Insert failed:", error.message);
  } catch (err) {
    console.error("[press-click] Error:", err instanceof Error ? err.message : err);
  }
}

export async function GET(request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug: raw } = await ctx.params;
  const slug = raw.toLowerCase();
  const valid = SLUG_RE.test(slug);

  if (valid) {
    const ua = request.headers.get("user-agent") ?? "";
    after(() => logClick(slug, ua, request.headers.get("x-vercel-ip-country"), request.headers.get("referer")));
  }

  const res = NextResponse.redirect(pressDestination(valid ? slug : null), 302);
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}
