import { resetShopifyToken, shopifyAdminQuery } from "@/lib/shopify-subscribe";
import type { MetricRow } from "./store";

/**
 * Shop figures for one London day (the store's own timezone is Europe/London).
 * Sales and the session funnel come from ShopifyQL (needs read_reports and
 * protected customer data access on the Dev Dashboard app); the email list
 * comes from customers (read_customers, already granted).
 */

type QlData = {
  shopifyqlQuery: {
    parseErrors: string[];
    tableData: { columns: { name: string }[]; rows: unknown } | null;
  };
};

const QL = /* GraphQL */ `
  query Ql($q: String!) {
    shopifyqlQuery(query: $q) {
      parseErrors
      tableData {
        columns { name }
        rows
      }
    }
  }
`;

/** Runs a ShopifyQL query and returns rows as objects keyed by column name. */
async function ql(q: string): Promise<Record<string, string>[]> {
  const data = await shopifyAdminQuery<QlData>(QL, { q });
  const r = data.shopifyqlQuery;
  if (r.parseErrors?.length) throw new Error(`ShopifyQL: ${r.parseErrors.join("; ")}`);
  const cols = r.tableData?.columns.map((c) => c.name) ?? [];
  const raw = (r.tableData?.rows ?? []) as unknown[];
  return raw.map((row) => {
    if (Array.isArray(row)) return Object.fromEntries(cols.map((c, i) => [c, String(row[i] ?? "")]));
    return Object.fromEntries(Object.entries(row as Record<string, unknown>).map(([k, v]) => [k, String(v ?? "")]));
  });
}

const num = (v: string | undefined) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

async function collectShopFromReports(day: string): Promise<MetricRow[]> {
  const range = `SINCE ${day} UNTIL ${day}`;
  const rows: MetricRow[] = [];

  const [sales] = await ql(
    `FROM sales SHOW orders, gross_sales, discounts, sales_reversals, net_sales, total_sales, net_items_sold ${range}`
  );
  for (const m of ["orders", "gross_sales", "discounts", "sales_reversals", "net_sales", "total_sales"]) {
    rows.push({ metric: m, value: num(sales?.[m]) });
  }
  rows.push({ metric: "units", value: num(sales?.net_items_sold) });

  for (const r of await ql(
    `FROM sales SHOW orders, net_items_sold, net_sales GROUP BY product_variant_sku, product_title ${range}`
  )) {
    if (!r.product_variant_sku && !r.product_title) continue;
    const dim = `${r.product_variant_sku || "(no SKU)"} | ${r.product_title || ""}`;
    rows.push({ metric: "orders_by_sku", dimension: dim, value: num(r.orders) });
    rows.push({ metric: "units_by_sku", dimension: dim, value: num(r.net_items_sold) });
    rows.push({ metric: "net_sales_by_sku", dimension: dim, value: num(r.net_sales) });
  }

  for (const r of await ql(`FROM sales SHOW orders, net_sales GROUP BY shipping_country ${range}`)) {
    if (!r.shipping_country) continue;
    rows.push({ metric: "orders_by_country", dimension: r.shipping_country, value: num(r.orders) });
  }

  const [funnel] = await ql(
    `FROM sessions SHOW sessions, online_store_visitors, sessions_with_cart_additions, sessions_that_reached_checkout, sessions_that_completed_checkout ${range}`
  );
  rows.push({ metric: "sessions", value: num(funnel?.sessions) });
  rows.push({ metric: "visitors", value: num(funnel?.online_store_visitors) });
  rows.push({ metric: "sessions_added_to_cart", value: num(funnel?.sessions_with_cart_additions) });
  rows.push({ metric: "sessions_reached_checkout", value: num(funnel?.sessions_that_reached_checkout) });
  rows.push({ metric: "sessions_completed_checkout", value: num(funnel?.sessions_that_completed_checkout) });

  for (const r of await ql(`FROM sessions SHOW sessions GROUP BY referrer_source, referrer_name ${range}`)) {
    const dim = r.referrer_name ? `${r.referrer_source} / ${r.referrer_name}` : r.referrer_source || "(unknown)";
    rows.push({ metric: "sessions_by_referrer", dimension: dim, value: num(r.sessions) });
  }

  return rows;
}

type CustomersPage = {
  customers: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: {
      createdAt: string;
      tags: string[];
      defaultEmailAddress: { marketingState: string | null; marketingUpdatedAt: string | null } | null;
    }[];
  };
};

const CUSTOMERS = /* GraphQL */ `
  query Customers($after: String) {
    customers(first: 250, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes {
        createdAt
        tags
        defaultEmailAddress { marketingState marketingUpdatedAt }
      }
    }
  }
`;

