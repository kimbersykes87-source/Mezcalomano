import { createSign } from "node:crypto";
import type { MetricRow } from "./store";
import { EXCLUDE_UNTIL, EXCLUDED_COUNTRY_CODE } from "./exclude";

/**
 * NOT in the nightly run (removed Nov 2026: no service account key could be created, and the dashboard
 * does not read GA4 yet). To switch it back on, add `web_ga4: (d, _s, e) => collectGa4(d, e)` to COLLECTORS and
 * "web_ga4" to TODAY_SOURCES in run.ts.
 *
 * Page views, sessions and visitors from Google Analytics 4 (Data API).
 * Needs two env vars in Vercel:
 *   GA4_SERVICE_ACCOUNT_JSON  the service account key (the whole JSON file)
 *   GA4_PROPERTY_ID           the numeric property ID (not the G-XXXX measurement ID)
 * The service account's email must be a Viewer on the GA4 property.
 */

type Key = { client_email: string; private_key: string };

function readKey(): Key {
  const raw = process.env.GA4_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) throw new Error("GA4_SERVICE_ACCOUNT_JSON is not set");
  try {
    const key = JSON.parse(raw) as Key;
    if (!key.client_email || !key.private_key) throw new Error("missing fields");
    return { client_email: key.client_email, private_key: key.private_key.replace(/\\n/g, "\n") };
  } catch {
    throw new Error("GA4_SERVICE_ACCOUNT_JSON is not valid service account JSON");
  }
}

const b64 = (v: object | Buffer) =>
  (Buffer.isBuffer(v) ? v : Buffer.from(JSON.stringify(v))).toString("base64url");

async function accessToken(key: Key): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: key.client_email,
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(key.private_key);
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${b64(signature)}`,
    }),
  });
  if (!res.ok) throw new Error(`Google sign-in for GA4 returned HTTP ${res.status}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

type Report = { rows?: { dimensionValues?: { value: string }[]; metricValues: { value: string }[] }[] };

/** One London day. GA4 takes calendar dates, so the day string is used directly. */
export async function collectGa4(day: string, end: Date): Promise<MetricRow[]> {
  const property = process.env.GA4_PROPERTY_ID?.trim();
  if (!property) throw new Error("GA4_PROPERTY_ID is not set");
  const token = await accessToken(readKey());

  const excludeMorocco = end.getTime() <= EXCLUDE_UNTIL.getTime();
  const dimensionFilter = excludeMorocco
    ? {
        notExpression: {
          filter: { fieldName: "countryId", stringFilter: { matchType: "EXACT", value: EXCLUDED_COUNTRY_CODE } },
        },
      }
    : undefined;

  async function run(dimension: string | null, limit: number): Promise<Report> {
    const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(property!)}:runReport`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        dateRanges: [{ startDate: day, endDate: day }],
        metrics: [{ name: "screenPageViews" }, { name: "sessions" }, { name: "activeUsers" }],
        ...(dimension ? { dimensions: [{ name: dimension }] } : {}),
        ...(dimensionFilter ? { dimensionFilter } : {}),
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit,
      }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      throw new Error(`GA4 returned HTTP ${res.status}${body?.error?.message ? `: ${body.error.message}` : ""}`);
    }
    return (await res.json()) as Report;
  }

  const [total, paths, countries] = await Promise.all([run(null, 1), run("pagePath", 50), run("country", 30)]);
  const t = total.rows?.[0]?.metricValues ?? [];
  const rows: MetricRow[] = [
    { metric: "page_views", value: Number(t[0]?.value ?? 0) },
    { metric: "visits", value: Number(t[1]?.value ?? 0) },
    { metric: "visitors", value: Number(t[2]?.value ?? 0) },
  ];
  for (const r of paths.rows ?? []) {
    const path = r.dimensionValues?.[0]?.value || "/";
    rows.push({ metric: "page_views_by_path", dimension: path, value: Number(r.metricValues[0]?.value ?? 0) });
  }
  for (const r of countries.rows ?? []) {
    rows.push({ metric: "visits_by_country", dimension: r.dimensionValues?.[0]?.value || "(unknown)", value: Number(r.metricValues[1]?.value ?? 0) });
  }
  return rows;
}
