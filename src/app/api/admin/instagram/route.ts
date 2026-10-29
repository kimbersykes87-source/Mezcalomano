import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/admin/auth";
import { saveInstagramEntry, validateEntry } from "@/lib/admin/instagram-manual";

/** Saves the hand-entered weekly Instagram figures (logged-in only). */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isLoggedIn())) return NextResponse.json({ ok: false, error: "Please log in again." }, { status: 401 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const checked = validateEntry(body ?? {});
  if (!checked.ok) return NextResponse.json({ ok: false, error: checked.error }, { status: 400 });
  try {
    await saveInstagramEntry(checked.entry, String(body?.by ?? "").slice(0, 40) || "unknown");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err instanceof Error ? err.message : "Could not save." }, { status: 500 });
  }
}
