import { shopifyAdminQuery } from "@/lib/shopify-subscribe";
import { TEST_DISCOUNT_CODES } from "./exclude";

/**
 * One rule for what counts as a sale, used by the nightly collection job,
 * the Shop page and (through metrics_daily) the Overview and Monday email.
 *
 * - Test orders, orders tagged "test", orders using a test discount code and
 *   cancelled orders are left out entirely (and counted as excluded).
 * - Orders worth $0 after discounts are samples (press, influencer, gifts):
 *   not orders, not sales, not decks sold. They are counted separately.
 * - Everything else is a paid order.
 * - "Decks" counts decks, not line items: a Two-Pack SKU (-2PK) is 2 decks,
 *   a Five-Pack (-5PK) is 5, insert cards (MM-INSERT-*) are 0.
 */

type Money = { shopMoney: { amount: string } };

export type OrderNode = {
  name: string;
  createdAt: string;
  test: boolean;
  tags: string[];
  cancelledAt: string | null;
  discountCodes: string[];
  subtotalPriceSet: Money;
  totalDiscountsSet: Money;
  totalRefundedSet: Money;
  currentTotalPriceSet: Money;
  shippingAddress: { country: string | null } | null;
  lineItems: {
    nodes: { sku: string | null; name: string; currentQuantity: number; discountedTotalSet: Money }[];
  };
};

type OrdersPage = {
  orders: { pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: OrderNode[] };
};

const ORDERS = /* GraphQL */ `
  query DashboardOrders($q: String!, $after: String) {
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

/** All orders created in [start, end). */
export async function fetchOrders(start: Date, end: Date): Promise<OrderNode[]> {
  const q = `created_at:>='${start.toISOString()}' AND created_at:<'${end.toISOString()}'`;
  const out: OrderNode[] = [];
  let after: string | null = null;
  for (let page = 0; page < 40; page++) {
    const data: OrdersPage = await shopifyAdminQuery<OrdersPage>(ORDERS, { q, after });
    out.push(...data.orders.nodes);
    if (!data.orders.pageInfo.hasNextPage) break;
    after = data.orders.pageInfo.endCursor;
  }
  return out;
}

export const num = (v: string | undefined) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};
export const r2 = (v: number) => Math.round(v * 100) / 100;

export type OrderKind = "paid" | "sample" | "test" | "testCode" | "cancelled";

const testCodes = new Set(TEST_DISCOUNT_CODES.map((c) => c.toUpperCase()));

export function classifyOrder(o: OrderNode): OrderKind {
  if (o.test || o.tags.some((t) => t.toLowerCase() === "test")) return "test";
  if (o.discountCodes.some((c) => testCodes.has(c.toUpperCase()))) return "testCode";
  if (o.cancelledAt) return "cancelled";
  if (num(o.subtotalPriceSet.shopMoney.amount) <= 0) return "sample";
  return "paid";
}

/** How many decks one unit of this line item is. */
export function decksPerUnit(sku: string | null, name: string): number {
  const s = (sku ?? "").toUpperCase();
  if (s.startsWith("MM-INSERT")) return 0;
  const pack = s.match(/-(\d+)PK$/);
  if (pack) return Number(pack[1]);
  if (/^MM-1\d{3}$/.test(s)) return 1;
  return /discovery deck/i.test(name) ? 1 : 0;
}

export function decksInOrder(o: OrderNode): number {
  return o.lineItems.nodes.reduce((a, li) => a + Math.max(0, li.currentQuantity) * decksPerUnit(li.sku, li.name), 0);
}

export const londonDayOf = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date(iso));

export type OrdersSummary = {
  orders: number;
  grossSales: number;
  discounts: number;
  refunds: number;
  netSales: number;
  totalSales: number;
  decks: number;
  samples: { orders: number; decks: number };
  excluded: { test: number; cancelled: number; testCode: number };
  byDay: Map<string, { orders: number; netSales: number; decks: number }>;
  products: { name: string; sku: string; orders: number; units: number; decks: number; lineSales: number }[];
  countries: { name: string; orders: number; netSales: number }[];
  codes: { code: string; orders: number; discount: number }[];
};

export function summariseOrders(nodes: OrderNode[]): OrdersSummary {
  const excluded = { test: 0, cancelled: 0, testCode: 0 };
  const samples = { orders: 0, decks: 0 };
  const byDay = new Map<string, { orders: number; netSales: number; decks: number }>();
  const products = new Map<string, OrdersSummary["products"][number]>();
  const countries = new Map<string, { name: string; orders: number; netSales: number }>();
  const codes = new Map<string, { code: string; orders: number; discount: number }>();
  let orders = 0, gross = 0, discounts = 0, refunds = 0, total = 0, decks = 0;

  for (const o of nodes) {
    const kind = classifyOrder(o);
    if (kind === "test" || kind === "testCode" || kind === "cancelled") { excluded[kind]++; continue; }
    if (kind === "sample") { samples.orders++; samples.decks += decksInOrder(o); continue; }

    orders++;
    const subtotal = num(o.subtotalPriceSet.shopMoney.amount);
    const disc = num(o.totalDiscountsSet.shopMoney.amount);
    const refunded = num(o.totalRefundedSet.shopMoney.amount);
    const net = subtotal - refunded;
    const orderDecks = decksInOrder(o);
    gross += subtotal + disc;
    discounts += disc;
    refunds += refunded;
    total += num(o.currentTotalPriceSet.shopMoney.amount);
    decks += orderDecks;

    const day = londonDayOf(o.createdAt);
    const d = byDay.get(day) ?? { orders: 0, netSales: 0, decks: 0 };
    d.orders++;
    d.netSales = r2(d.netSales + net);
    d.decks += orderDecks;
    byDay.set(day, d);

    for (const li of o.lineItems.nodes) {
      if (li.currentQuantity <= 0) continue;
      const key = li.sku || li.name;
      const p = products.get(key) ?? { name: li.name, sku: li.sku ?? "", orders: 0, units: 0, decks: 0, lineSales: 0 };
      p.orders++;
      p.units += li.currentQuantity;
      p.decks += li.currentQuantity * decksPerUnit(li.sku, li.name);
      p.lineSales = r2(p.lineSales + num(li.discountedTotalSet.shopMoney.amount));
      products.set(key, p);
    }

    const cname = o.shippingAddress?.country || "(no address)";
    const c = countries.get(cname) ?? { name: cname, orders: 0, netSales: 0 };
    c.orders++;
    c.netSales = r2(c.netSales + net);
    countries.set(cname, c);

    for (const code of o.discountCodes) {
      const e = codes.get(code) ?? { code, orders: 0, discount: 0 };
      e.orders++;
      e.discount = r2(e.discount + disc);
      codes.set(code, e);
    }
  }

  return {
    orders,
    grossSales: r2(gross),
    discounts: r2(discounts),
    refunds: r2(refunds),
    netSales: r2(gross - discounts - refunds),
    totalSales: r2(total),
    decks,
    samples,
    excluded,
    byDay,
    products: [...products.values()].sort((a, b) => b.decks - a.decks || b.units - a.units),
    countries: [...countries.values()].sort((a, b) => b.orders - a.orders),
    codes: [...codes.values()].sort((a, b) => b.orders - a.orders),
  };
}
