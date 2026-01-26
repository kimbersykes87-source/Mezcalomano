# Mezcalómano Marketing Site

Production-ready, mobile-first Astro website deployed on Cloudflare Pages. Features an interactive agave species matrix, full-bleed hero images, and elegant dark theme design.

## Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:4321)
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run build:matrix-cards  # Build matrix card images from TIFFs
npm run check        # Type check with Astro
```

## Important Documentation

**📖 [CONNECTIONS.md](CONNECTIONS.md)** - Complete guide to all external connections (GitHub, Cloudflare, domains, redirects, environment variables). **Read this first** to understand the project setup.

## Overview

- **Framework**: Astro 4.15.0 with Cloudflare Pages adapter
- **Site URL**: `https://mezcalomano.com`
- **Shop URL**: `https://shop.mezcalomano.com`
- **Repository**: https://github.com/kimbersykes87-source/Mezcalomano
- **Deployment**: Automatic via Cloudflare Pages on push to `main` branch
- **Node Version**: 22.16.0 (pinned in `.nvmrc`, `.node-version`, and `package.json`)

## Key Configuration Files

- `astro.config.mjs` - Cloudflare adapter and site URL
- `_redirects` - Shopify redirects (`/buy`, `/shop`)
- `config/wrangler.toml` - Cloudflare Workers compatibility
- `package.json` - Dependencies (includes `@astrojs/cloudflare`)
- `.nvmrc` / `.node-version` - Node.js version pinning
- `tsconfig.json` - TypeScript configuration

## Critical Connections

All external connections are documented in **[CONNECTIONS.md](CONNECTIONS.md)**:

- GitHub repository integration
- Cloudflare Pages deployment configuration
- Environment variables setup
- Redirects to Shopify store (`shop.mezcalomano.com`)
- Social media links (Instagram, TikTok)
- Domain configuration
- Build and deployment process

**⚠️ Important**: Before making changes, read [CONNECTIONS.md](CONNECTIONS.md) to understand what files must be preserved.

## Site Features

- **5 Pages**: Home, About, Matrix, Map (coming soon), Contact
- **Interactive Matrix**: Browse 40 agave species with search and habitat filtering
- **Full-Bleed Hero Images**: Immersive background images with text overlay
- **Mobile-First Design**: Responsive layout optimized for Instagram/TikTok traffic
- **Dark Theme**: Elegant `#272926` background with `#FFFFFF` text
- **Open Sans Typography**: Variable font with sensible weight hierarchy
- **Social Links**: Instagram and TikTok integration in footer

## Matrix Card Asset Pipeline

The `build:matrix-cards` script processes 40 print-ready TIFF files into web-optimized WebP card images.

### Usage

```bash
npm run build:matrix-cards
```

### Input Requirements

- **Source folder (primary)**: `C:\Users\kimbe\Desktop\FINAL#\CMYK_JapanColor2001\_PRINT_READY_V4\`
- **Source folder (fallback)**: `source/print_ready_v4/` (if primary is not accessible)
- **Required files**: 40 TIFF files named `{rank}_{suit}_final.tif` where:
  - Ranks: `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `10`, `a`
  - Suits: `clubs`, `diamonds`, `hearts`, `spades`
  - Example: `2_clubs_final.tif`, `10_spades_final.tif`, `a_hearts_final.tif`

### Output

- **Location**: `public/assets/matrix/cards/`
- **Files generated**:
  - 80 WebP files (40 species × 2 sizes: 800×1120 and 400×560)
  - `index.json` manifest with species data and image paths

### Species Data

The script uses `data/species_matrix_v1.csv` which must contain:
- `scientific_name`
- `common_name`
- `one_liner`
- `habitat`
- `height`

The first 40 rows are used, mapped in order to the TIFF files.

## Design System

### Colors
- **Dark**: `#272926` (background)
- **Olive**: `#7B815C` (accent, buttons)
- **Yellow**: `#A29037` (accent)
- **Terracotta**: `#B86744` (hover states)
- **White**: `#FFFFFF` (text)

### Typography
- **Font**: Open Sans (variable font, 300-800 weight range)
- **Base Size**: 16px
- **Scale**: Responsive clamp() for headings

### Components
- **Header**: Fixed top bar with logo and navigation
- **Hero Sections**: Full-bleed background images with gradient overlay
- **Cards**: Portrait cards with rounded corners and shadows
- **Buttons**: Primary filled style with olive background
- **Dividers**: 1px white at 20-30% opacity

## External Links

- **Shop**: https://shop.mezcalomano.com
- **Instagram**: https://www.instagram.com/mezcalomano/
- **TikTok**: https://www.tiktok.com/@mezcalomano
- **Map**: https://map.mezcalomano.com (external)
