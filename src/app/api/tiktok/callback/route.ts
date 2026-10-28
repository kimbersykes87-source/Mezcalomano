import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { saveTiktokTokens, tiktokToken, tiktokUser, TT_REDIRECT_PATH, ttExpectedUsername } from "@/lib/metrics/tiktok";

/** TikTok returns here after approval: checks state and account, saves the tokens. Tokens are never shown or logged. */
export const dynamic = "force-dynamic";

const page = (title: string, body: string, status = 200) =>
  new NextResponse(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${title}</title><body style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1rem;line-height:1.5"><h1 style="font-size:1.4rem">${title}</h1><p>${body}</p></body>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const jar = await cookies();
  const expected = jar.get("mm_tt_state")?.value;
  if (!code || !state || !expected || state !== expected) {
    return page("TikTok was not connected", "The approval did not complete. Please open the connect link again.", 400);
  }

  try {
    const t = await tiktokToken({
      grant_type: "authorization_code",
      code,
      redirect_uri: `${url.origin}${TT_REDIRECT_PATH}`,
    });
    const user = await tiktokUser(t.access_token!);
    const username = (user.username ?? "").toLowerCase();
    if (username !== ttExpectedUsername()) {
      return page("Wrong account", `This link only connects @${ttExpectedUsername()}. Nothing was saved.`, 403);
    }
    await saveTiktokTokens(t, user.username ?? "");
    const res = page("TikTok connected", `@${user.username} is connected to the Mezcalómano dashboard. You can close this page.`);
    res.cookies.set("mm_tt_state", "", { path: "/api/tiktok", maxAge: 0 });
    return res;
  } catch (err) {
    console.error("[tiktok/callback]", err instanceof Error ? err.message : err);
    return page("Something went wrong", "TikTok could not be connected. Please tell Kimber the time you tried.", 500);
  }
}
