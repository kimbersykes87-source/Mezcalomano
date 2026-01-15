# ShipStation Setup

1. Create or locate the ShipStation store for `iprintandship.com`.
2. Note the Store ID and set `SHIPSTATION_STORE_ID`.
3. Create API keys and set `SHIPSTATION_API_KEY` / `SHIPSTATION_API_SECRET`.
4. Configure webhook with secret `SHIPSTATION_WEBHOOK_SECRET`.
5. Webhook endpoint: `https://shop.mezcalomano.com/api/shipstation/webhook`.

## Fulfillment flow

- Orders are created in ShipStation immediately after Stripe payment.
- Shipment updates and tracking are sent back via webhook.
