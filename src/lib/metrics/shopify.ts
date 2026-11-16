import { resetShopifyToken, shopifyAdminQuery } from "@/lib/shopify-subscribe";
import type { MetricRow } from "./store";
import { fetchOrders, num, summariseOrders, type OrdersSummary } from "./orders";

/**
 * Shop figures for one London day (the store's own timezone is Europe/London).
 * Sales come from the orders (shared rule in ./orders); the session funnel
 * comes from ShopifyQL (needs read_reports and protected customer data access
 * on the Dev Dashboard app); the email list comes from customers.
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
export async function ql(q: string): Promise<Record<string, string>[]> {
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

/** Session funnel and referrers for one London day, from ShopifyQL reports. */
async function collectShopSessions(day: string): Promise<MetricRow[]> {
  const range = `SINCE ${day} UNTIL ${day}`;
  const rows: MetricRow[] = [];

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
 * Shop figures for the day. Sales always come from the orders themselves, by
 * the shared rule in ./orders (paid orders only; samples counted apart; decks
 * not line items). Sessions and referrers come from ShopifyQL when the app is
 * allowed to read reports; otherwise they are skipped and the reason recorded.
 */
export async function collectShop(day: string, start: Date, end: Date): Promise<MetricRow[]> {
  const rows = salesRows(summariseOrders(await fetchOrders(start, end)));
  try {
    rows.push(...(await collectShopSessions(day)));
    return rows;
  } catch (err) {
    if (!isAccessDenied(err)) throw err;
  }
  // The cached token may predate a scope change: try once more with a fresh one.
  resetShopifyToken();
  try {
    rows.push(...(await collectShopSessions(day)));
    return rows;
  } catch (err) {
    if (!isAccessDenied(err)) throw err;
  }
  const scopes = await appScopes().catch(() => "unknown");
  rows.push({ metric: "source_note", dimension: `reports denied, no sessions; app scopes: ${scopes}`, value: 1 });
  return rows;
}

async function appScopes(): Promise<string> {
  const data = await shopifyAdminQuery<{ currentAppInstallation: { accessScopes: { handle: string }[] } }>(
    `query { currentAppInstallation { accessScopes { handle } } }`
  );
  return data.currentAppInstallation.accessScopes.map((s) => s.handle).sort().join(",");
}

/** metrics_daily rows for one day's orders. Discounts and reversals are stored as negatives, as Shopify reports them. */
export function salesRows(s: OrdersSummary): MetricRow[] {
  const rows: MetricRow[] = [
    { metric: "orders", value: s.orders },
    { metric: "gross_sales", value: s.grossSales },
    { metric: "discounts", value: -s.discounts },
    { metric: "sales_reversals", value: -s.refunds },
    { metric: "net_sales", value: s.netSales },
    { metric: "total_sales", value: s.totalSales },
    { metric: "units", value: s.decks },
    { metric: "samples_orders", value: s.samples.orders },
    { metric: "samples_decks", value: s.samples.decks },
  ];
  for (const p of s.products) {
    const dim = `${p.sku || "(no SKU)"} | ${p.name}`;
    rows.push({ metric: "orders_by_sku", dimension: dim, value: p.orders });
    rows.push({ metric: "units_by_sku", dimension: dim, value: p.decks });
    rows.push({ metric: "net_sales_by_sku", dimension: dim, value: p.lineSales });
  }
  for (const c of s.countries) rows.push({ metric: "orders_by_country", dimension: c.name, value: c.orders });
  return rows;
}
