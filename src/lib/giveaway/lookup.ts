/**
 * Giveaway result lookup (server only). Returns ONLY the asking address's own result.
 *
 * Env:
 *   GIVEAWAY_TEST_EMAILS  optional, e.g. "a@example.com:win,b@example.com:lose". These addresses always get that result,
 *                         at any date, without touching Shopify, so testing never adds anyone to the real draw.
 *                         When it is not set, BUILT_IN_TESTS applies (SHA-256 of the address, so no address sits in this
 *                         public repo). Set GIVEAWAY_TEST_EMAILS to "off" to switch all testing off before 2026-12-07.
 *   GIVEAWAY_RESULTS_AT   optional ISO time, defaults to DEFAULT_RESULTS_AT. Before it, real addresses get "not-yet".
 * Real path (after GIVEAWAY_RESULTS_AT): the Shopify customer with that email; entered = tag ENTRANT_TAG,
 * won = tag WINNER_TAG (Siona adds it to the winner after the draw).
 */
import { after } from "next/server";
import { createHash } from "node:crypto";
import { shopifyAdminQuery } from "@/lib/shopify-subscribe";
import { agaveCardForEmail, normaliseEmail } from "./agave-card-for-email";
import { CHECKED_TAG, DEFAULT_RESULTS_AT, ENTRANT_TAG, WINNER_TAG, type LookupResult } from "./config";

/** Kimber's test pair (2026-11-11): Siona's address wins, Kimber's does not. Hash of the trimmed lowercased email. */
const BUILT_IN_TESTS: Record<string, boolean> = {
  "1146a00eb331814d4744e807801768856f568aa2998b3b16af7ca7025d7b7adf": true,
  "90cd33ac5b1b2a6ad249d380021bcca8600b5b641b854d613ae10d90eee52fab": false,
};

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/** true = test win, false = test no win, null = not a test address. */
export function testOutcome(rawEmail: string): boolean | null {
  const email = normaliseEmail(rawEmail);
  const env = (process.env.GIVEAWAY_TEST_EMAILS ?? "").trim();
  if (env.toLowerCase() === "off") return null;
  if (env) {
    for (const part of env.split(",")) {
      const [e, outcome] = part.split(":").map((x) => (x ?? "").trim().toLowerCase());
      if (e === email && (outcome === "win" || outcome === "lose")) return outcome === "win";
    }
    return null;
  }
  const hit = BUILT_IN_TESTS[sha256(email)];
  return hit === undefined ? null : hit;
}

export function resultsOpen(now = new Date()): boolean {
  const at = Date.parse(process.env.GIVEAWAY_RESULTS_AT || DEFAULT_RESULTS_AT);
  return Number.isFinite(at) && now.getTime() >= at;
}

type CustomerTags = { customers: { nodes: { id: string; tags: string[] }[] } };

/**
 * Mark that this entrant has seen their result, so Siona can nudge the ones who have not looked and can tell whether
 * the winner knows. Runs after the response is sent, and a failure here must never affect what the visitor was told.
 */
function markChecked(customerId: string): void {
  try {
    after(async () => {
      try {
        await shopifyAdminQuery(
          `mutation GiveawayChecked($id: ID!, $tags: [String!]!) { tagsAdd(id: $id, tags: $tags) { userErrors { message } } }`,
          { id: customerId, tags: [CHECKED_TAG] }
        );
      } catch (e) {
        console.error("[giveaway] could not tag " + CHECKED_TAG + ":", e);
      }
    });
  } catch {
    /* outside a request scope (tests, scripts): skip it */
  }
}

export async function lookupGiveaway(rawEmail: string): Promise<LookupResult> {
  const email = normaliseEmail(rawEmail);
  const card = agaveCardForEmail(email);
  if (!card) return { status: "not-entered" };

  const test = testOutcome(email);
  if (test !== null) {
    return { status: "result", won: test, slug: card.slug, name: card.name, test: true };
  }
  if (!resultsOpen()) return { status: "not-yet" };

  const data = await shopifyAdminQuery<CustomerTags>(
    `query GiveawayCustomer($q: String!) { customers(first: 1, query: $q) { nodes { id tags } } }`,
    { q: `email:"${email.replace(/"/g, "")}"` }
  );
  const node = data.customers?.nodes?.[0];
  const tags = (node?.tags ?? []).map((t) => t.toLowerCase());
  if (!tags.includes(ENTRANT_TAG)) return { status: "not-entered" };
  if (node?.id && !tags.includes(CHECKED_TAG)) markChecked(node.id);
  return { status: "result", won: tags.includes(WINNER_TAG), slug: card.slug, name: card.name, test: false };
}
