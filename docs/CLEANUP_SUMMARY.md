# Cleanup Summary (Archived)

**Note**: This document is archived for historical reference. The cleanup described here has been completed.

This document records the removal of the custom shop application (`apps/shop/`) and migration to a Shopify-based storefront.

## What Was Removed

- Complete `apps/shop/` directory (200+ files)
- All Stripe integration code
- All custom e-commerce functionality (cart, checkout, orders, inventory)
- Database bindings (D1, KV)
- All shop-specific documentation

## Current State

The site is now a lightweight static marketing site that redirects to Shopify for all e-commerce functionality.

For current setup and configuration, see:
- [README.md](../README.md) - Project overview
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [PHASE2_SHOPIFY_HANDOFF.md](PHASE2_SHOPIFY_HANDOFF.md) - Shopify integration