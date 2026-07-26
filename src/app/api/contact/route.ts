import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type ContactBody = {
  name?: string;
  email?: string;
  message?: string;
  token?: string;
};

function jsonError(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

function envValue(name: string): string | null {
  const value = process.env[name];
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

/** Returns the name of the first missing required server env var, or null if all present. */
function missingServerEnv(): string | null {
  if (!envValue("TURNSTILE_SECRET")) return "TURNSTILE_SECRET";
  if (!envValue("APPS_SCRIPT_URL")) return "APPS_SCRIPT_URL";
  if (!envValue("APPS_SCRIPT_TOKEN")) return "APPS_SCRIPT_TOKEN";
  if (!envValue("SUPABASE_SERVICE_ROLE_KEY")) return "SUPABASE_SERVICE_ROLE_KEY";
  if (!envValue("SUPABASE_URL") && !envValue("NEXT_PUBLIC_SUPABASE_URL")) {
    return "SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)";
  }
  return null;
}

type TurnstileVerifyResult = {
  ok: boolean;
  errorCodes: string[];
};

async function verifyTurnstile(secret: string, token: string): Promise<TurnstileVerifyResult> {
  // Do not send remoteip: a mismatched IP (common behind Vercel proxies) makes
  // siteverify fail even when the widget showed Success.
  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
  const errorCodes = Array.isArray(data["error-codes"]) ? data["error-codes"] : [];
  return { ok: data.success === true, errorCodes };
}

export async function POST(request: Request) {
  try {
    const missing = missingServerEnv();
    if (missing) {
      console.error(`[contact] Missing required env var: ${missing}`);
      return jsonError(`Server configuration error: missing ${missing}`, 500);
    }

    const turnstileSecret = envValue("TURNSTILE_SECRET")!;
    const appsScriptUrl = envValue("APPS_SCRIPT_URL")!;
    const appsScriptToken = envValue("APPS_SCRIPT_TOKEN")!;
    const supabaseUrl = (envValue("SUPABASE_URL") || envValue("NEXT_PUBLIC_SUPABASE_URL"))!;
    const supabaseServiceRoleKey = envValue("SUPABASE_SERVICE_ROLE_KEY")!;

    const data = (await request.json()) as ContactBody;
    const token = typeof data.token === "string" ? data.token : "";

    if (!token) {
      return jsonError("Verification failed. Please try again.", 400);
    }

    const turnstile = await verifyTurnstile(turnstileSecret, token);
    if (!turnstile.ok) {
      console.error("[contact] Turnstile siteverify failed:", turnstile.errorCodes);
      if (turnstile.errorCodes.includes("invalid-input-secret")) {
        return jsonError(
          "Verification failed: TURNSTILE_SECRET does not match the site key. Check Vercel env vars.",
          400
        );
      }
      if (turnstile.errorCodes.includes("timeout-or-duplicate")) {
        return jsonError("Verification expired. Please complete the check again.", 400);
      }
      return jsonError("Verification failed. Please try again.", 400);
    }

    const name = typeof data.name === "string" ? data.name.trim() : "";
    const email = typeof data.email === "string" ? data.email.trim() : "";
    const message = typeof data.message === "string" ? data.message.trim() : "";

    if (!name || !email || !message) {
      return jsonError("All fields are required", 400);
    }
    if (name.length > 200 || email.length > 200 || message.length > 5000) {
      return jsonError("One or more fields are too long", 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonError("Invalid email address", 400);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: row, error: insertError } = await supabase
      .from("contacts")
      .insert({ name, email, message, emailed: false })
      .select("id")
      .single();

    if (insertError || !row?.id) {
      console.error("[contact] Supabase insert failed:", insertError);
      return jsonError("Could not save your message. Please try again.", 500);
    }

    try {
      const mailRes = await fetch(appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          secret: appsScriptToken,
        }),
        redirect: "follow",
      });
      const mailJson = (await mailRes.json().catch(() => null)) as { ok?: boolean } | null;

      if (mailRes.ok && mailJson?.ok === true) {
        const { error: updateError } = await supabase
          .from("contacts")
          .update({ emailed: true })
          .eq("id", row.id);
        if (updateError) {
          console.error("[contact] Failed to mark emailed=true:", updateError);
        }
      } else {
        console.error("[contact] Apps Script mailer failed:", {
          status: mailRes.status,
          body: mailJson,
        });
      }
    } catch (err) {
      console.error("[contact] Apps Script mailer error:", err);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return jsonError("Internal server error", 500);
  }
}
