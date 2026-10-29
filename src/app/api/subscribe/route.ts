import { NextResponse } from "next/server";
import { missingShopifyEnv, subscribeEmail } from "@/lib/shopify-subscribe";

type SubscribeBody = {
  email?: string;
  token?: string;
  source?: string;
};

/** Pages that host the signup form; anything else is saved as the About page. */
const SIGNUP_SOURCES: Record<string, string> = {
  about: "website-about",
  directory: "website-directory",
};

function jsonError(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

function envValue(name: string): string | null {
  const value = process.env[name];
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

async function verifyTurnstile(secret: string, token: string): Promise<boolean> {
  // Do not send remoteip: a mismatched IP behind Vercel proxies makes siteverify fail.
  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = (await res.json().catch(() => null)) as { success?: boolean } | null;
  return data?.success === true;
}

/**
 * Backup copy of every signup in the shared Google Sheet (Mailing_List_Backup), written by
 * a small Apps Script web app owned by hola@. Optional: skipped when the env vars are not
 * set, so previews work before the script is deployed. Returns true if the row was saved.
 */
async function saveBackupRow(email: string, consentedAt: string, source: string): Promise<boolean> {
  const url = envValue("MAILING_LIST_SHEET_URL");
  const secret = envValue("MAILING_LIST_SHEET_TOKEN");
  if (!url || !secret) {
    console.warn("[subscribe] Sheet backup skipped: MAILING_LIST_SHEET_URL or _TOKEN not set");
    return false;
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source, consentedAt, secret }),
      redirect: "follow",
    });
    const json = (await res.json().catch(() => null)) as { ok?: boolean } | null;
    if (res.ok && json?.ok === true) return true;
    console.error("[subscribe] Sheet backup failed:", { status: res.status, body: json });
    return false;
  } catch (err) {
    console.error("[subscribe] Sheet backup error:", err);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const turnstileSecret = envValue("TURNSTILE_SECRET");
    if (!turnstileSecret) {
      console.error("[subscribe] Missing required env var: TURNSTILE_SECRET");
      return jsonError("Server configuration error", 500);
    }
    const missingShopify = missingShopifyEnv();
    if (missingShopify) {
      console.error(`[subscribe] Missing required env var: ${missingShopify}`);
      return jsonError("Server configuration error", 500);
    }

    const data = (await request.json().catch(() => ({}))) as SubscribeBody;
    const token = typeof data.token === "string" ? data.token : "";
    if (!token) {
      return jsonError("Verification failed. Please try again.", 400);
    }
    if (!(await verifyTurnstile(turnstileSecret, token))) {
      return jsonError("Verification failed. Please try again.", 400);
    }

    const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
    if (!email) {
      return jsonError("Email is required", 400);
    }
    if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonError("Please enter a valid email address", 400);
    }

    const consentedAt = new Date().toISOString();
    const source = SIGNUP_SOURCES[typeof data.source === "string" ? data.source : ""] ?? "website-about";

    // Shopify is the list that gets emailed; the sheet is the backup. Run both, succeed if
    // at least one stored the address (the other is logged and can be reconciled later).
    const [shopifyOutcome, backupSaved] = await Promise.all([
      subscribeEmail(email, consentedAt).then(
        () => true,
        (err: unknown) => {
          console.error("[subscribe] Shopify subscribe failed:", err);
          return false;
        }
      ),
      saveBackupRow(email, consentedAt, source),
    ]);

    if (!shopifyOutcome && !backupSaved) {
      return jsonError("Could not save your signup. Please try again.", 500);
    }

    // Same response for new, existing and re-subscribed addresses, so the form cannot be
    // used to find out who is already on the list.
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[subscribe] Unexpected error:", err);
    return jsonError("Internal server error", 500);
  }
}
