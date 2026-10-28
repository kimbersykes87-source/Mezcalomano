import { shopifyAdminQuery } from "@/lib/shopify-subscribe";
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

export async function collectShop(day: string): Promise<MetricRow[]> {
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
