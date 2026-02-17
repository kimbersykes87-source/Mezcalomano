# Changelog

All notable changes to the Mezcalómano marketing site project.

## [2026-02-17] - Directory and map integration, cleanup

### Added

- Directory: Supabase client, Species types, slug and map-utils; swipeable cards (SwipeableCardStack, SpeciesCard, KeyCard, SearchOverlay)
- Directory route: `/directory` (Supabase + search) and `/directory/[slug]` (species detail)
- Map: Full MapLibre Mexico state map with species/state filters and popups linking to directory
- Tailwind v4 for directory and map pages only
- Nav: DIRECTORY and MAP in Header and MobileNav
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (see README and .env.example)
- GeoJSON: `public/geo/mexico-states.geojson` for map

### Removed

- Old directory grid: `DirectoryContent.tsx`, `MatrixCard.tsx`, `MatrixDrawer.tsx` (replaced by Supabase + swipeable directory)

### Changed

- Directory page now fetches from Supabase and renders swipeable cards; no matrix.json in app
- Map page replaced placeholder with full MapLibre map
- Docs: PROJECT_OVERVIEW, MATRIX_CARDS_PIPELINE, README updated (directory uses Supabase; matrix pipeline for assets only)

---

## [2026-02-17] - Migration to Next.js

### Added

- Next.js 16 (App Router) with TypeScript
- Vercel deployment; docs for setup, domain, and Cloudflare DNS
- React components: Header, Footer, MobileNav, Hero, ContactForm, MatrixCard, MatrixDrawer, DirectoryContent
- App Router pages: Home, About, Directory, Contact, Map
- API route: `src/app/api/contact/route.ts` (Turnstile verification, validation)
- Redirects in `next.config.ts`: `/buy`, `/shop` → Shopify; `/matrix` → `/directory`
- ESLint config (eslint.config.mjs) and Next.js-compatible lint script
- Documentation: CONNECTIONS.md, QUICK_REFERENCE.md, PROJECT_OVERVIEW.md, deploy guides (Vercel, domain + Cloudflare), SETUP_CHECKLIST.md, DOMAIN_CLOUDFLARE_VERCEL.md

### Changed

- **Framework**: Astro → Next.js 16 (App Router)
- **Hosting**: Cloudflare Pages → Vercel
- **Domain/DNS**: Domain still on Cloudflare; DNS records point to Vercel
- **Env vars**: `PUBLIC_TURNSTILE_SITE_KEY` → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`; use `process.env` instead of `import.meta.env`
- **Redirects**: From `public/_redirects` to `next.config.ts`
- **Matrix page**: Route renamed to Directory (`/directory`); `/matrix` redirects to `/directory`
- README, CONNECTIONS, QUICK_REFERENCE, PROJECT_OVERVIEW updated for Next.js and Vercel
- Cloudflare Pages deploy doc marked as legacy; Vercel set as current deployment target

### Removed

- Astro: astro.config.mjs, all .astro pages and components, Astro dependencies
- Cloudflare Pages adapter and wrangler-based deployment
- `public/_routes.json` (Cloudflare-specific)
- `src/pages/` (Astro) and `src/layouts/`

### Fixed

- CSS: Replaced Astro `:global(.btn)` with `.page-hero__content .btn` for Next.js compatibility

---

## [2026-01-26] - Production Launch (Astro)

### Added

- Full-bleed hero images with gradient overlay on all pages
- Social media links (Instagram, TikTok) in footer
- Shop button with border styling in header and mobile nav
- External shop links (shop.mezcalomano.com) for all buy CTAs
- Comprehensive project documentation
- Node.js version pinning (22.16.0)
- GitHub Actions CI workflow
- Local Cloudflare-like build simulation script

### Changed

- Updated logo to use `mezcalomano_lockup_stacked_dark.svg`
- Fixed all icon import paths (burger, close, social icons)
- Updated favicon priority to use `app_icon_512.png`
- Hero sections now use full-screen background images
- Shop button styled with solid border for emphasis
- All "Buy Now" buttons link to shop.mezcalomano.com

### Fixed

- Resolved null byte error in Vite path resolution (removed incorrect `client:load` directives)
- Fixed "Unexpected default" esbuild error
- Corrected all asset import paths
- Fixed mobile navigation close icon
- Fixed matrix drawer close icon

### Documentation

- Created docs/PROJECT_OVERVIEW.md
- Updated README.md, CONNECTIONS.md, QUICK_REFERENCE.md
- Updated docs/deploy/cloudflare-pages.md
- Updated docs/troubleshooting/astro-client-directives.md

---

## [2026-01-15] - Initial Setup (Astro)

### Added

- Astro project with Cloudflare Pages adapter
- Base layout with header and footer
- 5 pages: Home, About, Matrix, Map, Contact
- Matrix species browser with search and filtering
- Contact form with Turnstile placeholder
- Mobile navigation overlay
- Matrix card drawer for species details
- Global CSS with brand colors and typography
- Component-specific styles
- Matrix card image pipeline script

### Configuration

- Cloudflare Pages deployment setup
- Shopify redirects (`/buy`, `/shop`)
- TypeScript configuration
- Build scripts and dependencies

---

For current technical details, see:

- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
- [CONNECTIONS.md](../CONNECTIONS.md)
- [README.md](../README.md)
