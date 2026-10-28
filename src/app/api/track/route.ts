import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/**
 * Click counter for links that leave the site (producer shops, Shopify,
 * Instagram, TikTok). Called by src/components/SiteAnalytics.tsx with
 * navigator.sendBeacon. Saves one row per click to Supabase `events`.
 *
 * Stores no IP address and no cookies: only the page, the link, the country
 * Vercel derives from the request, and phone vs desktop.
 * Always answers 204 so a tracking problem never shows to visitors.
 */

const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|python|curl|wget/i;
const MAX_BODY = 2048;

function envValue(name: string): string | null {
  const value = process.env[name];
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

function clean(value: unknown, max = 500): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function hostOf(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

const done = () => new NextResponse(null, { status: 204 });

export async function POST(request: Request) {
  try {
    const ua = request.headers.get("user-agent") ?? "";
    if (!ua || BOT_UA.test(ua)) return done();

    const raw = await request.text();
    if (!raw || raw.length > MAX_BODY) return done();

    const body = JSON.parse(raw) as Record<string, unknown>;
    if (body.type !== "outbound_click") return done();

    const url = clean(body.url, 1000);
    const targetHost = hostOf(url);
    if (!url || !targetHost) return done();

    const supabaseUrl = envValue("SUPABASE_URL") || envValue("NEXT_PUBLIC_SUPABASE_URL");
    const serviceKey = envValue("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      console.error("[track] Missing Supabase env vars");
      return done();
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { error } = await supabase.from("events").insert({
      type: "outbound_click",
      path: clean(body.path, 300),
      target_url: url,
      target_host: targetHost,
      species_slug: clean(body.species, 100),
      link_group: clean(body.group, 20),
      referrer_host: hostOf(clean(body.referrer, 500)),
      country: clean(request.headers.get("x-vercel-ip-country"), 2),
      device: /mobile|iphone|android/i.test(ua) ? "mobile" : "desktop",
    });
    if (error) console.error("[track] Insert failed:", error.message);
  } catch (err) {
    console.error("[track] Error:", err instanceof Error ? err.message : err);
  }
  return done();
}
