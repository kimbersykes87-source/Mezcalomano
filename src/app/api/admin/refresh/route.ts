import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/admin/auth";
import { collectLatest } from "@/lib/metrics/run";

/** "Refresh now" button on the dashboard (logged-in only): collects yesterday and today so far. */
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await isLoggedIn())) return NextResponse.json({ ok: false, error: "Please log in again." }, { status: 401 });
  const results = await collectLatest();
  const bad = Object.entries(results).flatMap(([day, r]) =>
    Object.entries(r).filter(([, v]) => !v.startsWith("ok")).map(([k]) => `${k} (${day})`)
  );
  return NextResponse.json({ ok: bad.length === 0, failed: bad });
}
