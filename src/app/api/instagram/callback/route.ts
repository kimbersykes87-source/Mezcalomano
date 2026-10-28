import { NextResponse } from "next/server";
import { expectedUsername, IG_REDIRECT_PATH, saveInstagramToken } from "@/lib/metrics/instagram";

/**
 * Instagram returns here after the account owner approves access.
 * Exchanges the code for a short-lived token, then a 60 day token, checks it
 * belongs to the expected account, and saves it in Supabase `admin_tokens`.
 * The token is never shown or logged.
 */
export const dynamic = "force-dynamic";

const page = (title: string, body: string, status = 200) =>
  new NextResponse(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title><body style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1rem;line-height:1.5"><h1 style="font-size:1.4rem">${title}</h1><p>${body}</p></body>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (url.searchParams.get("error") || !code) {
    return page("Instagram was not connected", "Access was not approved. You can close this page and try the link again.", 400);
  }

  const appId = process.env.INSTAGRAM_APP_ID?.trim();
  const secret = process.env.INSTAGRAM_APP_SECRET?.trim();
  if (!appId || !secret) return page("Not configured", "The Instagram app settings are missing on the server.", 500);

  try {
    const form = new URLSearchParams({
      client_id: appId,
      client_secret: secret,
      grant_type: "authorization_code",
      redirect_uri: `${url.origin}${IG_REDIRECT_PATH}`,
      code: code.replace(/#_$/, ""),
    });
    const shortRes = await fetch("https://api.instagram.com/oauth/access_token", { method: "POST", body: form });
    const short = (await shortRes.json()) as { access_token?: string; error_message?: string };
    if (!short.access_token) throw new Error(short.error_message || `code exchange HTTP ${shortRes.status}`);

    const longUrl = new URL("https://graph.instagram.com/access_token");
    longUrl.searchParams.set("grant_type", "ig_exchange_token");
    longUrl.searchParams.set("client_secret", secret);
    longUrl.searchParams.set("access_token", short.access_token);
    const longRes = await fetch(longUrl);
    const long = (await longRes.json()) as { access_token?: string; expires_in?: number; error?: { message?: string } };
    if (!long.access_token) throw new Error(long.error?.message || `token exchange HTTP ${longRes.status}`);

    const meUrl = new URL("https://graph.instagram.com/me");
    meUrl.searchParams.set("fields", "user_id,username");
    meUrl.searchParams.set("access_token", long.access_token);
    const me = (await (await fetch(meUrl)).json()) as { user_id?: string; id?: string; username?: string };
    const username = (me.username ?? "").toLowerCase();
    if (username !== expectedUsername()) {
      return page("Wrong account", `This link only connects @${expectedUsername()}. Nothing was saved.`, 403);
    }

    await saveInstagramToken(long.access_token, long.expires_in ?? 5184000, me.user_id ?? me.id ?? "", me.username ?? "");
    return page("Instagram connected", `@${me.username} is connected to the Mezcalómano dashboard. You can close this page.`);
  } catch (err) {
    console.error("[instagram/callback]", err instanceof Error ? err.message : err);
    return page("Something went wrong", "Instagram could not be connected. Please tell Kimber the time you tried.", 500);
  }
}
