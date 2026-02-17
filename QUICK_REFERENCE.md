# Quick Reference Guide

**For detailed documentation, see [CONNECTIONS.md](CONNECTIONS.md)**

## Critical Files (Never Delete)

- `next.config.ts` - Redirects and Next.js config
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript and path alias `@/*` → `src/*`
- `src/app/layout.tsx` - Root layout and metadata

## Key Connections

| Connection | Location | Details |
|------------|----------|---------|
| **GitHub** | Vercel Dashboard | Auto-deploys from `main` branch |
| **Vercel** | vercel.com | Hosting and builds (Next.js) |
| **Domain** | Cloudflare DNS | mezcalomano.com points to Vercel |
| **Redirects** | `next.config.ts` | `/buy`, `/shop` → Shopify; `/matrix` → `/directory` |
| **Environment variables** | Vercel Dashboard + `.env.local` | Turnstile keys for contact form |

## Important URLs

- **Repository**: https://github.com/kimbersykes87-source/Mezcalomano
- **Live site**: https://mezcalomano.com
- **Shopify store**: https://shop.mezcalomano.com
- **Instagram**: https://www.instagram.com/mezcalomano/
- **TikTok**: https://www.tiktok.com/@mezcalomano
- **Map**: https://map.mezcalomano.com (external)
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Cloudflare Dashboard** (DNS): https://dash.cloudflare.com/

## Quick Commands

```bash
npm install          # Install dependencies
npm run dev          # Local development (http://localhost:3000)
npm run build        # Production build
npm run start        # Run production build locally
npm run lint         # Run ESLint
npm run build:matrix-cards   # Build matrix card images from TIFFs
```

## Before Making Changes

1. Read [CONNECTIONS.md](CONNECTIONS.md)
2. Understand critical files and redirects
3. Test build locally: `npm run build`
4. Verify redirects after deployment if you change `next.config.ts`

## Common Tasks

### Add a new page

Create `src/app/your-page/page.tsx` — App Router maps it to `/your-page`.

### Update redirects

Edit `next.config.ts` — add or change entries in the `redirects` array.

### Set environment variables

- **Vercel**: Project → Settings → Environment Variables
- **Local**: `.env.local` (copy from `.env.example`)

### Deploy changes

1. Commit and push to `main`
2. Vercel auto-deploys
3. For custom domain/DNS: see [docs/deploy/DOMAIN_CLOUDFLARE_VERCEL.md](docs/deploy/DOMAIN_CLOUDFLARE_VERCEL.md)

### Connect or fix domain (mezcalomano.com)

See [docs/deploy/DOMAIN_CLOUDFLARE_VERCEL.md](docs/deploy/DOMAIN_CLOUDFLARE_VERCEL.md) — add domain in Vercel, then add/update DNS records in Cloudflare.

---

**Full documentation**: [CONNECTIONS.md](CONNECTIONS.md)  
**Deployment**: [docs/deploy/SETUP_CHECKLIST.md](docs/deploy/SETUP_CHECKLIST.md) | [docs/deploy/vercel.md](docs/deploy/vercel.md)
