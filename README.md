# Mezcalómano Marketing Site

Minimal Astro site deployed on Cloudflare Pages.

## Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run build:matrix-cards  # Build matrix card images from TIFFs
```

## Important Documentation

**📖 [CONNECTIONS.md](CONNECTIONS.md)** - Complete guide to all external connections (GitHub, Cloudflare, domains, redirects, environment variables). **Read this first** to understand the project setup.

## Overview

- **Framework**: Astro with Cloudflare Pages adapter
- **Site URL**: `https://mezcalomano.com`
- **Repository**: https://github.com/kimbersykes87-source/Mezcalomano
- **Deployment**: Automatic via Cloudflare Pages on push to `main` branch

## Key Configuration Files

- `astro.config.mjs` - Cloudflare adapter and site URL
- `_redirects` - Shopify redirects (`/buy`, `/shop`)
- `config/wrangler.toml` - Cloudflare Workers compatibility
- `package.json` - Dependencies (includes `@astrojs/cloudflare`)

## Critical Connections

All external connections are documented in **[CONNECTIONS.md](CONNECTIONS.md)**:

- GitHub repository integration
- Cloudflare Pages deployment configuration
- Environment variables setup
- Redirects to Shopify store
- Domain configuration
- Build and deployment process

**⚠️ Important**: Before making changes, read [CONNECTIONS.md](CONNECTIONS.md) to understand what files must be preserved.

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
