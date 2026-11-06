import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/admin/auth";
import { signState, STATE_COOKIE } from "@/lib/admin/ig-state";
import { GRAPH, IG_REDIRECT_PATH, metaEnv } from "@/lib/metrics/instagram";

/**
 * Start (or restart) the Instagram connection. Logged-in admin only.
 * Sends the browser to Meta's Facebook Login for Business dialog with our
 * read only configuration. The `state` is signed and expires in 10 minutes;
 * the same random part is also kept in a cookie so the callback can check it
 * came back to the same browser. (The admin session cookie is SameSite strict,
 * so it is not sent on the return trip and cannot be used there.)
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isLoggedIn())) return NextResponse.redirect(new URL("/admin/login?next=/api/admin/instagram/connect", request.url));
  const { appId, configId } = metaEnv();
  if (!appId || !configId) return new NextResponse("Meta is not configured (META_APP_ID or META_CONFIG_ID missing).", { status: 500 });

  const nonce = randomBytes(16).toString("hex");
  const exp = String(Date.now() + 10 * 60_000);
  const state = `${nonce}.${exp}.${signState(nonce, exp)}`;

  const origin = new URL(request.url).origin;
  const url = new URL(GRAPH.replace("graph.facebook.com", "www.facebook.com") + "/dialog/oauth");
  url.searchParams.set("client_id", appId);
  url.searchParams.set("config_id", configId);
  url.searchParams.set("redirect_uri", `${origin}${IG_REDIRECT_PATH}`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("override_default_response_type", "true");
  url.searchParams.set("state", state);

  const res = NextResponse.redirect(url.toString());
  res.cookies.set(STATE_COOKIE, nonce, { httpOnly: true, secure: true, sameSite: "lax", path: "/api/admin/instagram/connect", maxAge: 600 });
  return res;
}
