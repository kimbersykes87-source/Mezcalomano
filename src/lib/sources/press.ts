import { shopifyAdminQuery } from "@/lib/shopify-subscribe";
import { TEST_DISCOUNT_CODES } from "@/lib/metrics/exclude";
import { pressDb } from "@/lib/press-links";
import { section, type Section } from "./cache";

/**
 * Press and creator tracked links (mezcalomano.com/r/<slug>) for the
 * Acquisition / Press page: clicks from Supabase, orders from Shopify matched
 * on the slug carried in the UTMs (last visit first, then first visit).
 */

export type PressRow = {
  slug: string;
  promoId: string | null;
  name: string | null;
  outlet: string | null;
  createdAt: string;
  clicks: number;
  clicks7: number;
  bots: number;
  lastClick: string | null;
  orders: number;
  netSales: number;
};

export type PressData = { rows: PressRow[]; orders: Section<{ matched: number; checked: number }> };

type OrdersPage = {
  orders: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: {
      test: boolean;
      tags: string[];
      cancelledAt: string | null;
      discountCodes: string[];
      subtotalPriceSet: { shopMoney: { amount: string } };
      totalRefundedSet: { shopMoney: { amount: string } };
      customerJourneySummary: {
        firstVisit: { utmParameters: { source: string | null; content: string | null } | null } | null;
        lastVisit: { utmParameters: { source: string | null; content: string | null } | null } | null;
      } | null;
    }[];
  };
};

const ORDERS = /* GraphQL */ `
  query PressOrders($q: String!, $after: String) {
    orders(first: 100, after: $after, query: $q) {
      pageInfo { hasNextPage endCursor }
      nodes {
        test tags cancelledAt discountCodes
        subtotalPriceSet { shopMoney { amount } }
        totalRefundedSet { shopMoney { amount } }
        customerJourneySummary {
          firstVisit { utmParameters { source content } }
          lastVisit { utmParameters { source content } }
        }
      }
    }
  }
`;

const num = (v: string | undefined) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};

async function ordersBySlug(slugs: Set<string>, since: string) {
  const testCodes = new Set(TEST_DISCOUNT_CODES.map((c) => c.toUpperCase()));
  const found = new Map<string, { orders: number; netSales: number }>();
  let checked = 0;
  let after: string | null = null;
  for (let page = 0; page < 30; page++) {
    const data: OrdersPage = await shopifyAdminQuery<OrdersPage>(ORDERS, { q: `created_at:>='${since}'`, after });
    for (const o of data.orders.nodes) {
      if (o.test || o.tags.some((t) => t.toLowerCase() === "test") || o.cancelledAt) continue;
      if (o.discountCodes.some((c) => testCodes.has(c.toUpperCase()))) continue;
      checked++;
      const pick = (u: { source: string | null; content: string | null } | null | undefined) => {
        const c = u?.content?.toLowerCase();
        if (c && slugs.has(c)) return c;
        const s = u?.source?.toLowerCase();
        return s && slugs.has(s) ? s : null;
      };
      const j = o.customerJourneySummary;
      const slug = pick(j?.lastVisit?.utmParameters) ?? pick(j?.firstVisit?.utmParameters);
      if (!slug) continue;
      const f = found.get(slug) ?? { orders: 0, netSales: 0 };
      f.orders++;
      f.netSales = Math.round((f.netSales + num(o.subtotalPriceSet.shopMoney.amount) - num(o.totalRefundedSet.shopMoney.amount)) * 100) / 100;
      found.set(slug, f);
    }
    if (!data.orders.pageInfo.hasNextPage) break;
    after = data.orders.pageInfo.endCursor;
  }
  return { found, checked };
}

export async function livePress(): Promise<PressData> {
  const db = pressDb();
  if (!db) throw new Error("Supabase service role is not configured");

  const [{ data: links, error: le }, { data: clicks, error: ce }] = await Promise.all([
    db.from("press_links").select("slug, promo_id, name, outlet, created_at").order("created_at", { ascending: true }),
    db.from("press_clicks").select("slug, is_bot, created_at").order("created_at", { ascending: true }).limit(50000),
  ]);
  if (le) throw new Error(`Links: ${le.message}`);
  if (ce) throw new Error(`Clicks: ${ce.message}`);

  const weekAgo = Date.now() - 7 * 86_400_000;
  const rows = new Map<string, PressRow>();
  for (const l of links ?? []) {
    rows.set(l.slug, {
      slug: l.slug,
      promoId: l.promo_id,
      name: l.name,
      outlet: l.outlet,
      createdAt: l.created_at,
      clicks: 0,
      clicks7: 0,
      bots: 0,
      lastClick: null,
      orders: 0,
      netSales: 0,
    });
  }
  for (const c of clicks ?? []) {
    const r = rows.get(c.slug);
    if (!r) continue;
    if (c.is_bot) {
      r.bots++;
      continue;
    }
    r.clicks++;
    if (new Date(c.created_at).getTime() >= weekAgo) r.clicks7++;
    r.lastClick = c.created_at;
  }

  let orders: PressData["orders"] = { ok: true, data: { matched: 0, checked: 0 } };
  if (rows.size) {
    const since = (links ?? [])[0].created_at;
    orders = await section(async () => {
      const { found, checked } = await ordersBySlug(new Set(rows.keys()), since);
      let matched = 0;
      for (const [slug, f] of found) {
        const r = rows.get(slug);
        if (!r) continue;
        r.orders = f.orders;
        r.netSales = f.netSales;
        matched += f.orders;
      }
      return { matched, checked };
    });
  }

  const list = [...rows.values()].sort((a, b) => b.clicks - a.clicks || b.orders - a.orders || a.createdAt.localeCompare(b.createdAt));
  return { rows: list, orders };
}
