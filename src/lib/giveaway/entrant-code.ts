/**
 * Per-entrant reveal codes (server only).
 *
 * The 7 Dec email links each entrant to /giveaway?c=<their code>, so nobody types an address and a link can only ever
 * open its own result. The code is an HMAC of the entrant's address under GIVEAWAY_CODE_SECRET, which buys three things:
 *   - it cannot be guessed or forged, so editing the URL cannot surface somebody else's result;
 *   - the address is not in the link, so it stays out of browser history, referrers and the sending tool;
 *   - nothing is stored, so a code can be recomputed whenever it is needed and the export script and this page agree
 *     by construction rather than by keeping a table in step.
 *
 * Turning a code back into an entrant means scanning the entrant list: one short paginated read of the customers
 * carrying ENTRANT_TAG, cached for a few minutes. At a few hundred entrants that costs less than writing a code onto
 * every customer, and it sidesteps the lag in Shopify's tag search index.
 *
 * Env: GIVEAWAY_CODE_SECRET, 32 or more random characters, the same value here and wherever the export script runs.
 * Without it codes are off and the page falls back to asking for the address.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { shopifyAdminQuery } from "@/lib/shopify-subscribe";
import { normaliseEmail } from "./agave-card-for-email";
import { ENTRANT_TAG } from "./config";

/**
 * Hex, 16 characters, 64 bits. The format is dictated by Shopify Email, which renders the 7 Dec campaign and can
 * compute this itself from the recipient's address:
 *
 *   {{ customer.email | downcase | hmac_sha256: "<GIVEAWAY_CODE_SECRET>" | slice: 0, 16 }}
 *
 * Liquid has hmac_sha256 (lower case hex), downcase and slice, but no base32 and no access to customer metafields,
 * verified in the campaign editor on 2026-11-15. Keeping both sides on plain truncated hex means the email computes
 * each recipient's own code as it sends: nothing is stored, no merge file, no manual step on the day. Changing this
 * encoding, this length, or normaliseEmail silently breaks every link in a saved campaign template.
 */
export const CODE_LENGTH = 16;

const secret = (): string => (process.env.GIVEAWAY_CODE_SECRET ?? "").trim();

/** False when no secret is configured: the page then asks for the address instead, rather than issuing weak codes. */
export const codesEnabled = (): boolean => secret().length >= 16;

/** Tolerates however the code arrives: pasted with spaces, upper case, or wrapped in punctuation by a mail client. */
export const normaliseCode = (raw: string): string => raw.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

export function codeForEmail(rawEmail: string): string | null {
  const s = secret();
  if (!s) return null;
  // Must stay byte for byte identical to the Liquid above: lower case address, HMAC-SHA256, lower case hex, first 16.
  return createHmac("sha256", s).update(normaliseEmail(rawEmail)).digest("hex").slice(0, CODE_LENGTH);
}

/**
 * Opens results before GIVEAWAY_RESULTS_AT for a rehearsal against the real entrant list. Derived from the same secret,
 * so it cannot be forged and it dies when the secret is rotated. It does NOT fake a result: it only lifts the date
 * gate, so before the draw is tagged every entrant reads as a non-winner, which is the point of the gate in the first
 * place. Anything seen through it is provisional and the page says so.
 */
export function previewSignature(): string | null {
  const s = secret();
  return s ? createHmac("sha256", s).update("preview-results").digest("hex").slice(0, 16) : null;
}

export function previewValid(raw: string): boolean {
  const want = previewSignature();
  const got = (raw ?? "").trim().toLowerCase();
  if (!want || got.length !== want.length) return false;
  return timingSafeEqual(Buffer.from(want), Buffer.from(got));
}

type EntrantNode = { email?: string | null; defaultEmailAddress?: { emailAddress: string | null } | null };
type EntrantsPage = {
  customers: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: EntrantNode[] };
};

/**
 * `Customer.email` is deprecated in favour of `defaultEmailAddress.emailAddress`, and the two live in different
 * Admin API versions. Ask for the modern one, fall back to the old one once, and remember which answered. Without
 * this, bumping SHOPIFY_API_VERSION would quietly return entrants with no address: every code would stop resolving
 * and every link on 7 Dec would read "that link doesn't match an entry" with nothing in the logs to explain it.
 */
const EMAIL_FIELDS = ["defaultEmailAddress { emailAddress }", "email"];
let emailField: string | null = null;

const entrantsQuery = (field: string) => `query GiveawayEntrants($q: String!, $after: String) {
  customers(first: 100, query: $q, after: $after) {
    pageInfo { hasNextPage endCursor }
    nodes { ${field} }
  }
}`;

const nodeEmail = (n: EntrantNode): string | null => n.defaultEmailAddress?.emailAddress ?? n.email ?? null;

async function fetchEntrants(q: string, after: string | null): Promise<EntrantsPage> {
  if (emailField) return shopifyAdminQuery<EntrantsPage>(entrantsQuery(emailField), { q, after });
  let lastError: unknown;
  for (const field of EMAIL_FIELDS) {
    try {
      const data = await shopifyAdminQuery<EntrantsPage>(entrantsQuery(field), { q, after });
      emailField = field;
      return data;
    } catch (e) {
      lastError = e;
      console.warn(`[giveaway] customer email field "${field}" was rejected, trying the next one`);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("No usable customer email field on this API version.");
}

const CACHE_MS = 5 * 60_000;
let cache: { at: number; byCode: Map<string, string> } | null = null;

/** code -> address, for every customer currently carrying the entrant tag. */
export async function entrantCodeMap(): Promise<Map<string, string>> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.byCode;
  const byCode = new Map<string, string>();
  let after: string | null = null;
  for (let page = 0; page < 200; page++) {
    const data = await fetchEntrants(`tag:'${ENTRANT_TAG}'`, after);
    for (const n of data.customers?.nodes ?? []) {
      const address = nodeEmail(n);
      if (!address) continue;
      const code = codeForEmail(address);
      if (code) byCode.set(code, normaliseEmail(address));
    }
    if (!data.customers?.pageInfo?.hasNextPage) break;
    after = data.customers.pageInfo.endCursor;
  }
  cache = { at: Date.now(), byCode };
  return byCode;
}

export async function emailForCode(rawCode: string): Promise<string | null> {
  const code = normaliseCode(rawCode);
  if (!codesEnabled() || code.length !== CODE_LENGTH) return null;
  return (await entrantCodeMap()).get(code) ?? null;
}

/** Used by the tests and by anything that has just changed the entrant list. */
export function clearEntrantCodeCache(): void {
  cache = null;
}
