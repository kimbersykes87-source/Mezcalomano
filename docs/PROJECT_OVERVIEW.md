# Mezcalómano Project Overview

## Project Description

Production-ready, mobile-first marketing website for Mezcalómano, built with Next.js. Features an interactive agave species directory, full-bleed hero images, dark theme design, and integration with Shopify and social media.

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Deployment**: Vercel
- **Node.js**: 20+ (see `package.json` engines)
- **Styling**: Global CSS + component CSS; Tailwind (v4) used for directory and map pages only

## Site Structure

### Pages

1. **Home** (`/`) — Full-screen hero with CTA to buy the Discovery Deck
2. **About** (`/about`) — Project mission and information
3. **Directory** (`/directory`) — Swipeable species cards, search; data from Supabase; `/directory/[slug]` for species detail
4. **Map** (`/map`) — MapLibre Mexico state map with species by state; links to directory
5. **Contact** (`/contact`) — Contact form with Cloudflare Turnstile

### App Router Structure

- `src/app/layout.tsx` — Root layout (metadata, JSON-LD graph, Header, Footer, fonts)
- `src/app/sitemap.ts` — Dynamic `/sitemap.xml` (static routes + Supabase species URLs via `species-list-server`)
- `src/app/page.tsx` — Home
- `src/app/about/page.tsx` — About
- `src/app/directory/page.tsx` — Directory list (renders `DirectoryClient`)
- `src/app/directory/[slug]/page.tsx` — Species detail (server: `generateMetadata`, fetch; renders `SpeciesDetailClient`)
- `src/app/directory/[slug]/SpeciesDetailClient.tsx` — Client UI for detail card + matrix image resolution
- `src/app/contact/page.tsx` — Contact
- `src/app/map/page.tsx` — Map (MapLibre, Supabase)
- `src/app/api/contact/route.ts` — POST handler for contact form

### Components

- `Header.tsx` — Fixed nav with logo, desktop links, mobile burger, shop link
- `Footer.tsx` — Social links (Instagram, TikTok), copyright
- `MobileNav.tsx` — Full-screen mobile menu overlay
- `Hero.tsx` — Reusable hero (title, subtitle, responsive images, optional CTA)
- `JsonLd.tsx` — `application/ld+json` script helper
- `ContactForm.tsx` — Contact form with Turnstile and validation
- Directory/Map: `SwipeableCardStack.tsx`, `SpeciesCard.tsx`, `KeyCard.tsx`, `SearchOverlay.tsx`

## Design System

### Colors

```css
--color-dark: #272926      /* Background */
--color-olive: #7B815C     /* Primary accent, buttons */
--color-yellow: #A29037    /* Secondary accent */
--color-terracotta: #B86744 /* Hover states */
--color-white: #FFFFFF     /* Text */
```

### Typography

- **Font**: Open Sans Condensed (Google Fonts)
- **Base size**: 16px
- **Headings**: Responsive clamp() scaling

### Spacing Scale (4px base)

- `--space-1` through `--space-16` (see `src/styles/global.css`)

### Border Radius

- `--radius-sm`, `--radius-md`, `--radius-lg`

## Assets

### Logos and Icons

- **Public**: `public/assets/brand/logos/`, `public/assets/ui/icons/`
- **Header logo**: `mezcalomano_lockup_stacked_dark.svg`
- **Icons**: burger, close, shopping basket, etc.

### Hero Images

- **Location**: `public/assets/photos/`
- **Naming**: `home_hero_*`, `about_hero_*`, `directory_hero_*` (mobile, tablet, desktop variants)
- **Format**: PNG; used via `<picture>` in `Hero.tsx`

### Matrix Cards (directory images)

- **Location**: `public/assets/matrix/cards/` — PNG card art + `index.json` (manifest keyed by `common_name`)
- **Source workflow**: Raw exports in `source/agave_images/` → `npm run normalize:agave-images` (slug filenames from deck log) → `npm run sync:agave-matrix` (copy + regenerate `index.json` from `data/Species_Final - Website.csv`)
- **Legacy / print pipeline**: `npm run build:matrix-cards` produces WebP from TIFFs; `npm run sync:matrix-cards` pulls from Dropbox SPECIES folder (see [MATRIX_CARDS_PIPELINE.md](MATRIX_CARDS_PIPELINE.md))
- **Data**: `src/data/matrix.json` is optional for older tooling; the live directory resolves images via `index.json` and Supabase text fields

