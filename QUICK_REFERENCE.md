# Quick Reference Guide

**For detailed documentation, see [CONNECTIONS.md](CONNECTIONS.md)**

## Critical Files (Never Delete)

- `astro.config.mjs` - Cloudflare adapter & site URL
- `_redirects` - Shopify redirects
- `config/wrangler.toml` - Cloudflare Workers config
- `package.json` - Must include `@astrojs/cloudflare`

## Key Connections

| Connection | Location | Details |
|------------|----------|---------|
| **GitHub** | Cloudflare Pages Dashboard | Auto-deploys from `main` branch |
| **Cloudflare Pages** | `astro.config.mjs` | Adapter: `@astrojs/cloudflare` |
| **Domain** | `astro.config.mjs` | Site: `https://mezcalomano.com` |
| **Shopify Redirects** | `_redirects` | `/buy` → Shopify product, `/shop` → Shopify store |
| **Environment Variables** | Cloudflare Pages Dashboard | Set in Settings → Environment Variables |

## Important URLs

- **Repository**: https://github.com/kimbersykes87-source/Mezcalomano
- **Live Site**: https://mezcalomano.com
- **Shopify Store**: https://shop.mezcalomano.com
- **Cloudflare Dashboard**: https://dash.cloudflare.com/

## Quick Commands

```bash
npm install          # Install dependencies
npm run dev          # Local development (http://localhost:4321)
npm run build        # Production build
npm run preview      # Preview production build
```

## Before Making Changes

1. ✅ Read [CONNECTIONS.md](CONNECTIONS.md)
2. ✅ Understand what files are critical
3. ✅ Test build locally: `npm run build`
4. ✅ Verify redirects still work after changes

## Common Tasks

### Add a New Page
Create `src/pages/new-page.astro` - Astro auto-routes it to `/new-page`

### Update Redirects
Edit `_redirects` file (format: `path status-code destination`)

### Change Domain
Update `site: 'https://mezcalomano.com'` in `astro.config.mjs`

### Set Environment Variables
Cloudflare Dashboard → Pages → Project → Settings → Environment Variables

### Deploy Changes
1. Commit changes
2. Push to `main` branch
3. Cloudflare auto-deploys

---

**Full documentation**: [CONNECTIONS.md](CONNECTIONS.md)
