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

## Important Documentation

**📖 [CONNECTIONS.md](CONNECTIONS.md)** - Complete guide to all external connections (GitHub, domains, redirects, environment variables). **Read this first** to understand the project setup.

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

For the contact form (Cloudflare Turnstile):

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` - Public site key (client)
- `TURNSTILE_SECRET_KEY` - Secret key (API route only)

Copy `.env.example` to `.env.local` and fill in values. On Vercel, set these in Project Settings → Environment Variables.

## Site Features

- **5 Pages**: Home, About, Directory, Contact, Map (coming soon)
- **Interactive Directory**: Browse agave species with search; click cards for details
- **Full-Bleed Hero Images**: Responsive heroes (mobile/tablet/desktop)
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
- **Data**: `src/data/matrix.json` (species and image paths)

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
- **Map**: https://map.mezcalomano.com (external)