## External Integrations

### Shopify

- **Store**: https://shop.mezcalomano.com
- **Redirects**: `/buy` → Discovery Deck product; `/shop` → store (in `next.config.ts`)
- **Links**: Header basket, mobile nav “SHOP”, home CTA

### Social Media

- **Instagram**: https://www.instagram.com/mezcalomano/
- **TikTok**: https://www.tiktok.com/@mezcalomano
- **Location**: Footer

### Map

- **External**: https://map.mezcalomano.com (legacy / other surface)
- **Internal**: `/map` — full **MapLibre** Mexico states map; species from Supabase; popups link to **`/directory/{slug}`** via **`speciesDirectorySlug`**

### Contact Form

- **Cloudflare Turnstile**: Bot protection; keys in Vercel env and `.env.local`
- **API**: `src/app/api/contact/route.ts` (validation, Turnstile verify, placeholder response)

## Build and Deployment

### Local

```bash
npm run dev          # http://localhost:3000
npm run build        # Production build (.next)
npm run start        # Run production build locally
npm run lint         # ESLint
```

### Production (Vercel)

- **Trigger**: Push to `main` (or PR for preview)
- **Build**: `npm run build`
- **Domain**: mezcalomano.com (DNS in Cloudflare, points to Vercel)

## File Organization

```
src/
├── app/                 # App Router
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home
│   ├── about/
│   ├── directory/       # page, layout, [slug], DirectoryClient
│   ├── contact/
│   ├── map/
│   └── api/contact/     # Contact form API
├── components/          # React components (incl. directory/map)
├── data/                # matrix.json (build pipeline)
├── lib/                 # supabase, slug, site-seo, map-utils, matrix-card-urls (+ server OG), species-detail-server, species-list-server
├── types/               # species.ts
├── scripts/             # build-matrix-cards, etc.
└── styles/              # global.css, components.css

public/                  # Static assets
├── assets/
│   ├── brand/
│   ├── ui/
│   ├── photos/
│   ├── icons/
│   ├── matrix/
│   └── og/
├── llms.txt             # Agent-oriented site summary (optional for crawlers/tools)
└── (favicon, robots, etc.; sitemap is App Router `src/app/sitemap.ts`)
```

## Key Features

### Directory Page

- **Data**: Supabase `species` table (see `src/types/species.ts`); optional `slug` column for direct lookups (see `supabase/migrations/`)
- **Swipeable cards**: KeyCard + SpeciesCard; swipe, prev/next controls, or arrow keys
- **Search / jump**: In-page search and species `<select>` on `DirectoryClient`
- **Detail**: `/directory/[slug]` — server `generateMetadata` + Open Graph/Twitter (matrix card image or default OG); **BreadcrumbList** JSON-LD; client `SpeciesDetailClient` for the card. Links use DB `slug` when present (`speciesDirectorySlug` in `src/lib/slug.ts`).
- **Matrix aliases**: `COMMON_NAME_ALIASES` in `src/lib/matrix-card-urls.ts` is minimal (legacy spellings only, e.g. `Tepeztate` → `Tepextate`); lookups `.trim()` `common_name`.

### Mobile Navigation

- Burger opens overlay; close via X, overlay tap, or Escape
- Links close overlay on click

### Hero Sections

- Responsive `<picture>` (mobile / tablet / desktop)
- Optional standalone mode (home); optional CTA children

## Documentation Index

- **[README.md](../README.md)** — Quick start, overview, env vars
- **[CONNECTIONS.md](../CONNECTIONS.md)** — All external connections and config
- **[AGENT_HANDOFF.md](AGENT_HANDOFF.md)** — Agents: secrets storage, update playbooks, file map
- **[QUICK_REFERENCE.md](../QUICK_REFERENCE.md)** — Commands and critical files
- **[docs/deploy/SETUP_CHECKLIST.md](deploy/SETUP_CHECKLIST.md)** — First-time Vercel setup
- **[docs/deploy/vercel.md](deploy/vercel.md)** — Vercel deployment details
- **[docs/deploy/DOMAIN_CLOUDFLARE_VERCEL.md](deploy/DOMAIN_CLOUDFLARE_VERCEL.md)** — Domain + Cloudflare DNS
- **[docs/MATRIX_CARDS_PIPELINE.md](MATRIX_CARDS_PIPELINE.md)** — Matrix card build script

---

Last updated: 2026-04-05
