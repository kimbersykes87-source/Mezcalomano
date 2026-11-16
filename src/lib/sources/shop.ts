import { ql } from "@/lib/metrics/shopify";
import { fetchOrders, num, r2, summariseOrders } from "@/lib/metrics/orders";
import { londonDayRange } from "@/lib/metrics/time";
import { addDays } from "@/lib/admin/summary";
import { eachDay } from "@/lib/admin/period";
import { section, type Section } from "./cache";

/**
 * Live shop figures straight from Shopify for a range of London days.
 * Sales come from the orders, by the shared rule in lib/metrics/orders
 * (paid orders only, samples counted apart, decks not line items); the
 * session funnel and referrers come from ShopifyQL.
 */

const n = num;

export type ShopOrders = {
  orders: number;
  grossSales: number;
  discounts: number;
  refunds: number;
  netSales: number;
  totalSales: number;
  /** Decks in paid orders (a Two-Pack is 2, insert cards are 0). */
  units: number;
  aov: number | null;
  samples: { orders: number; decks: number };
  excluded: { test: number; cancelled: number; testCode: number };
  daily: { day: string; orders: number; netSales: number }[];
  products: { name: string; sku: string; orders: number; units: number; decks: number; lineSales: number }[];
  countries: { name: string; orders: number }[];
  codes: { code: string; orders: number; discount: number }[];
};

export async function liveOrders(from: string, to: string): Promise<ShopOrders> {
  const s = summariseOrders(await fetchOrders(londonDayRange(from).start, londonDayRange(to).end));
  return {
    orders: s.orders,
    grossSales: s.grossSales,
    discounts: s.discounts,
    refunds: s.refunds,
    netSales: s.netSales,
    totalSales: s.totalSales,
    units: s.decks,
    aov: s.orders ? r2((s.grossSales - s.discounts) / s.orders) : null,
    samples: s.samples,
    excluded: s.excluded,
    daily: eachDay(from, to).map((d) => ({ day: d, orders: s.byDay.get(d)?.orders ?? 0, netSales: s.byDay.get(d)?.netSales ?? 0 })),
    products: s.products,
    countries: s.countries.map((c) => ({ name: c.name, orders: c.orders })),
    codes: s.codes,
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
