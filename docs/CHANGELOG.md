# Changelog

All notable changes to the Mezcalómano marketing site project.

## [2026-01-26] - Production Launch

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
- Created `docs/PROJECT_OVERVIEW.md` - Complete project overview
- Updated `README.md` - Added features, design system, external links
- Updated `CONNECTIONS.md` - Added social media and shop integration details
- Updated `QUICK_REFERENCE.md` - Added social media URLs
- Updated `docs/deploy/cloudflare-pages.md` - Node version pinning
- Updated `docs/troubleshooting/astro-client-directives.md` - Last updated date

## [2026-01-15] - Initial Setup

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

For detailed technical information, see:
- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md)
- [CONNECTIONS.md](../CONNECTIONS.md)
- [README.md](../README.md)
