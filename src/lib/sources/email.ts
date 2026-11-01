import { shopifyAdminQuery } from "@/lib/shopify-subscribe";
import { serviceClient } from "@/lib/metrics/store";
import { londonDayRange } from "@/lib/metrics/time";
import { eachDay } from "@/lib/admin/period";
import { section, type Section } from "./cache";

/**
 * Live email figures. The mailing list is the set of Shopify customers with
 * email marketing consent, read straight from Shopify. No email addresses are
 * shown or stored here, only counts.
 */

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
  query LiveCustomers($after: String) {
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

const day = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London" }).format(new Date(iso));

export type EmailList = {
  total: number;
  states: { name: string; count: number }[];
  joined: number;
  joinedWebsite: number;
  joinedOther: number;
  left: number;
  daily: { day: string; joined: number; left: number }[];
};

export async function liveEmailList(from: string, to: string): Promise<EmailList> {
  const start = londonDayRange(from).start;
  const end = londonDayRange(to).end;
  const daily = new Map(eachDay(from, to).map((d) => [d, { day: d, joined: 0, left: 0 }]));
  const states = new Map<string, number>();
  let total = 0, joined = 0, joinedWebsite = 0, left = 0;

  let after: string | null = null;
  for (let page = 0; page < 60; page++) {
    const data: CustomersPage = await shopifyAdminQuery<CustomersPage>(CUSTOMERS, { after });
    for (const c of data.customers.nodes) {
      const state = c.defaultEmailAddress?.marketingState ?? "NO_EMAIL";
      states.set(state, (states.get(state) ?? 0) + 1);
      const changedIso = c.defaultEmailAddress?.marketingUpdatedAt ?? null;
      const changed = changedIso ? new Date(changedIso) : null;
      const inRange = changed !== null && changed >= start && changed < end;
      if (state === "SUBSCRIBED") {
        total++;
        if (inRange && changedIso) {
          joined++;
          if (c.tags.includes("website-signup")) joinedWebsite++;
          const b = daily.get(day(changedIso));
          if (b) b.joined++;
        }
      } else if (state === "UNSUBSCRIBED" && inRange && changedIso) {
        left++;
        const b = daily.get(day(changedIso));
        if (b) b.left++;
      }
    }
    if (!data.customers.pageInfo.hasNextPage) break;
    after = data.customers.pageInfo.endCursor;
  }

  return {
    total,
    states: [...states].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    joined,
    joinedWebsite,
    joinedOther: joined - joinedWebsite,
    left,
    daily: [...daily.values()],
  };
}

export type Campaigns = { title: string; createdAt: string; status: string; channel: string }[];

/** Recent marketing activities (Shopify Email campaigns and automations). Needs the read_marketing_events scope. */
export async function liveCampaigns(): Promise<Campaigns> {
  const data = await shopifyAdminQuery<{
    marketingActivities: { nodes: { title: string; createdAt: string; statusLabel: string | null; marketingChannelType: string | null }[] };
  }>(`query { marketingActivities(first: 15, sortKey: CREATED_AT, reverse: true) { nodes { title createdAt statusLabel marketingChannelType } } }`);
  return data.marketingActivities.nodes.map((m) => ({
    title: m.title,
    createdAt: m.createdAt,
    status: m.statusLabel ?? "",
    channel: m.marketingChannelType ?? "",
  }));
}

/** Messages sent through the website contact form in the period. */
export async function liveContacts(from: string, to: string): Promise<number> {
  const { count, error } = await serviceClient()
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .gte("created_at", londonDayRange(from).start.toISOString())
    .lt("created_at", londonDayRange(to).end.toISOString());
  if (error) throw new Error(`contacts: ${error.message}`);
  return count ?? 0;
}

export type EmailLive = { list: Section<EmailList>; campaigns: Section<Campaigns>; contacts: Section<number> };

export async function liveEmail(from: string, to: string): Promise<EmailLive> {
  const [list, campaigns, contacts] = await Promise.all([
    section(() => liveEmailList(from, to)),
    section(() => liveCampaigns()),
    section(() => liveContacts(from, to)),
  ]);
  return { list, campaigns, contacts };
}
