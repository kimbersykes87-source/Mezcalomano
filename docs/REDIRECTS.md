# Redirects Configuration

This document explains the redirect paths configured for the Mezcalómano marketing site.

## Active Redirects

### `/buy`
- **Destination**: `https://shop.mezcalomano.com/products/discovery-deck`
- **Type**: 302 (temporary redirect)
- **Purpose**: Direct link to the Discovery Deck product page on Shopify
- **Usage**: Used by "Buy Now" buttons throughout the marketing site

### `/shop`
- **Destination**: `https://shop.mezcalomano.com`
- **Type**: 302 (temporary redirect)
- **Purpose**: Link to the Shopify storefront home page
- **Usage**: General "Shop" or "Store" navigation links

## Configuration File

Redirects are configured in `_redirects` (root directory), which is automatically processed by Cloudflare Pages.

**Important**: The `_redirects` file must be in the root directory for Cloudflare Pages to process it.

## Updating Shopify URLs

If you need to change the Shopify store URLs in the future:

1. **Edit `_redirects`** (root directory):
   - Update the URLs on lines 4-5
   - Format: `/path 302 https://shop.mezcalomano.com/...`

2. **Edit `js/shopify-config.js`**:
   - Update `STORE_URL` and `PRODUCT_URL` values
   - This ensures JavaScript-based links also point to the correct URLs

3. **Deploy**: Changes take effect immediately after deploying to Cloudflare Pages

## How It Works

Cloudflare Pages automatically reads the `_redirects` file from the root of your deployment and applies these rules at the edge. This means:
- Redirects happen instantly (no server round-trip)
- SEO-friendly (302 indicates temporary redirect)
- No JavaScript required (works even if JS is disabled)

## Testing

To test redirects locally, you'll need to deploy to Cloudflare Pages or use a local server that supports `_redirects` format. The redirects will work automatically once deployed.