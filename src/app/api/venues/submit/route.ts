import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

/**
 * POST /api/venues/submit (venues map layer, plan v2 sections 7 and 12).
 *
 * Turnstile check, rate limits, one Nominatim lookup, a row in venue_submissions
 * (verification_state unverified, consent_at set), then a notice to hola@ through
 * the existing Apps Script mailer. Two rules from the plan:
 *   - A matching email domain is NOT verification. Nothing here marks a submitter
 *     as the owner. Verification is a human reply handled from hola@.
 *   - No email is sent to the submitter. The notice goes to hola@ only.
 */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_USER_AGENT = "MezcalomanoBot (hola@mezcalomano.com)";

const MAX_PER_IP_PER_HOUR = 5;
const MAX_PER_EMAIL_PER_DAY = 3;

type SubmitBody = {
  name?: string;
  address?: string;
  website?: string;
  email?: string;
  message?: string;
  consent?: boolean;
  company?: string; // honeypot: real people leave it empty
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

async function verifyTurnstile(secret: string, token: string): Promise<{ ok: boolean; errorCodes: string[] }> {
  // No remoteip: a mismatched IP behind Vercel proxies makes siteverify fail (same as /api/contact).
  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = (await res.json()) as { success?: boolean; "error-codes"?: string[] };
  return { ok: data.success === true, errorCodes: Array.isArray(data["error-codes"]) ? data["error-codes"] : [] };
}

/** Salted hash so the table never stores a raw IP address. */
function hashIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for") || "";
  const ip = forwarded.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "";
  if (!ip) return null;
  const salt = envValue("VENUES_IP_SALT") || envValue("TURNSTILE_SECRET") || "";
  return createHash("sha256").update(`${salt}|${ip}`).digest("hex");
}

function cleanUrl(raw: string): string | null {
  if (!raw) return "";
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const u = new URL(withScheme);
    if (!["http:", "https:"].includes(u.protocol) || !u.hostname.includes(".")) return null;
    return u.toString();
  } catch {
    return null;
  }
}

async function geocodeOnce(address: string): Promise<{ lat: number; lng: number; note: string } | { lat: null; lng: null; note: string }> {
  try {
    const url = `${NOMINATIM_URL}?format=jsonv2&limit=1&q=${encodeURIComponent(address)}`;
    const res = await fetch(url, {
      headers: { "User-Agent": NOMINATIM_USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return { lat: null, lng: null, note: `nominatim_http_${res.status}` };
    const rows = (await res.json()) as Array<{ lat?: string; lon?: string; display_name?: string }>;
    const first = rows[0];
    const lat = first?.lat ? Number(first.lat) : NaN;
    const lng = first?.lon ? Number(first.lon) : NaN;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return { lat: null, lng: null, note: "nominatim_no_result" };
    return { lat, lng, note: "nominatim_ok" };
  } catch {
    return { lat: null, lng: null, note: "nominatim_error" };
  }
}

export async function POST(request: Request) {
  try {
    const missing = missingServerEnv();
    if (missing) {
      console.error(`[venues/submit] Missing required env var: ${missing}`);
      return jsonError(`Server configuration error: missing ${missing}`, 500);
    }
    const turnstileSecret = envValue("TURNSTILE_SECRET")!;
    const appsScriptUrl = envValue("APPS_SCRIPT_URL")!;
    const appsScriptToken = envValue("APPS_SCRIPT_TOKEN")!;
    const supabaseUrl = (envValue("SUPABASE_URL") || envValue("NEXT_PUBLIC_SUPABASE_URL"))!;
    const serviceKey = envValue("SUPABASE_SERVICE_ROLE_KEY")!;

    const data = (await request.json()) as SubmitBody;

    // Honeypot: pretend success so bots learn nothing.
    if (typeof data.company === "string" && data.company.trim() !== "") {
      return NextResponse.json({ ok: true });
    }

    const token = typeof data.token === "string" ? data.token : "";
    if (!token) return jsonError("Verification failed. Please try again.", 400);

    const turnstile = await verifyTurnstile(turnstileSecret, token);
    if (!turnstile.ok) {
      console.error("[venues/submit] Turnstile siteverify failed:", turnstile.errorCodes);
      if (turnstile.errorCodes.includes("timeout-or-duplicate")) {
        return jsonError("Verification expired. Please complete the check again.", 400);
      }
      return jsonError("Verification failed. Please try again.", 400);
    }

    const name = typeof data.name === "string" ? data.name.trim() : "";
    const address = typeof data.address === "string" ? data.address.trim() : "";
    const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
    const message = typeof data.message === "string" ? data.message.trim() : "";
    const websiteRaw = typeof data.website === "string" ? data.website.trim() : "";

    if (!name || !address || !email) return jsonError("Bar name, address and email are required", 400);
    if (data.consent !== true) return jsonError("Please tick the consent box so we can contact you", 400);
    if (name.length > 200 || address.length > 300 || email.length > 200 || message.length > 3000 || websiteRaw.length > 300) {
      return jsonError("One or more fields are too long", 400);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonError("Invalid email address", 400);
    const website = cleanUrl(websiteRaw);
    if (website === null) return jsonError("That website address does not look right", 400);

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Rate limits, counted from the table itself (no extra service needed).
    const ipHash = hashIp(request);
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    if (ipHash) {
      const { count } = await supabase
        .from("venue_submissions")
        .select("id", { count: "exact", head: true })
        .eq("ip_hash", ipHash)
        .gte("created_at", hourAgo);
      if ((count ?? 0) >= MAX_PER_IP_PER_HOUR) {
        return jsonError("Too many submissions from your connection. Please try again later.", 429);
      }
    }
    const { count: emailCount } = await supabase
      .from("venue_submissions")
      .select("id", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", dayAgo);
    if ((emailCount ?? 0) >= MAX_PER_EMAIL_PER_DAY) {
      return jsonError("Too many submissions from this email today. Please try again tomorrow.", 429);
    }

    const geo = await geocodeOnce(address);

    const { data: row, error: insertError } = await supabase
      .from("venue_submissions")
      .insert({
        name,
        address,
        website: website || null,
        email,
        message: message || null,
        lat: geo.lat,
        lng: geo.lng,
        geocode_note: geo.note,
        verification_state: "unverified",
        consent_at: new Date().toISOString(),
        ip_hash: ipHash,
      })
      .select("id")
      .single();

    if (insertError || !row?.id) {
      console.error("[venues/submit] Supabase insert failed:", insertError);
      return jsonError("Could not save your submission. Please try again.", 500);
    }

    // Notify hola@ only. Reply-to is the submitter, so the human reply from hola@ is the verification step.
    try {
      const mailRes = await fetch(appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `Venue submission: ${name}`,
          email,
          message: [
            "VERIFICATION STATE: unverified (an email domain match is not verification).",
            "To verify, reply from hola@ and ask the sender to answer from the venue's own mailbox.",
            "",
            `Bar: ${name}`,
            `Address: ${address}`,
            `Website: ${website || "(none given)"}`,
            `Geocode: ${geo.note}${geo.lat !== null ? ` (${geo.lat}, ${geo.lng})` : ""}`,
            `Submission id: ${row.id}`,
            "",
            message || "(no message)",
          ].join("\n"),
          secret: appsScriptToken,
        }),
        redirect: "follow",
      });
      if (!mailRes.ok) console.error("[venues/submit] Apps Script mailer failed:", mailRes.status);
    } catch (err) {
      console.error("[venues/submit] Apps Script mailer error:", err);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[venues/submit] Unexpected error:", err);
    return jsonError("Internal server error", 500);
  }
}
