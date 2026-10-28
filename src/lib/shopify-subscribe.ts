/**
 * Mailing list signup via the Shopify Admin API (server-only; never import from client code).
 *
 * A signup becomes a Shopify customer with email marketing consent SUBSCRIBED, so Shopify
 * Messaging (Shopify Email) can send to them and Shopify handles unsubscribes.
 *
 * Env (server-only, set in Vercel and .env.local, never committed):
 *   SHOPIFY_STORE_DOMAIN    the store's myshopify.com domain, e.g. your-store.myshopify.com
 *   SHOPIFY_CLIENT_ID       Client ID of the Dev Dashboard app (scopes: read_customers, write_customers)
 *   SHOPIFY_CLIENT_SECRET   Client secret of that app
 *   SHOPIFY_ADMIN_TOKEN     optional fixed token (only for an old-style custom app made before 2026);
 *                           if set it is used instead of the client ID and secret
 *   SHOPIFY_API_VERSION     optional, defaults to DEFAULT_API_VERSION
 *
 * Apps made in the Dev Dashboard get tokens through the client credentials grant. Those
 * tokens last 24 hours, so this module fetches one when needed and keeps it in memory
 * until a minute before it expires.
 */

const DEFAULT_API_VERSION = "2026-07";
const TOKEN_REFRESH_MARGIN_MS = 60_000;

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

type UserError = { field?: string[] | null; message: string };

type ShopifyConfig = {
  domain: string;
  apiVersion: string;
};

type CachedToken = { value: string; expiresAt: number };

let cachedToken: CachedToken | null = null;

export type SubscribeResult = "created" | "resubscribed" | "already-subscribed";

function envValue(name: string): string | null {
  const value = process.env[name];
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

/** Returns the name of the first missing Shopify env var, or null if all are present. */
export function missingShopifyEnv(): string | null {
  if (!envValue("SHOPIFY_STORE_DOMAIN")) return "SHOPIFY_STORE_DOMAIN";
  if (envValue("SHOPIFY_ADMIN_TOKEN")) return null;
  if (!envValue("SHOPIFY_CLIENT_ID")) return "SHOPIFY_CLIENT_ID";
  if (!envValue("SHOPIFY_CLIENT_SECRET")) return "SHOPIFY_CLIENT_SECRET";
  return null;
}

function readConfig(): ShopifyConfig {
  const domain = envValue("SHOPIFY_STORE_DOMAIN");
  if (!domain) throw new Error("SHOPIFY_STORE_DOMAIN is missing");
  return {
    // Accept a pasted URL as well as a bare domain.
    domain: domain.replace(/^https?:\/\//, "").replace(/\/+$/, ""),
    apiVersion: envValue("SHOPIFY_API_VERSION") ?? DEFAULT_API_VERSION,
  };
}

/** Returns a valid Admin API token: the fixed one if set, else a cached client credentials token. */
async function getAccessToken(config: ShopifyConfig, forceRefresh = false): Promise<string> {
  const fixedToken = envValue("SHOPIFY_ADMIN_TOKEN");
  if (fixedToken) return fixedToken;

  if (!forceRefresh && cachedToken && Date.now() < cachedToken.expiresAt - TOKEN_REFRESH_MARGIN_MS) {
    return cachedToken.value;
  }

  const clientId = envValue("SHOPIFY_CLIENT_ID");
  const clientSecret = envValue("SHOPIFY_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    throw new Error("SHOPIFY_CLIENT_ID or SHOPIFY_CLIENT_SECRET is missing");
  }

  const body = new URLSearchParams();
  body.set("grant_type", "client_credentials");
  body.set("client_id", clientId);
  body.set("client_secret", clientSecret);

  const res = await fetch(`https://${config.domain}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    // Never log the response body or the credentials.
    throw new Error(`Shopify token request returned HTTP ${res.status}`);
  }
  const json = (await res.json().catch(() => null)) as {
    access_token?: string;
    expires_in?: number;
  } | null;
  if (!json?.access_token) throw new Error("Shopify token response had no access_token");

  const lifetimeSeconds = typeof json.expires_in === "number" ? json.expires_in : 86399;
  cachedToken = { value: json.access_token, expiresAt: Date.now() + lifetimeSeconds * 1000 };
  return cachedToken.value;
}

async function adminGraphQL<T>(
  config: ShopifyConfig,
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  async function send(token: string) {
    return fetch(`https://${config.domain}/admin/api/${config.apiVersion}/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    });
  }

  let res = await send(await getAccessToken(config));
  if (res.status === 401 && !envValue("SHOPIFY_ADMIN_TOKEN")) {
    // The cached token may have been revoked or expired early: get a fresh one and retry once.
    res = await send(await getAccessToken(config, true));
  }
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

/**
 * Runs any Admin GraphQL query with the same app credentials (server-only).
 * Used by the nightly analytics job (src/lib/metrics/shopify.ts), which needs the
 * extra scopes read_orders and read_reports on the same Dev Dashboard app.
 */
export async function shopifyAdminQuery<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  return adminGraphQL<T>(readConfig(), query, variables);
}
