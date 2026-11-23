import { NextResponse } from "next/server";
import { BOT_UA, pressDb } from "@/lib/press-links";

/**
 * Box QR scan counter. The QR on the Discovery Deck box is the plain address
 * mezcalomano.com/directory, so a scan is taken to be a visit that starts on
 * /directory with no referrer. src/components/DirectoryScanBeacon.tsx decides
 * that in the browser (once per session) and calls this route, which saves one
 * row to Supabase `qr_scans`.
 *
 * Stores no IP address and no cookies: only the time, the country Vercel
 * derives from the request, and phone vs desktop. Crawlers and own browsers
 * (cookie mm_ignore=1) are not saved.
 * Always answers 204 so a tracking problem never shows to visitors.
 */

const done = () => new NextResponse(null, { status: 204 });

export async function POST(request: Request) {
  try {
    const ua = request.headers.get("user-agent") ?? "";
    if (!ua || BOT_UA.test(ua)) return done();

    // Only the site's own pages may report a scan.
    const site = request.headers.get("sec-fetch-site");
    if (site && site !== "same-origin") return done();

    const cookies = (request.headers.get("cookie") ?? "").split(/;\s*/);
    if (cookies.includes("mm_ignore=1")) return done();

    const db = pressDb();
    if (!db) {
      console.error("[qr-scan] Missing Supabase env vars");
      return done();
    }

    const country = (request.headers.get("x-vercel-ip-country") ?? "").trim().slice(0, 2).toUpperCase() || null;
    const { error } = await db.from("qr_scans").insert({
      country,
      device: /mobile|iphone|android/i.test(ua) ? "mobile" : "desktop",
    });
    if (error) console.error("[qr-scan] Insert failed:", error.message);
  } catch (err) {
    console.error("[qr-scan] Error:", err instanceof Error ? err.message : err);
  }
  return done();
}
