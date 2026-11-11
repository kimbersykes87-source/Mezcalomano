/**
 * Giveaway result lookup (server only). Returns ONLY the asking address's own result.
 *
 * Env:
 *   GIVEAWAY_TEST_EMAILS  optional, e.g. "a@example.com:win,b@example.com:lose". These addresses always get that result,
 *                         at any date, without touching Shopify, so testing never adds anyone to the real draw.
 *   GIVEAWAY_RESULTS_AT   optional ISO time, defaults to DEFAULT_RESULTS_AT. Before it, real addresses get "not-yet".
 * Real path (after GIVEAWAY_RESULTS_AT): the Shopify customer with that email; entered = tag ENTRANT_TAG,
 * won = tag WINNER_TAG (Siona adds it to the winner after the draw).
 */
import { shopifyAdminQuery } from "@/lib/shopify-subscribe";
import { agaveCardForEmail, normaliseEmail } from "./agave-card-for-email";
import { DEFAULT_RESULTS_AT, ENTRANT_TAG, WINNER_TAG, type LookupResult } from "./config";

function testList(): Map<string, boolean> {
  const out = new Map<string, boolean>();
  for (const part of (process.env.GIVEAWAY_TEST_EMAILS ?? "").split(",")) {
    const [email, outcome] = part.split(":").map((s) => (s ?? "").trim().toLowerCase());
    if (email && (outcome === "win" || outcome === "lose")) out.set(email, outcome === "win");
  }
  return out;
}

export function resultsOpen(now = new Date()): boolean {
  const at = Date.parse(process.env.GIVEAWAY_RESULTS_AT || DEFAULT_RESULTS_AT);
  return Number.isFinite(at) && now.getTime() >= at;
}

type CustomerTags = { customers: { nodes: { tags: string[] }[] } };

export async function lookupGiveaway(rawEmail: string): Promise<LookupResult> {
  const email = normaliseEmail(rawEmail);
  const card = agaveCardForEmail(email);
  if (!card) return { status: "not-entered" };

  const tests = testList();
  if (tests.has(email)) {
    return { status: "result", won: tests.get(email)!, slug: card.slug, name: card.name, test: true };
  }
  if (!resultsOpen()) return { status: "not-yet" };

  const data = await shopifyAdminQuery<CustomerTags>(
    `query GiveawayCustomer($q: String!) { customers(first: 1, query: $q) { nodes { tags } } }`,
    { q: `email:"${email.replace(/"/g, "")}"` }
  );
  const tags = (data.customers?.nodes?.[0]?.tags ?? []).map((t) => t.toLowerCase());
  if (!tags.includes(ENTRANT_TAG)) return { status: "not-entered" };
  return { status: "result", won: tags.includes(WINNER_TAG), slug: card.slug, name: card.name, test: false };
}
