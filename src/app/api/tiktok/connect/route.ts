import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { TT_REDIRECT_PATH, TT_SCOPES } from "@/lib/metrics/tiktok";

/** One-time (and re-connect) link: sends the account owner to TikTok's consent screen. */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const key = process.env.TIKTOK_CLIENT_KEY?.trim();
  if (!key) return new NextResponse("TikTok is not configured (TIKTOK_CLIENT_KEY missing).", { status: 500 });

  const state = randomBytes(16).toString("hex");
  const origin = new URL(request.url).origin;
  const url = new URL("https://www.tiktok.com/v2/auth/authorize/");
  url.searchParams.set("client_key", key);
  url.searchParams.set("scope", TT_SCOPES);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", `${origin}${TT_REDIRECT_PATH}`);
  url.searchParams.set("state", state);

  const res = NextResponse.redirect(url.toString());
  res.cookies.set("mm_tt_state", state, { httpOnly: true, secure: true, sameSite: "lax", path: "/api/tiktok", maxAge: 600 });
  return res;
}
