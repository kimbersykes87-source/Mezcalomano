import { shopifyAdminQuery } from "@/lib/shopify-subscribe";
import { ql } from "@/lib/metrics/shopify";
import { TEST_DISCOUNT_CODES } from "@/lib/metrics/exclude";
import { londonDayRange } from "@/lib/metrics/time";
import { addDays } from "@/lib/admin/summary";
import { eachDay } from "@/lib/admin/period";
import { section, type Section } from "./cache";

/**
 * Live shop figures straight from Shopify for a range of London days.
 * Sales come from the orders themselves (so test, cancelled and test code
 * orders can be left out and counted); the session funnel and referrers come
 * from ShopifyQL.
 */

type OrdersPage = {
  orders: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: {
      name: string;
      createdAt: string;
      test: boolean;
      tags: string[];
      cancelledAt: string | null;
      discountCodes: string[];
      subtotalPriceSet: { shopMoney: { amount: string } };
      totalDiscountsSet: { shopMoney: { amount: string } };
      totalRefundedSet: { shopMoney: { amount: string } };
      currentTotalPriceSet: { shopMoney: { amount: string } };
      shippingAddress: { country: string | null } | null;
      lineItems: {
        nodes: { sku: string | null; name: string; currentQuantity: number; discountedTotalSet: { shopMoney: { amount: string } } }[];
      };
    }[];
  };
};

const ORDERS = /* GraphQL */ `
  query LiveOrders($q: String!, $after: String) {
    orders(first: 100, after: $after, query: $q) {
      pageInfo { hasNextPage endCursor }
      nodes {
        name createdAt test tags cancelledAt discountCodes
        subtotalPriceSet { shopMoney { amount } }
        totalDiscountsSet { shopMoney { amount } }
        totalRefundedSet { shopMoney { amount } }
        currentTotalPriceSet { shopMoney { amount } }
        shippingAddress { country }
        lineItems(first: 50) { nodes { sku name currentQuantity discountedTotalSet { shopMoney { amount } } } }
      }
    }
  }
`;

const n = (v: string | undefined) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};
const r2 = (v: number) => Math.round(v * 100) / 100;

export type ShopOrders = {
  orders: number;
  grossSales: number;
  discounts: number;
  refunds: number;
  netSales: number;
  totalSales: number;
  units: number;
  aov: number | null;
  excluded: { test: number; cancelled: number; testCode: number };
  daily: { day: string; orders: number; netSales: number }[];
  products: { name: string; sku: string; orders: number; units: number; lineSales: number }[];
  countries: { name: string; orders: number }[];
  codes: { code: string; orders: number; discount: number }[];
};

