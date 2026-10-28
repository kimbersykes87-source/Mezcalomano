/**
 * Mailing list signup via the Shopify Admin API (server-only; never import from client code).
 *
 * A signup becomes a Shopify customer with email marketing consent SUBSCRIBED, so Shopify
 * Messaging (Shopify Email) can send to them and Shopify handles unsubscribes.
 *
 * Env (server-only, set in Vercel and .env.local, never committed):
 *   SHOPIFY_STORE_DOMAIN   the store's myshopify.com domain, e.g. your-store.myshopify.com
 *   SHOPIFY_ADMIN_TOKEN    Admin API access token from a custom app (read_customers, write_customers)
 *   SHOPIFY_API_VERSION    optional, defaults to DEFAULT_API_VERSION
 */

const DEFAULT_API_VERSION = "2026-07";

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

type UserError = { field?: string[] | null; message: string };

type ShopifyConfig = {
  domain: string;
  token: string;
  apiVersion: string;
};

export type SubscribeResult = "created" | "resubscribed" | "already-subscribed";

function envValue(name: string): string | null {
  const value = process.env[name];
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

/** Returns the name of the first missing Shopify env var, or null if all are present. */
export function missingShopifyEnv(): string | null {
  if (!envValue("SHOPIFY_STORE_DOMAIN")) return "SHOPIFY_STORE_DOMAIN";
  if (!envValue("SHOPIFY_ADMIN_TOKEN")) return "SHOPIFY_ADMIN_TOKEN";
  return null;
}

function readConfig(): ShopifyConfig {
  const domain = envValue("SHOPIFY_STORE_DOMAIN");
  const token = envValue("SHOPIFY_ADMIN_TOKEN");
  if (!domain || !token) throw new Error("Shopify env vars are missing");
  return {
    // Accept a pasted URL as well as a bare domain.
    domain: domain.replace(/^https?:\/\//, "").replace(/\/+$/, ""),
    token,
    apiVersion: envValue("SHOPIFY_API_VERSION") ?? DEFAULT_API_VERSION,
  };
}

async function adminGraphQL<T>(
  config: ShopifyConfig,
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`https://${config.domain}/admin/api/${config.apiVersion}/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": config.token,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    throw new Error(`Shopify Admin API returned HTTP ${res.status}`);
  }
  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new Error(`Shopify Admin API error: ${json.errors.map((e) => e.message).join("; ")}`);
  }
  if (!json.data) throw new Error("Shopify Admin API returned no data");
  return json.data;
}

function throwOnUserErrors(label: string, userErrors: UserError[] | undefined) {
  if (userErrors && userErrors.length > 0) {
    throw new Error(`${label}: ${userErrors.map((e) => e.message).join("; ")}`);
  }
}

const FIND_CUSTOMER = /* GraphQL */ `
  query FindCustomer($query: String!) {
    customers(first: 1, query: $query) {
      nodes {
        id
        emailMarketingConsent {
          marketingState
        }
      }
    }
  }
`;

const CREATE_CUSTOMER = /* GraphQL */ `
  mutation CreateSubscriber($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const UPDATE_CONSENT = /* GraphQL */ `
  mutation SubscribeExisting($input: CustomerEmailMarketingConsentUpdateInput!) {
    customerEmailMarketingConsentUpdate(input: $input) {
      customer {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

type FindCustomerData = {
  customers: {
    nodes: { id: string; emailMarketingConsent: { marketingState: string } | null }[];
  };
};

type CreateCustomerData = {
  customerCreate: { customer: { id: string } | null; userErrors: UserError[] };
};

type UpdateConsentData = {
  customerEmailMarketingConsentUpdate: { customer: { id: string } | null; userErrors: UserError[] };
};

/**
 * Subscribes an email address to marketing in Shopify. Safe to call twice for the same
 * address: an existing subscribed customer is left alone, anyone else is moved to subscribed.
 * `consentedAt` is when the person submitted the form (ISO 8601).
 */
export async function subscribeEmail(email: string, consentedAt: string): Promise<SubscribeResult> {
  const config = readConfig();
  const consent = {
    marketingState: "SUBSCRIBED",
    marketingOptInLevel: "SINGLE_OPT_IN",
    consentUpdatedAt: consentedAt,
  };

  // The address is regex-validated by the caller (no whitespace); strip quotes and
  // backslashes anyway so it cannot break out of the search string.
  const safeEmail = email.replace(/["\\]/g, "");
  const found = await adminGraphQL<FindCustomerData>(config, FIND_CUSTOMER, {
    query: `email:"${safeEmail}"`,
  });

  const existing = found.customers.nodes[0];
  if (existing) {
    if (existing.emailMarketingConsent?.marketingState === "SUBSCRIBED") {
      return "already-subscribed";
    }
    const updated = await adminGraphQL<UpdateConsentData>(config, UPDATE_CONSENT, {
      input: { customerId: existing.id, emailMarketingConsent: consent },
    });
    throwOnUserErrors(
      "customerEmailMarketingConsentUpdate",
      updated.customerEmailMarketingConsentUpdate.userErrors
    );
    return "resubscribed";
  }

  const created = await adminGraphQL<CreateCustomerData>(config, CREATE_CUSTOMER, {
    input: {
      email: safeEmail,
      tags: ["mailing-list", "website-signup"],
      emailMarketingConsent: consent,
    },
  });
  throwOnUserErrors("customerCreate", created.customerCreate.userErrors);
  return "created";
}
