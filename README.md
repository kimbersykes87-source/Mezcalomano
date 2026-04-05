# Mezcalómano Marketing Site

Production-ready, mobile-first Next.js website for deployment on Vercel. Features an interactive agave species directory, full-bleed hero images, and elegant dark theme design.

## Quick Start

**Local UX/UI work:** after `npm install`, copy `.env.local.example` → `.env.local`, add Supabase `NEXT_PUBLIC_*` keys, then `npm run dev`. Step-by-step: **[docs/LOCAL_DEV.md](docs/LOCAL_DEV.md)**.

```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Run production server locally
npm run build:matrix-cards  # Build matrix card images from TIFFs
npm run build:hero-webp     # Encode home/about hero PNGs → WebP (same folder; used by Hero `<picture>`)
npm run upload:species-cards-webp  # PNG matrix cards → WebP → Supabase `species-cards` bucket; updates DB + index.json (needs SUPABASE_SERVICE_ROLE_KEY)
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
| **[docs/AGENT_HANDOFF.md](docs/AGENT_HANDOFF.md)** | **Agents / maintainers:** where keys live (never in Git), CSV vs migrations vs images, file map, verification. |
| **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** | Commands, critical files, URLs. |
| **[docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)** | Stack, structure, design system, assets. |
| **[docs/LOCAL_DEV.md](docs/LOCAL_DEV.md)** | **Local dev:** env vars, `npm run dev`, UI file map, troubleshooting. |
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
- **Deployment**: Vercel (GitHub repo connected; **push `main`** triggers build — no Vercel tokens in `.env`; set env vars in the Vercel dashboard)
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

Copy **`.env.local.example`** to **`.env.local`** and fill in values (see [CONNECTIONS.md](CONNECTIONS.md) and [docs/AGENT_HANDOFF.md](docs/AGENT_HANDOFF.md) for where each key is used). On Vercel, set the `NEXT_PUBLIC_*` Supabase and Turnstile variables in Project Settings → Environment Variables — the same Supabase URL and anon key are used **on the server** for species **`generateMetadata`** (Open Graph / Twitter) on `/directory/[slug]`, for **`/sitemap.xml`** (dynamic species URLs), and for JSON-LD breadcrumbs on species pages. The directory and map require a Supabase `species` table matching `src/types/species.ts`. Apply migrations (`001`–`008`) via **`npm run supabase:push`** (local, Supabase CLI + `SUPABASE_ACCESS_TOKEN`), then **`npm run seed:species`** so rows (including **`slug`**) stay aligned with **`data/Species_Final - Website.csv`**.

## Site Features

- **6 Pages**: Home, About, Directory, Directory species detail (`/directory/[slug]`), Contact, Map
- **SEO and agents**: Site-wide metadata emphasizes the Discovery Deck (gift / self) and the agave directory as education; **`/sitemap.xml`** is generated by **`src/app/sitemap.ts`**; root layout includes JSON-LD (**Organization**, **WebSite**, **Product** → Shopify); species pages add **BreadcrumbList** JSON-LD; **`/llms.txt`** summarizes the site for AI tools (see [docs/CHANGELOG.md](docs/CHANGELOG.md)).
- **Interactive Directory**: Swipeable species cards (legend + species), search, jump control, prev/next and keyboard; detail pages at `/directory/[slug]` with server-side SEO metadata and OG/Twitter images (matrix card or default); permalinks and map links use DB **`slug`** when set (`speciesDirectorySlug` in `src/lib/slug.ts`); data from Supabase
- **Interactive Map** (`/map`): MapLibre Mexico states; filters (mezcal + state) aligned like the header logo; **mobile**: filters side by side; **state tap** opens a **centered dialog** (dimmed map behind) with links to `/directory/{slug}` via `speciesDirectorySlug`; **`public/geo/mexico-states.geojson`** for outlines
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