export async function liveOrders(from: string, to: string): Promise<ShopOrders> {
  const start = londonDayRange(from).start;
  const end = londonDayRange(to).end;
  const q = `created_at:>='${start.toISOString()}' AND created_at:<'${end.toISOString()}'`;
  const testCodes = new Set(TEST_DISCOUNT_CODES.map((c) => c.toUpperCase()));

  const days = new Map(eachDay(from, to).map((d) => [d, { day: d, orders: 0, netSales: 0 }]));
  const products = new Map<string, { name: string; sku: string; orders: number; units: number; lineSales: number }>();
  const countries = new Map<string, number>();
  const codes = new Map<string, { code: string; orders: number; discount: number }>();
  const excluded = { test: 0, cancelled: 0, testCode: 0 };
  let orders = 0, gross = 0, discounts = 0, refunds = 0, total = 0, units = 0;

  let after: string | null = null;
  for (let page = 0; page < 40; page++) {
    const data: OrdersPage = await shopifyAdminQuery<OrdersPage>(ORDERS, { q, after });
    for (const o of data.orders.nodes) {
      if (o.test || o.tags.some((t) => t.toLowerCase() === "test")) { excluded.test++; continue; }
      if (o.discountCodes.some((c) => testCodes.has(c.toUpperCase()))) { excluded.testCode++; continue; }
      if (o.cancelledAt) { excluded.cancelled++; continue; }
      orders++;
      const subtotal = n(o.subtotalPriceSet.shopMoney.amount);
      const disc = n(o.totalDiscountsSet.shopMoney.amount);
      const refunded = n(o.totalRefundedSet.shopMoney.amount);
      gross += subtotal + disc;
      discounts += disc;
      refunds += refunded;
      total += n(o.currentTotalPriceSet.shopMoney.amount);
      const net = subtotal - refunded;
      const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date(o.createdAt));
      const bucket = days.get(dayKey);
      if (bucket) { bucket.orders++; bucket.netSales = r2(bucket.netSales + net); }
      for (const li of o.lineItems.nodes) {
        if (li.currentQuantity <= 0) continue;
        units += li.currentQuantity;
        const key = li.sku || li.name;
        const p = products.get(key) ?? { name: li.name, sku: li.sku ?? "", orders: 0, units: 0, lineSales: 0 };
        p.orders++;
        p.units += li.currentQuantity;
        p.lineSales = r2(p.lineSales + n(li.discountedTotalSet.shopMoney.amount));
        products.set(key, p);
      }
      const country = o.shippingAddress?.country || "(no address)";
      countries.set(country, (countries.get(country) ?? 0) + 1);
      for (const c of o.discountCodes) {
        const e = codes.get(c) ?? { code: c, orders: 0, discount: 0 };
        e.orders++;
        e.discount = r2(e.discount + disc);
        codes.set(c, e);
      }
    }
    if (!data.orders.pageInfo.hasNextPage) break;
    after = data.orders.pageInfo.endCursor;
  }

  return {
    orders,
    grossSales: r2(gross),
    discounts: r2(discounts),
    refunds: r2(refunds),
    netSales: r2(gross - discounts - refunds),
    totalSales: r2(total),
    units,
    aov: orders ? r2((gross - discounts) / orders) : null,
    excluded,
    daily: [...days.values()],
    products: [...products.values()].sort((a, b) => b.units - a.units),
    countries: [...countries].map(([name, o]) => ({ name, orders: o })).sort((a, b) => b.orders - a.orders),
    codes: [...codes.values()].sort((a, b) => b.orders - a.orders),
  };
}

export type ShopSessions = {
  sessions: number;
  visitors: number;
  cart: number;
  checkout: number;
  completed: number;
  daily: { day: string; sessions: number }[];
  referrers: { name: string; sessions: number }[];
  devices: { name: string; sessions: number }[];
};

export async function liveSessions(from: string, to: string): Promise<ShopSessions> {
  const range = `SINCE ${from} UNTIL ${to}`;
  const [[f], series, refs, dev] = await Promise.all([
    ql(`FROM sessions SHOW sessions, online_store_visitors, sessions_with_cart_additions, sessions_that_reached_checkout, sessions_that_completed_checkout ${range}`),
    ql(`FROM sessions SHOW sessions TIMESERIES day ${range}`),
    ql(`FROM sessions SHOW sessions GROUP BY referrer_source, referrer_name ${range}`),
    ql(`FROM sessions SHOW sessions GROUP BY session_device_type ${range}`),
  ]);
  const byDay = new Map(series.map((r) => [String(r.day).slice(0, 10), n(r.sessions)]));
  return {
    sessions: n(f?.sessions),
    visitors: n(f?.online_store_visitors),
    cart: n(f?.sessions_with_cart_additions),
    checkout: n(f?.sessions_that_reached_checkout),
    completed: n(f?.sessions_that_completed_checkout),
    daily: eachDay(from, to).map((d) => ({ day: d, sessions: byDay.get(d) ?? 0 })),
    referrers: refs
      .map((r) => ({ name: r.referrer_name ? `${r.referrer_source} / ${r.referrer_name}` : r.referrer_source || "direct or unknown", sessions: n(r.sessions) }))
      .sort((a, b) => b.sessions - a.sessions),
    devices: dev.map((r) => ({ name: r.session_device_type || "unknown", sessions: n(r.sessions) })).sort((a, b) => b.sessions - a.sessions),
  };
}

export type ShopLive = { orders: Section<ShopOrders>; sessions: Section<ShopSessions> };

export async function liveShop(from: string, to: string): Promise<ShopLive> {
  const [orders, sessions] = await Promise.all([section(() => liveOrders(from, to)), section(() => liveSessions(from, to))]);
  return { orders, sessions };
}

/** The same range one period earlier, for the "vs previous" figures. */
export function previousRange(from: string, to: string): { from: string; to: string } {
  const len = eachDay(from, to).length;
  return { from: addDays(from, -len), to: addDays(from, -1) };
}
