# Vercel Deployment Guide

This document describes how to deploy the Mezcalómano Next.js website to Vercel.

## Build Configuration

| Setting | Value |
|---------|-------|
| Framework preset | Next.js |
| Build command | `npm run build` |
| Output directory | (default `.next`) |
| Install command | `npm install` |

## Environment Variables

Set in Vercel: Project Settings → Environment Variables.

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | For contact form | Cloudflare Turnstile site key (public) |
| `TURNSTILE_SECRET_KEY` | For contact form | Cloudflare Turnstile secret key (server-only) |

## Deployment Workflow

1. Connect the GitHub repository to Vercel.
2. Vercel will detect Next.js and use the default build command.
3. Add production domain `mezcalomano.com` in Vercel project settings.
4. Push to `main` (or your production branch) to trigger deployments.
5. Preview deployments are created for pull requests.

## Redirects

Redirects are configured in `next.config.ts`:

- `/buy` → 302 → Shopify Discovery Deck product
- `/shop` → 302 → Shopify store
- `/matrix`, `/matrix/` → 301 → `/directory`

No additional Vercel redirect config is required unless you need more rules.

## Custom domain (mezcalomano.com)

The domain is hosted on **Cloudflare**. To connect it to Vercel:

1. Add the domain in Vercel (Settings → Domains).
2. Update DNS records in Cloudflare as Vercel instructs (use **DNS only** for those records).
3. See **[DOMAIN_CLOUDFLARE_VERCEL.md](DOMAIN_CLOUDFLARE_VERCEL.md)** for the full step-by-step.
