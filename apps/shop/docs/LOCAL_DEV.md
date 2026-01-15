# Local Development

1. Install deps: `npm install`.
2. Copy env vars to `.env.local`.
3. Start dev server: `npm run dev`.

## Stripe webhook forwarding

```bash
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

Use `stripe trigger checkout.session.completed` to test.
