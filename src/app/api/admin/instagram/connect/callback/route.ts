import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import {
  exchangeFor60Days,
  expectedAccountId,
  graphGet,
  IG_REDIRECT_PATH,
  metaEnv,
  saveInstagramToken,
} from "@/lib/metrics/instagram";
import { signState, STATE_COOKIE } from "@/lib/admin/ig-state";

/**
 * Meta returns here after the account owner approves access.
 * Checks the signed state, swaps the code for a token, makes it a 60 day token,
 * confirms @mezcalomano is among the granted accounts, and saves the token in
 * Supabase `admin_tokens`. The token is never shown or logged.
 */
export const dynamic = "force-dynamic";

const page = (title: string, body: string, status = 200) =>
  new NextResponse(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title><body style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1rem;line-height:1.5"><h1 style="font-size:1.4rem">${title}</h1><p>${body}</p></body>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );

function stateOk(state: string | null, cookieNonce: string | undefined): boolean {
  if (!state || !cookieNonce) return false;
  const [nonce, exp, mac] = state.split(".");
  if (!nonce || !exp || !mac || nonce !== cookieNonce || Number(exp) < Date.now()) return false;
  const good = Buffer.from(signState(nonce, exp), "hex");
  const given = Buffer.from(mac, "hex");
  return good.length === given.length && timingSafeEqual(good, given);
}

type DebugToken = {
  data?: { granular_scopes?: { scope: string; target_ids?: string[] }[]; is_valid?: boolean };
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cookieNonce = request.headers.get("cookie")?.match(new RegExp(`${STATE_COOKIE}=([a-f0-9]+)`))?.[1];
  if (!stateOk(url.searchParams.get("state"), cookieNonce)) {
    return page("Link expired", "Start again from the admin site (open /api/admin/instagram/connect while logged in).", 400);
  }
  const code = url.searchParams.get("code");
  if (url.searchParams.get("error") || !code) {
    return page("Instagram was not connected", "Access was not approved. You can close this page and try again.", 400);
  }

  const { appId, secret } = metaEnv();
  if (!appId || !secret) return page("Not configured", "The Meta app settings are missing on the server.", 500);

  try {
    const first = await graphGet<{ access_token: string }>("/oauth/access_token", {
      client_id: appId,
      client_secret: secret,
      redirect_uri: `${url.origin}${IG_REDIRECT_PATH}`,
      code,
    });
    const long = await exchangeFor60Days(first.access_token);

    // Which Instagram accounts did this login grant? (granular_scopes lists their IDs.)
    const dbg = await graphGet<DebugToken>("/debug_token", {
      input_token: long.access_token,
      access_token: `${appId}|${secret}`,
    });
    const granted = new Set(
      (dbg.data?.granular_scopes ?? [])
        .filter((s) => s.scope.startsWith("instagram_"))
        .flatMap((s) => s.target_ids ?? [])
    );
    const igId = expectedAccountId();
    if (!granted.has(igId)) {
      return page("Wrong account", "This link only connects the @mezcalomano Instagram account, and it was not selected. Nothing was saved.", 403);
    }

    const me = await graphGet<{ username?: string }>(`/${igId}`, { fields: "username", access_token: long.access_token });
    await saveInstagramToken(long.access_token, long.expires_in, igId, me.username ?? "mezcalomano");
    const res = page("Instagram connected", `@${me.username ?? "mezcalomano"} is connected to the Mezcalómano dashboard. You can close this page.`);
    res.cookies.set(STATE_COOKIE, "", { path: "/api/admin/instagram/connect", maxAge: 0 });
    return res;
  } catch (err) {
    console.error("[instagram/callback]", err instanceof Error ? err.message : err);
    return page("Something went wrong", "Instagram could not be connected. Please tell Kimber the time you tried.", 500);
  }
}
