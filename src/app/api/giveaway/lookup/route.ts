import { NextResponse } from "next/server";
import { lookupGiveaway, testOutcome } from "@/lib/giveaway/lookup";
import { normaliseEmail } from "@/lib/giveaway/agave-card-for-email";

/**
 * POST /api/giveaway/lookup  { email, token }  ->  { ok, result }
 * Turnstile on every request, plus a per-IP limit, so nobody can probe addresses to see who entered.
 * The limit is per server instance (best effort). Test addresses (see lookup.ts) skip both checks so testing can loop
 * on any host: they never reveal anything about a real entrant.
 */
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 8;
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
  let body: { email?: unknown; token?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }
  const email = normaliseEmail(typeof body.email === "string" ? body.email : "");
  const token = typeof body.token === "string" ? body.token : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ ok: false, error: "Please enter the email address you entered with." }, { status: 400 });
  }
  const isTest = testOutcome(email) !== null;
  if (!isTest && (!token || !(await verifyTurnstile(token)))) {
    return NextResponse.json({ ok: false, error: "Verification failed. Please try again." }, { status: 400 });
  }
  const ip = (request.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (!isTest && limited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many tries. Please wait a few minutes." }, { status: 429 });
  }
  try {
    const result = await lookupGiveaway(email);
    return NextResponse.json({ ok: true, result }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    console.error("[giveaway] lookup failed:", e);
    return NextResponse.json({ ok: false, error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
