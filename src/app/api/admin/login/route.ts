import { NextResponse } from "next/server";
import { adminConfigured, adminEmail, checkPassword, makeSessionValue, SESSION_COOKIE, SESSION_DAYS } from "@/lib/admin/auth";
import { serviceClient } from "@/lib/metrics/store";

/**
 * Admin login: Turnstile check, then email + password, with a lockout after
 * MAX_FAILS failed attempts in an hour (counted in Supabase admin_login_attempts).
 */

const MAX_FAILS = 10;

async function verifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET?.trim();
  if (!secret) return false;
  const body = new URLSearchParams({ secret, response: token });
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
  const data = (await res.json().catch(() => ({}))) as { success?: boolean };
  return data.success === true;
}

async function recentFails(): Promise<number> {
  const since = new Date(Date.now() - 3600_000).toISOString();
  const { count } = await serviceClient()
    .from("admin_login_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ok", false)
    .gte("at", since);
  return count ?? 0;
}

async function record(ok: boolean) {
  await serviceClient().from("admin_login_attempts").insert({ ok });
}

const fail = (error: string, status = 401) => NextResponse.json({ ok: false, error }, { status });

export async function POST(request: Request) {
  if (!adminConfigured()) return fail("The admin login is not set up yet.", 503);

  const body = (await request.json().catch(() => ({}))) as { email?: string; password?: string; token?: string };
  if (!body.token || !(await verifyTurnstile(body.token))) return fail("Verification failed. Please try again.", 400);

  if ((await recentFails()) >= MAX_FAILS) return fail("Too many attempts. Try again in an hour.", 429);

  const emailOk = (body.email ?? "").trim().toLowerCase() === adminEmail();
  const passwordOk = typeof body.password === "string" && body.password.length > 0 && (await checkPassword(body.password));
  if (!emailOk || !passwordOk) {
    await record(false);
    return fail("Wrong email or password.");
  }

  await record(true);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, makeSessionValue(), {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
  return res;
}
