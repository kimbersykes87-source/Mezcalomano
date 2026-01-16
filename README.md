# Mezcalómano Marketing Site

Lightweight marketing site for Mezcalómano with Shopify integration.

## Structure

- **Static HTML pages**: Marketing pages (home, product, about, support, privacy, terms)
- **Shopify redirects**: `/shop`, `/buy` redirect to Shopify store
- **Cloudflare Pages**: Deployed via Cloudflare Pages with custom domain support

## Shopify Configuration

Shopify URLs are configured in:
- **`js/shopify-config.js`**: JavaScript configuration for dynamic links
- **`_redirects`**: Cloudflare Pages redirect rules (see [REDIRECTS.md](REDIRECTS.md) for details)

See [REDIRECTS.md](REDIRECTS.md) for information about `/buy` and `/shop` redirects and how to update Shopify URLs.

## Deployment

Deploy to Cloudflare Pages:

1. Connect GitHub repository
2. Build settings:
   - Framework preset: None
   - Build command: (empty)
   - Build output directory: `/` (root)
3. Add custom domain: `mezcalomano.com`
4. Add custom domain: `shop.mezcalomano.com` (pointing to `shop-redirect.html` or configure redirect in Cloudflare)

## Local Development

Simply open `index.html` in a browser or use a local server:

```bash
# Python
python -m http.server 8000

# Node.js
npx serve
```

## Pages

- `/` - Home
- `/product` - Product page
- `/about` - About page
- `/support` - Support page
- `/privacy` - Privacy policy
- `/terms` - Terms of service
- `/shop` - Redirects to Shopify store
- `/buy` - Redirects to Shopify product
