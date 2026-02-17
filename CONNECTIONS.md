# Project Connections Documentation

This document explains all external connections and configurations for the Mezcalómano marketing site. Use this as a reference when working with the project.

## Table of Contents

1. [GitHub Repository](#github-repository)
2. [Vercel Deployment](#vercel-deployment)
3. [Configuration Files](#configuration-files)
4. [Environment Variables](#environment-variables)
5. [Redirects](#redirects)
6. [Domain and DNS (Cloudflare)](#domain-and-dns-cloudflare)
7. [Verification Checklist](#verification-checklist)
8. [External Links](#external-links)

---

## GitHub Repository

### Repository Details

- **URL**: `https://github.com/kimbersykes87-source/Mezcalomano`
- **Default branch**: `main`
- **Connection**: Git integration via Vercel

### How It Works

1. The repository is connected to Vercel in the Vercel dashboard.
2. Pushing to `main` triggers an automatic build and deployment.
3. Preview deployments are created for pull requests.

### To Connect or Reconnect

1. Vercel Dashboard → Add New → Project (or Settings → Git).
2. Import from GitHub and select `kimbersykes87-source/Mezcalomano`.
3. Choose production branch: `main`.

---

## Vercel Deployment

### Deployment Configuration

The site is deployed on **Vercel** with the following settings:

- **Framework**: Next.js (auto-detected)
- **Build command**: `npm run build`
- **Output**: `.next` (default; no custom output directory)
- **Install command**: `npm install`
- **Node version**: 20+ (see `package.json` engines)

### Key Configuration Files

#### `next.config.ts`

Redirects and Next.js configuration:

```typescript
const nextConfig: NextConfig = {
  redirects: async () => [
    { source: "/buy", destination: "https://shop.mezcalomano.com/products/discovery-deck", permanent: false },
    { source: "/shop", destination: "https://shop.mezcalomano.com", permanent: false },
    { source: "/matrix", destination: "/directory", permanent: true },
    { source: "/matrix/", destination: "/directory", permanent: true },
  ],
};
```

#### `package.json`

- **Scripts**: `dev`, `build`, `start`, `lint`, `build:matrix-cards`, `build:og-icon-png`
- **Dependencies**: `next`, `react`, `react-dom`, `papaparse` (for matrix pipeline)

### Build and Deploy Flow

1. Push code to `main` (or open a PR for a preview).
2. Vercel runs `npm install` and `npm run build`.
3. Next.js builds the app; static pages are prerendered where possible.
4. Site is served at the Vercel URL and any custom domains (e.g. mezcalomano.com).

---

## Environment Variables

### Contact Form: Cloudflare Turnstile

The contact form uses **Cloudflare Turnstile**. Set these in **Vercel** (Project → Settings → Environment Variables) and in local **`.env.local`** for development:

| Variable | Purpose | Where used | Required |
|----------|---------|------------|----------|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key (public) | Contact form widget (client) | Yes, for contact form |
| `TURNSTILE_SECRET_KEY` | Turnstile secret key (server) | `src/app/api/contact/route.ts` | Yes, for contact form |

- **Production / Preview**: Vercel → Project → Settings → Environment Variables. Add both; enable for Production and Preview.
- **Local**: Copy `.env.example` to `.env.local` and fill in values. Never commit `.env` or `.env.local`.

### Access in Code

- **Client**: `process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY` (only `NEXT_PUBLIC_*` are exposed to the browser).
- **Server (API route)**: `process.env.TURNSTILE_SECRET_KEY` in `src/app/api/contact/route.ts`.

### Optional / Legacy

| Variable | Purpose |
|----------|---------|
| `MAILCHANNELS_API_KEY` | Optional; for future email sending from contact form |

---

## Redirects

Redirects are configured in **`next.config.ts`** (not in a file like `_redirects`). No extra Vercel redirect config is needed unless you add more rules.

### Current Redirects

| Source | Destination | Type |
|--------|-------------|------|
| `/buy` | https://shop.mezcalomano.com/products/discovery-deck | 302 (temporary) |
| `/shop` | https://shop.mezcalomano.com | 302 (temporary) |
| `/matrix` | `/directory` | 301 (permanent) |
| `/matrix/` | `/directory` | 301 (permanent) |

### Testing

After deployment, verify:

- `https://mezcalomano.com/buy` → Shopify Discovery Deck product
- `https://mezcalomano.com/shop` → Shopify store
- `https://mezcalomano.com/matrix` → redirects to `/directory`

---

## Domain and DNS (Cloudflare)

### Primary Domain

- **Domain**: `mezcalomano.com` (and optionally `www.mezcalomano.com`)
- **DNS**: Hosted with **Cloudflare**. DNS records point to Vercel; the site is built and served by Vercel.
- **SSL**: Issued and managed by Vercel when the domain is added in Vercel and DNS is correct.

### How It Works

1. **Vercel**: You add `mezcalomano.com` and `www.mezcalomano.com` in Project → Settings → Domains. Vercel shows which DNS records to create.
2. **Cloudflare**: In the Cloudflare zone for `mezcalomano.com`, you add the records Vercel specifies (typically A and/or CNAME to Vercel’s targets). Use **DNS only** (grey cloud) for those records so Vercel can verify and issue SSL.
3. **Shop**: `shop.mezcalomano.com` points to Shopify via Cloudflare DNS (separate from this project).

### Step-by-Step

See **[docs/deploy/DOMAIN_CLOUDFLARE_VERCEL.md](docs/deploy/DOMAIN_CLOUDFLARE_VERCEL.md)** for the full walkthrough (adding domain in Vercel, then updating DNS in Cloudflare).

---

## Configuration Files

### Critical Files (Do Not Delete)

```
├── next.config.ts       # Redirects and Next.js config
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript and path alias @/* → src/*
├── src/
│   └── env.d.ts         # Optional; env types
└── .gitignore           # Includes .next, .env.local
```

### Important Directories

```
├── src/
│   ├── app/             # App Router: layout, pages, api
│   ├── components/      # React components
│   ├── data/            # matrix.json etc.
│   ├── scripts/         # build-matrix-cards etc.
│   └── styles/          # global.css, components.css
├── public/              # Static assets (favicons, assets/*)
└── docs/                # Documentation
```

---

## Verification Checklist

Use this to verify connections:

### GitHub

- [ ] Repository exists at `https://github.com/kimbersykes87-source/Mezcalomano`
- [ ] Vercel project is connected to this repo
- [ ] Pushing to `main` triggers a deployment

### Vercel

- [ ] Build command: `npm run build` (or default)
- [ ] Framework: Next.js
- [ ] Custom domains: `mezcalomano.com` (and `www` if used) added and valid
- [ ] Environment variables: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` set for Production (and Preview if needed)

### Configuration

- [ ] `next.config.ts` contains redirects for `/buy`, `/shop`, `/matrix`
- [ ] `package.json` has scripts `dev`, `build`, `start`
- [ ] Local `.env.local` has Turnstile keys for `npm run dev`

### Redirects

- [ ] `/buy` redirects to Shopify product
- [ ] `/shop` redirects to Shopify store
- [ ] `/matrix` and `/matrix/` redirect to `/directory`

### Build and Site

- [ ] `npm run build` succeeds locally
- [ ] Site is accessible at `https://mezcalomano.com` (after DNS and domain setup)
- [ ] Contact form loads and Turnstile widget appears (if keys are set)

---

## External Links

### Important URLs

- **GitHub**: https://github.com/kimbersykes87-source/Mezcalomano
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Cloudflare Dashboard** (DNS): https://dash.cloudflare.com/
- **Live site**: https://mezcalomano.com
- **Shop**: https://shop.mezcalomano.com
- **Instagram**: https://www.instagram.com/mezcalomano/
- **TikTok**: https://www.tiktok.com/@mezcalomano
- **Map** (external): https://map.mezcalomano.com

### Key Commands

```bash
npm install          # Install dependencies
npm run dev          # Local dev (http://localhost:3000)
npm run build        # Production build
npm run start        # Run production build locally
npm run lint         # Run ESLint
```

---

## For New Developers / Agents

When starting work on this project:

1. **Clone**: `git clone https://github.com/kimbersykes87-source/Mezcalomano.git`
2. **Install**: `npm install`
3. **Read this file** and [README.md](README.md) to understand connections and setup.
4. **Env**: Copy `.env.example` to `.env.local` and add Turnstile keys for the contact form.
5. **Run**: `npm run dev` and open http://localhost:3000.
6. **Build**: `npm run build` to ensure the project builds.
7. **Deploy**: Push to `main`; Vercel deploys automatically. Set env vars in Vercel if not already set.

**Remember:**

- Redirects live in `next.config.ts`, not in a `_redirects` file.
- Domain DNS is in Cloudflare; the app is hosted on Vercel.
- Environment variables are set in Vercel (and in `.env.local` for local dev).

---

## Social and Shop Integration

### Social (Footer)

- **Instagram**: https://www.instagram.com/mezcalomano/ — `src/components/Footer.tsx`
- **TikTok**: https://www.tiktok.com/@mezcalomano — `src/components/Footer.tsx`

### Shop

- **Store**: https://shop.mezcalomano.com
- **Locations**: Header (basket icon), MobileNav (“SHOP” link), Home hero CTA (“BUY THE DISCOVERY DECK” → `/buy`).
- **Redirects**: `/buy` and `/shop` configured in `next.config.ts`.

---

Last updated: 2026-02-17