/** Mailing list size at the end of the run, plus subscribes and unsubscribes within the day. */
export async function collectEmailList(start: Date, end: Date): Promise<MetricRow[]> {
  let after: string | null = null;
  let total = 0;
  let joined = 0;
  let joinedWebsite = 0;
  let left = 0;
  for (let page = 0; page < 40; page++) {
    const data: CustomersPage = await shopifyAdminQuery<CustomersPage>(CUSTOMERS, { after });
    for (const c of data.customers.nodes) {
      const state = c.defaultEmailAddress?.marketingState ?? "";
      const changed = c.defaultEmailAddress?.marketingUpdatedAt
        ? new Date(c.defaultEmailAddress.marketingUpdatedAt)
        : null;
      const inDay = changed !== null && changed >= start && changed < end;
      if (state === "SUBSCRIBED") {
        total++;
        if (inDay) {
          joined++;
          if (c.tags.includes("website-signup")) joinedWebsite++;
        }
      } else if (state === "UNSUBSCRIBED" && inDay) {
        left++;
      }
    }
    if (!data.customers.pageInfo.hasNextPage) break;
    after = data.customers.pageInfo.endCursor;
  }
  return [
    { metric: "list_total", value: total },
    { metric: "new_subscribers", value: joined },
    { metric: "new_subscribers_by_source", dimension: "website form", value: joinedWebsite },
    { metric: "new_subscribers_by_source", dimension: "checkout or other", value: joined - joinedWebsite },
    { metric: "unsubscribes", value: left },
  ];
}

const isAccessDenied = (err: unknown) => err instanceof Error && /access denied/i.test(err.message);

/**
 * Shop figures for the day. Uses ShopifyQL reports when the app is allowed to;
 * otherwise falls back to adding up the day's orders (no session funnel or
 * country in that case) and records why, with the app's current scopes.
 */
export async function collectShop(day: string, start: Date, end: Date): Promise<MetricRow[]> {
  try {
    return await collectShopFromReports(day);
  } catch (err) {
    if (!isAccessDenied(err)) throw err;
  }
  // The cached token may predate a scope change: try once more with a fresh one.
  resetShopifyToken();
  try {
    return await collectShopFromReports(day);
  } catch (err) {
    if (!isAccessDenied(err)) throw err;
  }
  const rows = await collectShopFromOrders(start, end);
  const scopes = await appScopes().catch(() => "unknown");
  rows.push({ metric: "source_note", dimension: `reports denied, used orders; app scopes: ${scopes}`, value: 1 });
  return rows;
}

async function appScopes(): Promise<string> {
  const data = await shopifyAdminQuery<{ currentAppInstallation: { accessScopes: { handle: string }[] } }>(
    `query { currentAppInstallation { accessScopes { handle } } }`
  );
  return data.currentAppInstallation.accessScopes.map((s) => s.handle).sort().join(",");
}

type OrdersPage = {
  orders: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: {
      test: boolean;
      cancelledAt: string | null;
      subtotalPriceSet: { shopMoney: { amount: string } };
      totalDiscountsSet: { shopMoney: { amount: string } };
      totalRefundedSet: { shopMoney: { amount: string } };
      currentTotalPriceSet: { shopMoney: { amount: string } };
      lineItems: {
        nodes: { sku: string | null; name: string; quantity: number; currentQuantity: number }[];
      };
    }[];
  };
};

const ORDERS = /* GraphQL */ `
  query Orders($q: String!, $after: String) {
    orders(first: 100, after: $after, query: $q) {
      pageInfo { hasNextPage endCursor }
      nodes {
        test
        cancelledAt
        subtotalPriceSet { shopMoney { amount } }
        totalDiscountsSet { shopMoney { amount } }
        totalRefundedSet { shopMoney { amount } }
        currentTotalPriceSet { shopMoney { amount } }
        lineItems(first: 50) { nodes { sku name quantity currentQuantity } }
      }
    }
  }
`;

async function collectShopFromOrders(start: Date, end: Date): Promise<MetricRow[]> {
  const q = `created_at:>='${start.toISOString()}' AND created_at:<'${end.toISOString()}'`;
  let after: string | null = null;
  let orders = 0, gross = 0, discounts = 0, refunds = 0, total = 0, units = 0;
  const rows: MetricRow[] = [];
  for (let page = 0; page < 20; page++) {
    const data: OrdersPage = await shopifyAdminQuery<OrdersPage>(ORDERS, { q, after });
    for (const o of data.orders.nodes) {
      if (o.test) continue;
      orders++;
      const subtotal = num(o.subtotalPriceSet.shopMoney.amount);
      const disc = num(o.totalDiscountsSet.shopMoney.amount);
      gross += subtotal + disc;
      discounts -= disc;
      refunds -= num(o.totalRefundedSet.shopMoney.amount);
      total += num(o.currentTotalPriceSet.shopMoney.amount);
      for (const li of o.lineItems.nodes) {
        units += li.currentQuantity;
        const dim = `${li.sku || "(no SKU)"} | ${li.name}`;
        rows.push({ metric: "orders_by_sku", dimension: dim, value: 1 });
        rows.push({ metric: "units_by_sku", dimension: dim, value: li.currentQuantity });
      }
    }
    if (!data.orders.pageInfo.hasNextPage) break;
    after = data.orders.pageInfo.endCursor;
  }
  rows.push(
    { metric: "orders", value: orders },
    { metric: "gross_sales", value: Math.round(gross * 100) / 100 },
    { metric: "discounts", value: Math.round(discounts * 100) / 100 },
    { metric: "sales_reversals", value: Math.round(refunds * 100) / 100 },
    { metric: "net_sales", value: Math.round((gross + discounts + refunds) * 100) / 100 },
    { metric: "total_sales", value: Math.round(total * 100) / 100 },
    { metric: "units", value: units }
  );
  return rows;
}
