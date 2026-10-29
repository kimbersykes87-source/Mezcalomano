import type { MetricRow } from "./store";
import { EXCLUDE_UNTIL, EXCLUDED_COUNTRY_NAME } from "./exclude";

/**
 * Visits and page views from Cloudflare Web Analytics (GraphQL Analytics API,
 * dataset rumPageloadEventsAdaptiveGroups). Needs CLOUDFLARE_ANALYTICS_TOKEN:
 * a Cloudflare API token with Account > Account Analytics > Read.
 *
 * Site tags are not secret; they can be overridden with env vars.
 */

const ACCOUNT_ID = process.env.CF_ACCOUNT_ID?.trim() || "503a8a2ff4270cb830d68d08e3705e92";

export const CF_SITES = {
  web_main: process.env.CF_SITE_TAG_MAIN?.trim() || "1f781937270d43e9a5a447e1b8053b2c", // mezcalomano.com
  web_shop: process.env.CF_SITE_TAG_SHOP?.trim() || "9d58ee9eef264dac92fd3f0c9bb15af2", // shop.mezcalomano.com
} as const;

const QUERY = /* GraphQL */ `
  query Rum($account: String!, $filter: AccountRumPageloadEventsAdaptiveGroupsFilter_InputObject!) {
    viewer {
      accounts(filter: { accountTag: $account }) {
        total: rumPageloadEventsAdaptiveGroups(limit: 1, filter: $filter) {
          count
          sum { visits }
        }
        paths: rumPageloadEventsAdaptiveGroups(limit: 50, filter: $filter, orderBy: [count_DESC]) {
          count
          sum { visits }
          dimensions { requestPath }
        }
        referrers: rumPageloadEventsAdaptiveGroups(limit: 30, filter: $filter, orderBy: [sum_visits_DESC]) {
          sum { visits }
          dimensions { refererHost }
        }
        countries: rumPageloadEventsAdaptiveGroups(limit: 30, filter: $filter, orderBy: [sum_visits_DESC]) {
          sum { visits }
          dimensions { countryName }
        }
        devices: rumPageloadEventsAdaptiveGroups(limit: 10, filter: $filter, orderBy: [sum_visits_DESC]) {
          sum { visits }
          dimensions { deviceType }
        }
      }
    }
  }
`;

type Group = { count?: number; sum?: { visits?: number }; dimensions?: Record<string, string> };
type RumData = {
  viewer: {
    accounts: {
      total: Group[];
      paths: Group[];
      referrers: Group[];
      countries: Group[];
      devices: Group[];
    }[];
  };
};

export async function collectCloudflare(siteTag: string, start: Date, end: Date): Promise<MetricRow[]> {
  const token = process.env.CLOUDFLARE_ANALYTICS_TOKEN?.trim();
  if (!token) throw new Error("CLOUDFLARE_ANALYTICS_TOKEN is not set");

  const filter = {
    AND: [
      { datetime_geq: start.toISOString(), datetime_lt: end.toISOString() },
      { siteTag },
      { bot: 0 },
      // Kimber's own visits from Morocco are left out until 14 Nov 2026 (see exclude.ts).
      ...(end.getTime() <= EXCLUDE_UNTIL.getTime() ? [{ countryName_neq: EXCLUDED_COUNTRY_NAME }] : []),
    ],
  };

  const res = await fetch("https://api.cloudflare.com/client/v4/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query: QUERY, variables: { account: ACCOUNT_ID, filter } }),
  });
  if (!res.ok) throw new Error(`Cloudflare GraphQL returned HTTP ${res.status}`);
  const json = (await res.json()) as { data?: RumData; errors?: { message: string }[] | null };
  if (json.errors?.length) throw new Error(`Cloudflare: ${json.errors.map((e) => e.message).join("; ")}`);
  const acct = json.data?.viewer.accounts[0];
  if (!acct) throw new Error("Cloudflare: account not found for this token");

  const rows: MetricRow[] = [];
  const total = acct.total[0];
  rows.push({ metric: "page_views", value: total?.count ?? 0 });
  rows.push({ metric: "visits", value: total?.sum?.visits ?? 0 });
  for (const g of acct.paths) {
    const path = g.dimensions?.requestPath || "/";
    rows.push({ metric: "page_views_by_path", dimension: path, value: g.count ?? 0 });
    rows.push({ metric: "visits_by_path", dimension: path, value: g.sum?.visits ?? 0 });
  }
  for (const g of acct.referrers) {
    rows.push({ metric: "visits_by_referrer", dimension: g.dimensions?.refererHost || "(direct)", value: g.sum?.visits ?? 0 });
  }
  for (const g of acct.countries) {
    rows.push({ metric: "visits_by_country", dimension: g.dimensions?.countryName || "(unknown)", value: g.sum?.visits ?? 0 });
  }
  for (const g of acct.devices) {
    rows.push({ metric: "visits_by_device", dimension: g.dimensions?.deviceType || "(unknown)", value: g.sum?.visits ?? 0 });
  }
  return rows;
}
