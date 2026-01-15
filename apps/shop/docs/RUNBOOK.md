# Operations Runbook

## Refunds

1. Issue refund in Stripe dashboard.
2. Stripe webhook updates order status and sends refund email.

## Returns

- USA returns: Mezcalomano pays return shipping.
- International: customer covers return shipping and duties.

## Failed ShipStation sync

1. Check ShipStation API credentials and store ID.
2. Use “Resync ShipStation” in admin for the order.
3. Review ShipStation logs for API errors.

## Google Sheets sync

1. Verify service account access to the sheet.
2. Use “Sync Google Sheets” in admin.

## Data deletion requests

1. Review audit log for `customer.deletion_requested`.
2. Use admin delete/anonymize tool.
