# Mezcalómano Marketing Site

Production-ready, mobile-first Next.js website for deployment on Vercel. Features an interactive agave species directory, full-bleed hero images, and elegant dark theme design.

## Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Run production server locally
npm run build:matrix-cards  # Build matrix card images from TIFFs
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

Copy `.env.example` to `.env.local` and fill in values. On Vercel, set these in Project Settings → Environment Variables. The directory and map pages require a Supabase `species` table compatible with the app’s Species type (see `src/types/species.ts`).

## Site Features

- **6 Pages**: Home, About, Directory, Directory species detail (`/directory/[slug]`), Contact, Map
- **Interactive Directory**: Swipeable species cards, search, and detail pages; data from Supabase
- **Interactive Map**: MapLibre Mexico state map with species by state and links to directory
- **Full-Bleed Hero Images**: Responsive heroes (mobile/tablet/desktop) on Home, About, etc.
- **Mobile-First Design**: Responsive layout
- **Dark Theme**: Elegant `#272926` background with `#FFFFFF` text
- **Open Sans Condensed**: Google Fonts typography
- **Social Links**: Instagram and TikTok in footer

## Matrix Card Asset Pipeline

The `build:matrix-cards` script processes print-ready TIFF files into web-optimized WebP card images.

### Usage

```bash
npm run build:matrix-cards
```

### Output

- **Location**: `public/assets/matrix/cards/`
- **Data**: The build script outputs to this folder; the live directory uses **Supabase** (see Environment Variables). `src/data/matrix.json` is used by the pipeline if you sync it with the generated manifest.

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
