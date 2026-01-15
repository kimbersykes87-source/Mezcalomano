# Deployment (Cloudflare Pages)

## Build

1. Install dependencies: `npm install`.
2. Build for Pages: `npm run pages:build`.

For local development and webhook forwarding, see `docs/LOCAL_DEV.md`.

## Cloudflare Pages setup

1. Create a Pages project pointing to `apps/shop`.
2. Build command: `npm ci && npm run pages:build`.
3. Build output directory: `.open-next`.
4. Add D1 binding `DB` and KV binding `KV`.
5. Add environment variables listed in `docs/ENVIRONMENT.md`.
6. Set `NODE_ENV=production`.

## DNS

1. Add `shop.mezcalomano.com` to Cloudflare DNS as a CNAME to the Pages domain.
2. Enable TLS and ensure HSTS is active.

## Webhooks

1. Stripe webhook endpoint: `https://shop.mezcalomano.com/api/stripe/webhook`.
2. ShipStation webhook endpoint: `https://shop.mezcalomano.com/api/shipstation/webhook`.
