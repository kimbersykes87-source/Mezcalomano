import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/admin/auth";
import { SITE_URL } from "@/lib/site-seo";
import { normaliseEmail } from "@/lib/giveaway/agave-card-for-email";
import {
  clearEntrantCodeCache,
  codeForEmail,
  codesEnabled,
  entrantCodeMap,
  previewSignature,
} from "@/lib/giveaway/entrant-code";

/**
 * The reveal codes for the 7 Dec email, logged-in only.
 *
 *   GET /api/admin/giveaway-codes                 CSV of every entrant: email,code,link. This is the mail merge file.
 *   GET /api/admin/giveaway-codes?email=<addr>    JSON for one address, for a rehearsal or to help one person.
 *
 * Codes are recomputed from the address every time rather than stored, so this can be pulled as often as needed and
 * always matches what the page will accept. Pull it AFTER entries close so nobody is missing from the merge.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isLoggedIn())) return NextResponse.json({ ok: false, error: "Please log in again." }, { status: 401 });
  if (!codesEnabled()) {
    return NextResponse.json({ ok: false, error: "GIVEAWAY_CODE_SECRET is not set on this deployment." }, { status: 503 });
  }

  const url = new URL(request.url);
  // The public site, never this request's origin: this endpoint is normally hit on admin.mezcalomano.com, and an
  // origin-derived link would send all 700 entrants to the admin subdomain.
  const base = SITE_URL + "/giveaway";
  const one = normaliseEmail(url.searchParams.get("email") ?? "");

  if (one) {
    const code = codeForEmail(one);
    if (!code) return NextResponse.json({ ok: false, error: "Could not make a code." }, { status: 500 });
    const sig = previewSignature();
    // Drop the 5 minute cache first: during a rehearsal this is pulled seconds after someone has entered, and a stale
    // list would report them as not entered and hand back a link that says the same.
    clearEntrantCodeCache();
    const entered = (await entrantCodeMap()).has(code);
    return NextResponse.json({
      ok: true,
      email: one,
      code,
      entered, // false means this address is not carrying the entrant tag, so the link will say "no entry found"
      link: `${base}?c=${code}`,
      // Same link with the date gate lifted, for walking the real path before 7 Dec. Everyone reads as a non-winner
      // until the winner is tagged, and the page marks the result as a rehearsal.
      rehearsalLink: sig ? `${base}?c=${code}&preview=${sig}` : null,
    });
  }

  const map = await entrantCodeMap();
  const rows = [...map.entries()].map(([code, email]) => `${email},${code},${base}?c=${code}`).sort();
  const csv = ["email,code,link", ...rows].join("\r\n") + "\r\n";
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="giveaway-codes-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
