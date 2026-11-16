import { NextResponse } from "next/server";
import { lookupGiveawayByCode } from "@/lib/giveaway/lookup";
import { CODE_LENGTH, normaliseCode, previewValid } from "@/lib/giveaway/entrant-code";

/**
 * POST /api/giveaway/lookup  { code, token }  ->  { ok, result }
 * A code comes off the 7 Dec link and can only open its own result. There is deliberately NO address path. A box that
 * accepts any address undoes the codes completely: anyone could type an entrant's address and read whether they won,
 * and the lookup would tag that entrant `giveaway-checked`, dropping them from the "has not looked" reminder on 9 Dec.
 * The real winner could be looked up by a stranger, never nudged, and forfeit on the 10th.
 * Anyone whose link fails emails hola@ and Siona looks them up, which the run sheet already names as the fallback.
 * Turnstile on every request, plus a per-IP limit (per server instance, best effort).
 */
const WINDOW_MS = 10 * 60_000;
// Generous on purpose: offices, universities and mobile carriers put many people behind one IP, and locking a real
// entrant out of their own result is worse than anything this prevents. Turnstile is the actual control.
const MAX_PER_WINDOW = 30;
const hits = new Map<string, number[]>();

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET?.trim();
  if (!secret) return false;
  const body = new URLSearchParams({ secret, response: token });
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
  if (!data.success) console.error("[giveaway] Turnstile failed:", data["error-codes"]);
  return data.success === true;
}

export async function POST(request: Request) {
  let body: { token?: unknown; code?: unknown; preview?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }
  const code = typeof body.code === "string" ? normaliseCode(body.code) : "";
  // Signed rehearsal flag: lifts the 7 Dec date gate only, and only for someone holding a signature we issued.
  const preview = typeof body.preview === "string" && previewValid(body.preview);
  const token = typeof body.token === "string" ? body.token : "";
  if (code.length !== CODE_LENGTH) {
    return NextResponse.json({ ok: false, error: "Open the link from your email to see your result." }, { status: 400 });
  }
  if (!token || !(await verifyTurnstile(token))) {
    return NextResponse.json({ ok: false, error: "Verification failed. Please try again." }, { status: 400 });
  }
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (limited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many tries. Please wait a few minutes." }, { status: 429 });
  }
  try {
    const result = await lookupGiveawayByCode(code, preview);
    return NextResponse.json({ ok: true, result }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[giveaway] lookup failed:", e);
    return NextResponse.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
