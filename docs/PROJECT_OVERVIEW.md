# Mezcalómano Project Overview

## Project Description

Production-ready, mobile-first marketing website for Mezcalómano, featuring an interactive agave species matrix, elegant dark theme design, and seamless integration with Shopify store and social media.

## Technology Stack

- **Framework**: Astro 4.15.0
- **Adapter**: @astrojs/cloudflare 11.0.0
- **Deployment**: Cloudflare Pages
- **Node.js**: 22.16.0 (pinned)
- **TypeScript**: 5.4.5
- **Build Tool**: Vite (via Astro)

## Site Structure

### Pages

1. **Home** (`/`) - Full-screen hero with CTA to shop
2. **About** (`/about`) - Project mission and information
3. **Matrix** (`/matrix`) - Interactive species browser with 40 agave species
4. **Map** (`/map`) - Coming soon page with external link
5. **Contact** (`/contact`) - Contact form with Turnstile placeholder

### Components

- `Header.astro` - Fixed navigation with logo and menu
- `Footer.astro` - Logo, email, and social links
- `MobileNav.astro` - Full-screen mobile menu overlay
- `MatrixCard.astro` - Individual species card
- `MatrixDrawer.astro` - Species detail drawer
- `ContactForm.astro` - Contact form with validation

### Layouts

- `BaseLayout.astro` - Global layout with meta tags, favicons, and Open Graph

## Design System

### Colors

```css
--color-dark: #272926      /* Background */
--color-olive: #7B815C    /* Primary accent, buttons */
--color-yellow: #A29037   /* Secondary accent */
--color-terracotta: #B86744 /* Hover states */
--color-white: #FFFFFF     /* Text */
```

### Typography

- **Font Family**: Open Sans (variable font)
- **Weights**: 300-800 (light to extra bold)
- **Base Size**: 16px
- **Headings**: Responsive clamp() scaling

### Spacing Scale

4px base unit:
- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-6`: 24px
- `--space-8`: 32px
- `--space-12`: 48px
- `--space-16`: 64px

### Border Radius

- `--radius-sm`: 4px
- `--radius-md`: 8px
- `--radius-lg`: 12px

## Assets

### Logos

- **Header/Footer**: `assets/brand/logos/mezcalomano_lockup_stacked_dark.svg`
- **Icon**: `assets/brand/logos/mezcalomano_icon_white.svg`

### Icons

Located in `assets/ui/icons/`:
- `icon_burger.svg` - Mobile menu toggle
- `icon_close.svg` - Close buttons
- `icon_search.svg` - Search input
- `icon_filter.svg` - Filter UI
- `icon_chevron_right.svg` - Navigation
- `icon_external_link.svg` - External links

### Photos

Hero images in `assets/photos/`:
- `home_hero_01_1600w.webp` - Home page
- `about_01_1600w.webp` - About page
- `matrix_01_1600w.webp` - Matrix page
- `contact_01_1600w.webp` - Contact page

### Matrix Cards

- **Location**: `public/assets/matrix/cards/`
- **Format**: WebP (400×560 and 800×1120)
- **Data**: `src/data/matrix.json`
- **Count**: 40 species

## External Integrations

### Shopify

- **Store URL**: https://shop.mezcalomano.com
- **Integration**: Direct links in navigation and CTAs
- **Redirects**: `/buy` and `/shop` routes (via `_redirects`)

### Social Media

- **Instagram**: https://www.instagram.com/mezcalomano/
- **TikTok**: https://www.tiktok.com/@mezcalomano
- **Location**: Footer social icons

### Map

- **External URL**: https://map.mezcalomano.com
- **Internal Route**: `/map` (coming soon page)

## Build Process

### Local Development

```bash
npm run dev          # Start dev server (http://localhost:4321)
npm run build        # Production build
npm run preview      # Preview production build
npm run check        # Type checking
```

### Production Build

1. Runs `astro build`
2. Generates static HTML in `dist/`
3. Creates Cloudflare Workers functions (if needed)
4. Copies `_redirects` to `dist/`
5. Optimizes images (WebP/AVIF)

### Deployment

- **Trigger**: Push to `main` branch
- **Platform**: Cloudflare Pages
- **Build Command**: `npm run build`
- **Output**: `dist/` directory

## Key Features

### Matrix Page

- **Search**: Filters by common name, scientific name, one-liner
- **Habitat Filter**: Chip-based filter with "All" reset
- **Card Grid**: Responsive 2/3/4 column layout
- **Detail Drawer**: Slide-up (mobile) / slide-in (desktop)
- **Lazy Loading**: Images load on demand

### Mobile Navigation

- **Burger Menu**: Right-aligned toggle button
- **Full-Screen Overlay**: Dark overlay with large tap targets
- **Close Button**: Top-right X icon
- **Keyboard Support**: ESC key closes menu

### Hero Sections

- **Full-Bleed Images**: Background images with gradient overlay
- **Text Overlay**: White text with shadow for readability
- **Responsive Heights**: Full-screen (home) / 50vh (pages)

## File Organization

```
src/
├── components/        # Reusable components
├── layouts/          # Page layouts
├── pages/            # Route pages
│   ├── api/          # API routes
│   └── *.astro       # Page files
├── data/             # JSON data files
├── scripts/          # Build scripts
└── styles/           # CSS files
    ├── global.css    # Global styles, variables
    └── components.css # Component styles

assets/               # Source assets (not in public)
├── brand/            # Logos
├── photos/           # Hero images
└── ui/               # Icons

public/               # Static assets (copied to dist)
├── assets/           # Public assets
│   ├── favicon/     # Favicons
│   ├── icons/        # Social icons
│   └── matrix/       # Matrix card images
└── data/             # Public data files
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile-first responsive design
- Progressive enhancement
- No JavaScript required for basic navigation

## Performance

- **Image Optimization**: WebP/AVIF formats
- **Lazy Loading**: Matrix card images
- **Code Splitting**: Automatic via Astro
- **Font Loading**: `font-display: swap`
- **Minification**: Automatic in production

## Accessibility

- Semantic HTML
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus states on all interactive elements
- Alt text on images

## SEO

- Open Graph meta tags
- Canonical URLs
- Sitemap (`public/sitemap.xml`)
- Robots.txt (`public/robots.txt`)
- Meta descriptions on all pages

---

Last updated: 2026-01-26
