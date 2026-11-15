import { NextResponse } from "next/server";
import { lookupGiveaway, lookupGiveawayByCode, testOutcome } from "@/lib/giveaway/lookup";
import { normaliseEmail } from "@/lib/giveaway/agave-card-for-email";
import { normaliseCode, previewValid } from "@/lib/giveaway/entrant-code";

/**
 * POST /api/giveaway/lookup  { code, token } or { email, token }  ->  { ok, result }
 * A code comes off the 7 Dec link and can only open its own result; the address is the fallback for anyone who has
 * lost the link.
 * Turnstile on every request, plus a per-IP limit, so nobody can probe addresses to see who entered.
 * The limit is per server instance (best effort). Test addresses (see lookup.ts) skip both checks so testing can loop
 * on any host: they never reveal anything about a real entrant.
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
  let body: { email?: unknown; token?: unknown; code?: unknown; preview?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }
  const code = typeof body.code === "string" ? normaliseCode(body.code) : "";
  // Signed rehearsal flag: lifts the 7 Dec date gate only, and only for someone holding a signature we issued.
  const preview = typeof body.preview === "string" && previewValid(body.preview);
  const email = normaliseEmail(typeof body.email === "string" ? body.email : "");
  const token = typeof body.token === "string" ? body.token : "";
  if (!code && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)) {
    return NextResponse.json({ ok: false, error: "Please enter the email address you entered with." }, { status: 400 });
  }
  // A code is always the real path, test addresses included, so a link behaves on the day exactly as it does now.
  const isTest = !code && testOutcome(email) !== null;
  if (!isTest && (!token || !(await verifyTurnstile(token)))) {
    return NextResponse.json({ ok: false, error: "Verification failed. Please try again." }, { status: 400 });
  }
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (!isTest && limited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many tries. Please wait a few minutes." }, { status: 429 });
  }
  try {
    const result = code ? await lookupGiveawayByCode(code, preview) : await lookupGiveaway(email, preview);
    return NextResponse.json({ ok: true, result }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[giveaway] lookup failed:", e);
    return NextResponse.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
