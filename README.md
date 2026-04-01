# Mezcalómano Marketing Site

Production-ready, mobile-first Next.js website for deployment on Vercel. Features an interactive agave species directory, full-bleed hero images, and elegant dark theme design.

## Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Run production server locally
npm run build:matrix-cards  # Build matrix card images from TIFFs
npm run sync:matrix-cards   # Sync matrix cards from SPECIES artwork folder
npm run seed:species        # Upsert Supabase `species` from Website CSV (requires env vars)
npm run normalize:agave-images  # Rename source/agave_images PNGs to slug names (see log)
npm run supabase:push           # Link + apply supabase/migrations to hosted DB (needs SUPABASE_ACCESS_TOKEN)
npm run sync:agave-matrix       # Copy slug PNGs → public/assets/matrix/cards + index.json from Website CSV
npm run lint         # Run ESLint
```

## Documentation

| Doc | Description |
|-----|-------------|
| **[CONNECTIONS.md](CONNECTIONS.md)** | External connections (GitHub, Vercel, domain, env vars, redirects). **Read this first.** |
| **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** | Commands, critical files, URLs. |
| **[docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)** | Stack, structure, design system, assets. |
| **[docs/CHANGELOG.md](docs/CHANGELOG.md)** | Version history. |
| **[docs/deploy/SETUP_CHECKLIST.md](docs/deploy/SETUP_CHECKLIST.md)** | First-time Vercel deployment steps. |
| **[docs/deploy/vercel.md](docs/deploy/vercel.md)** | Vercel build config and env vars. |
| **[docs/deploy/DOMAIN_CLOUDFLARE_VERCEL.md](docs/deploy/DOMAIN_CLOUDFLARE_VERCEL.md)** | Connect mezcalomano.com (Cloudflare DNS) to Vercel. |
| **[docs/deploy/cloudflare-pages.md](docs/deploy/cloudflare-pages.md)** | Legacy: previous Astro/Cloudflare Pages setup. |
| **[docs/MATRIX_CARDS_PIPELINE.md](docs/MATRIX_CARDS_PIPELINE.md)** | Matrix card image build script. |
| **[docs/troubleshooting/nextjs.md](docs/troubleshooting/nextjs.md)** | Next.js troubleshooting. |

## Overview

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Site URL**: `https://mezcalomano.com`
- **Shop URL**: `https://shop.mezcalomano.com`
- **Repository**: https://github.com/kimbersykes87-source/Mezcalomano
- **Deployment**: Vercel (connect repo; set env vars)
- **Node Version**: 20+ (see `package.json` engines)

## Key Configuration Files

- `next.config.ts` - Redirects (`/buy`, `/shop`, `/matrix` → `/directory`)
- `src/app/` - App Router pages and layout
- `src/components/` - React components
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript and path alias `@/*` → `src/*`

## Environment Variables

**Contact form (Cloudflare Turnstile):**

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` - Public site key (client)
- `TURNSTILE_SECRET_KEY` - Secret key (API route only)

**Directory and Map (Supabase):**

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous (public) key

Copy **`.env.local.example`** to **`.env.local`** and fill in values (see [CONNECTIONS.md](CONNECTIONS.md) for the full list). On Vercel, set the `NEXT_PUBLIC_*` Supabase and Turnstile variables in Project Settings → Environment Variables. The directory and map pages require a Supabase `species` table compatible with the app’s Species type (see `src/types/species.ts`). Apply migrations under `supabase/migrations/` (`001`–`008`, including `slug` for detail URLs) via **`npm run supabase:push`** (local, with Supabase CLI + token), then run **`npm run seed:species`** so rows get a `slug` matching URL segments.

## Site Features

- **6 Pages**: Home, About, Directory, Directory species detail (`/directory/[slug]`), Contact, Map
- **Interactive Directory**: Swipeable species cards, search and jump-to-species controls, prev/next navigation, and detail pages; data from Supabase
- **Interactive Map**: MapLibre Mexico state map with species by state and links to directory
- **Full-Bleed Hero Images**: Responsive heroes (mobile/tablet/desktop) on Home, About, etc.
- **Mobile-First Design**: Responsive layout
- **Dark Theme**: Elegant `#272926` background with `#FFFFFF` text
- **Open Sans Condensed**: Google Fonts typography
- **Social Links**: Instagram and TikTok in footer

## Matrix Card Asset Pipeline

**Directory card images (slug PNGs in repo)** — After exporting PNGs into `source/agave_images` (and updating `agave_background_removal_log.txt` if names are still deck-encoded), normalize filenames to ASCII slugs and publish to the site:

```bash
npm run normalize:agave-images
npm run sync:agave-matrix
```

Canonical species copy lives in **`data/Species_Final - Website.csv`** (keep `Species_Final - Directory_updated_*.csv` in sync by copying over when you refresh data). `sync:agave-matrix` reads that CSV and matches files like `espadin.png` (same rules as `toSlug(common_name)` in the app).

**Supabase migrations** — Apply SQL in `supabase/migrations/` (e.g. `producer_links`, then `slug`) via the **SQL Editor** if `supabase db push` reports a migration history mismatch with the hosted project. The seed script loads **`.env` then `.env.local`** (local overrides), so `npm run seed:species` works when vars are only in `.env`.

**Sync from deck artwork (Dropbox)** — Copy PNGs from the SPECIES artwork folder and regenerate `index.json`:

```bash
npm run sync:matrix-cards
```

Uses `data/Species_Final - Cards.csv` and sources images from the Dropbox SPECIES folder. See `scripts/sync-matrix-cards-from-species.mjs`.

**Build from TIFFs**: The `build:matrix-cards` script processes print-ready TIFF files into web-optimized WebP card images:

```bash
npm run build:matrix-cards
```

### Output

- **Location**: `public/assets/matrix/cards/`
- **Data**: Card images and `index.json`; the live directory uses **Supabase** (see Environment Variables). `src/data/matrix.json` is used by the TIFF pipeline if you sync it with the generated manifest.

## Design System

### Colors
- **Dark**: `#272926` (background)
- **Olive**: `#7B815C` (accent, buttons)
- **Yellow**: `#A29037` (accent)
- **Terracotta**: `#B86744` (hover states)
- **White**: `#FFFFFF` (text)

### Typography
- **Font**: Open Sans Condensed (Google Fonts)
- **Base Size**: 16px
- **Scale**: Responsive clamp() for headings

## External Links

- **Shop**: https://shop.mezcalomano.com
- **Instagram**: https://www.instagram.com/mezcalomano/
- **TikTok**: https://www.tiktok.com/@mezcalomano
- **Map**: In-app at `/map` (Mexico state map with species links)
