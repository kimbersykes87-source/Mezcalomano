# Next steps (integrations to enable)

This deployment is focused on getting the storefront UI live at `shop.mezcalomano.com`.
The endpoints below are currently **disabled** until you configure the integrations.

## Stripe (Checkout + webhooks)

- **Enable checkout endpoint**: `app/api/checkout/route.ts`
- **Enable Stripe webhook**: `app/api/stripe/webhook/route.ts`
- Cloudflare env vars to add:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_TAX_CODE` (optional)
  - `NEXT_PUBLIC_SITE_URL`
- Stripe dashboard:
  - Create product + price (USD 39.99)
  - Enable Stripe Tax + registrations
  - Create webhook endpoint to:
    - `https://shop.mezcalomano.com/api/stripe/webhook`

## ShipStation (fulfillment + tracking)

- **Enable ShipStation webhook**: `app/api/shipstation/webhook/route.ts`
- Cloudflare env vars to add:
  - `SHIPSTATION_API_KEY`
  - `SHIPSTATION_API_SECRET`
  - `SHIPSTATION_STORE_ID`
  - `SHIPSTATION_WEBHOOK_SECRET`
- ShipStation dashboard:
  - Configure webhook endpoint:
    - `https://shop.mezcalomano.com/api/shipstation/webhook`

## Resend (transactional email)

- Used by magic links and order/shipping/refund emails.
- Cloudflare env vars to add:
  - `RESEND_API_KEY`
  - `EMAIL_FROM`
- Re-enable:
  - `app/api/account/request-magic/route.ts`
  - `app/api/admin/request-magic/route.ts`
  - Order emails in Stripe webhook handler (when Stripe is enabled)

## Cloudflare Turnstile (public form protection)

- Cloudflare env vars to add:
  - `TURNSTILE_SECRET_KEY`
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- Then re-enable magic link request routes (above).

## Google Sheets (ops mirror)

- **Enable sync endpoint**: `app/api/admin/sheets/sync/route.ts`
- Cloudflare env vars to add:
  - `GOOGLE_SHEETS_CLIENT_EMAIL`
  - `GOOGLE_SHEETS_PRIVATE_KEY`
  - `GOOGLE_SHEETS_SPREADSHEET_ID`
- Create the spreadsheet with:
  - `npm run sheets:create`

