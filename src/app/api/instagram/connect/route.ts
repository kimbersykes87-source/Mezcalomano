import { NextResponse } from "next/server";
import { IG_REDIRECT_PATH, IG_SCOPES } from "@/lib/metrics/instagram";

/**
 * One-time (and re-connect) link for the Instagram account owner.
 * Sends the browser to Instagram's consent screen; Instagram returns to
 * /api/instagram/callback. Only the expected account (@mezcalomano) is saved.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const appId = process.env.INSTAGRAM_APP_ID?.trim();
  if (!appId) return new NextResponse("Instagram is not configured (INSTAGRAM_APP_ID missing).", { status: 500 });

  const origin = new URL(request.url).origin;
  const url = new URL("https://www.instagram.com/oauth/authorize");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("redirect_uri", `${origin}${IG_REDIRECT_PATH}`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", IG_SCOPES);
  return NextResponse.redirect(url.toString());
}
