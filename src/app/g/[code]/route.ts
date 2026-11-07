import { createClient } from "@supabase/supabase-js";
import { after, NextResponse } from "next/server";

/**
 * Personal launch links: mezcalomano.com/g/p001
 *
 * Logs the click to Supabase `launch_clicks`, then sends the visitor straight
 * to the friends page on the shop with the FRIENDS10 discount applied and the
 * person's code in utm_content (so Shopify orders show who bought).
 *
 * Stores no IP address and no cookies. Crawlers and link previews are logged
 * with is_bot = true instead of being dropped. The redirect never waits for
 * the log, and a logging problem never shows to the visitor.
 */

export const dynamic = "force-dynamic";

const CODE = /^p\d{3}$/;
const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|headless|lighthouse|python|curl|wget|go-http|okhttp/i;
const SHOP_DISCOUNT = "https://shop.mezcalomano.com/discount/FRIENDS10";

function destination(code: string | null): string {
  const utm = ["utm_source=friends", "utm_medium=whatsapp", "utm_campaign=launch"];
  if (code) utm.push(`utm_content=${code}`);
  return `${SHOP_DISCOUNT}?redirect=${encodeURIComponent(`/products/friends?${utm.join("&")}`)}`;
}

function envValue(name: string): string | null {
  const value = process.env[name];
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

async function logClick(code: string, ua: string, country: string | null) {
  try {
    const supabaseUrl = envValue("SUPABASE_URL") || envValue("NEXT_PUBLIC_SUPABASE_URL");
    const serviceKey = envValue("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      console.error("[launch-click] Missing Supabase env vars");
      return;
    }
    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { error } = await supabase.from("launch_clicks").insert({
      code,
      is_bot: !ua || BOT_UA.test(ua),
      country: country ? country.slice(0, 2) : null,
      device: /mobile|iphone|android/i.test(ua) ? "mobile" : "desktop",
      user_agent: ua.slice(0, 200) || null,
    });
    if (error) console.error("[launch-click] Insert failed:", error.message);
  } catch (err) {
    console.error("[launch-click] Error:", err instanceof Error ? err.message : err);
  }
}

export async function GET(request: Request, ctx: { params: Promise<{ code: string }> }) {
  const { code: raw } = await ctx.params;
  const code = raw.toLowerCase();
  const valid = CODE.test(code);

  if (valid) {
    const ua = request.headers.get("user-agent") ?? "";
    const country = request.headers.get("x-vercel-ip-country");
    after(() => logClick(code, ua, country));
  }

  const res = NextResponse.redirect(destination(valid ? code : null), 302);
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  return res;
}
