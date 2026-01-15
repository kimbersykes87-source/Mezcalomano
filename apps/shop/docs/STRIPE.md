# Stripe Setup (UK Account)

## Products & tax

1. Create a Stripe product for “Mezcalomano - Discovery Deck”.
2. Create a USD price: 39.99.
3. Enable Stripe Tax in the dashboard.
4. Configure product tax code if applicable.
5. Add tax registrations for the jurisdictions where Mezcalomano is registered. Stripe Tax will only calculate where registrations exist.
6. Review “Tax settings” to ensure shipping origin is set to the US and inclusive/exclusive prices are configured for USD.

## Checkout

- Checkout sessions are created server-side with Stripe Tax enabled and billing address collection required.

## Webhooks

Create a webhook endpoint for:

- `checkout.session.completed`
- `checkout.session.expired`
- `charge.refunded`

Set the webhook secret as `STRIPE_WEBHOOK_SECRET`.
