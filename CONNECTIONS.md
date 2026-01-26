# Project Connections Documentation

This document explains all external connections and configurations for the Mezcalómano marketing site. Use this as a reference when working with the project.

## Table of Contents

1. [GitHub Repository Connection](#github-repository-connection)
2. [Cloudflare Pages Deployment](#cloudflare-pages-deployment)
3. [Configuration Files](#configuration-files)
4. [Environment Variables](#environment-variables)
5. [Redirects Configuration](#redirects-configuration)
6. [Domain Configuration](#domain-configuration)
7. [Verification Checklist](#verification-checklist)

---

## GitHub Repository Connection

### Repository Details

- **Repository URL**: `https://github.com/kimbersykes87-source/Mezcalomano`
- **Default Branch**: `main`
- **Connection Type**: Git integration via Cloudflare Pages

### How It Works

1. **Cloudflare Pages Integration**: The repository is connected to Cloudflare Pages through the Cloudflare dashboard
2. **Automatic Deployments**: When code is pushed to the `main` branch, Cloudflare Pages automatically:
   - Detects the push
   - Runs `npm run build`
   - Deploys the output from the `dist` directory
3. **Manual Deployment**: Can also be triggered manually from Cloudflare Pages dashboard

### To Verify Connection

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Pages** → **Mezcalomano** project
3. Check **Settings** → **Builds & deployments**
4. Verify the repository is listed and connected

### To Reconnect (if needed)

1. Cloudflare Dashboard → Pages → Your Project
2. Settings → Builds & deployments
3. Click "Connect to Git" or "Update repository"
4. Authorize Cloudflare to access GitHub
5. Select repository: `kimbersykes87-source/Mezcalomano`
6. Select branch: `main`

---

## Cloudflare Pages Deployment

### Deployment Configuration

The site is deployed on Cloudflare Pages with the following settings:

- **Project Name**: `mezcalomano` (configured in `config/wrangler.toml`)
- **Site URL**: `https://mezcalomano.com` (configured in `astro.config.mjs`)
- **Build Command**: `npm run build` (set in Cloudflare Pages dashboard)
- **Build Output Directory**: `dist` (set in Cloudflare Pages dashboard)
- **Framework Preset**: Astro (auto-detected)

### Key Configuration Files

#### `astro.config.mjs`

This file configures Astro to work with Cloudflare Pages:

```javascript
export default defineConfig({
  output: 'hybrid',              // Enables both static and server-side rendering
  adapter: cloudflare(),         // Uses Cloudflare adapter for deployment
  site: 'https://mezcalomano.com', // Canonical site URL
  // ...
});
```

**Critical Settings:**
- `adapter: cloudflare()` - This connects Astro to Cloudflare Pages
- `site: 'https://mezcalomano.com'` - Sets the canonical domain
- `output: 'hybrid'` - Allows both static and dynamic routes

#### `config/wrangler.toml`

Cloudflare Workers/Pages compatibility configuration:

```toml
name = "mezcalomano"
compatibility_date = "2026-01-14"
```

**Purpose**: Ensures compatibility with Cloudflare Workers runtime

#### `package.json`

Contains the critical dependency:

```json
{
  "dependencies": {
    "@astrojs/cloudflare": "^11.0.0"  // Cloudflare adapter
  }
}
```

**Critical**: This package must remain in dependencies for Cloudflare deployment to work.

---

## Environment Variables

### Required Variables (if using contact form)

These are set in **Cloudflare Pages Dashboard** → **Settings** → **Environment Variables**:

| Variable Name | Purpose | Where Used | Required |
|--------------|---------|------------|----------|
| `PUBLIC_RECAPTCHA_SITE_KEY` | Google reCAPTCHA public key (exposed to browser) | Contact form frontend | If using contact form |
| `RECAPTCHA_SECRET` | Google reCAPTCHA secret key (server-side) | API endpoint verification | If using contact form |
| `MAILCHANNELS_API_KEY` | MailChannels API key (optional) | Email sending | Optional |

### Type Definitions

Environment variable types are defined in `src/env.d.ts`:

```typescript
interface ImportMetaEnv {
  readonly RECAPTCHA_SECRET: string;
  readonly RECAPTCHA_SITE_KEY: string;
  readonly PUBLIC_RECAPTCHA_SITE_KEY?: string;
  readonly MAILCHANNELS_API_KEY?: string;
}
```

### How to Set Environment Variables

1. Go to Cloudflare Dashboard → Pages → Your Project
2. Navigate to **Settings** → **Environment Variables**
3. Add variables for **Production** (and optionally **Preview**)
4. **Important**: After adding/changing variables, you must redeploy:
   - Push a new commit, OR
   - Manually retry the latest deployment

### Accessing Variables in Code

- **Client-side**: Use `import.meta.env.PUBLIC_RECAPTCHA_SITE_KEY` (only `PUBLIC_*` vars are exposed)
- **Server-side**: Use `import.meta.env.RECAPTCHA_SECRET` (all vars available)

---

## Redirects Configuration

### File: `_redirects`

This file is automatically processed by Cloudflare Pages to set up URL redirects.

### Current Redirects

#### Shopify Store Redirects

```
/buy 302 https://shop.mezcalomano.com/products/discovery-deck
/shop 302 https://shop.mezcalomano.com
```

**Purpose**: 
- `/buy` redirects to the Discovery Deck product page on Shopify
- `/shop` redirects to the main Shopify store

**Status Code**: `302` (temporary redirect) - allows changing destination later

#### Legacy Route Redirects

```
/api/* 301 /
/checkout 301 /
/orders 301 /
/webhook/* 301 /
/admin/* 301 /
```

**Purpose**: Redirects old/legacy routes to homepage

**Status Code**: `301` (permanent redirect) - tells search engines these routes are gone

### Redirect Syntax

```
<source-path> <status-code> <destination-url>
```

- **Source path**: Can include wildcards (`*`)
- **Status code**: `301` (permanent) or `302` (temporary)
- **Destination**: Full URL or relative path

### Testing Redirects

After deployment, test:
- `https://mezcalomano.com/buy` → Should redirect to Shopify product
- `https://mezcalomano.com/shop` → Should redirect to Shopify store

---

## Domain Configuration

### Primary Domain

- **Domain**: `mezcalomano.com`
- **Configured in**: `astro.config.mjs` (`site: 'https://mezcalomano.com'`)
- **SSL/TLS**: Automatically managed by Cloudflare

### Subdomain Redirects

- **Shop**: `shop.mezcalomano.com` → Points to Shopify (configured in Cloudflare DNS, not this repo)

### Domain Setup in Cloudflare

1. **DNS Configuration**: Managed in Cloudflare DNS dashboard
2. **SSL/TLS**: Automatically provisioned by Cloudflare
3. **Custom Domain in Pages**: 
   - Cloudflare Dashboard → Pages → Project → **Custom domains**
   - Should show `mezcalomano.com` as connected

---

## File Structure Overview

### Critical Files (DO NOT DELETE)

```
├── astro.config.mjs          # Cloudflare adapter & site URL
├── config/
│   └── wrangler.toml        # Cloudflare Workers compatibility
├── _redirects               # Cloudflare Pages redirects
├── package.json             # Dependencies (includes @astrojs/cloudflare)
├── tsconfig.json            # TypeScript config (required for builds)
├── src/
│   └── env.d.ts            # Environment variable type definitions
└── .gitignore              # Git ignore rules
```

### Public Files

```
├── public/
│   ├── robots.txt          # SEO robots file (references domain)
│   └── sitemap.xml         # SEO sitemap (references domain)
```

### Source Files (Can be modified)

```
├── src/
│   └── pages/
│       └── index.astro     # Main page (can be redesigned)
```

---

## Build Process

### Local Build

```bash
npm install          # Install dependencies
npm run build        # Build for production
```

**Output**: Creates `dist/` directory with:
- Static HTML files
- Cloudflare Workers functions (if any)
- `_redirects` file (copied to dist)
- `_routes.json` (auto-generated by Astro)

### Cloudflare Build

1. Push code to `main` branch
2. Cloudflare Pages detects push
3. Runs `npm run build` in cloud
4. Deploys `dist/` directory
5. Applies `_redirects` rules
6. Site goes live at `mezcalomano.com`

---

## Verification Checklist

Use this checklist to verify all connections are working:

### GitHub Connection
- [ ] Repository exists at `https://github.com/kimbersykes87-source/Mezcalomano`
- [ ] Cloudflare Pages shows repository connected
- [ ] Pushing to `main` triggers automatic deployment

### Cloudflare Pages Configuration
- [ ] Project exists in Cloudflare Pages dashboard
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Framework preset: Astro
- [ ] Custom domain: `mezcalomano.com` connected

### Configuration Files
- [ ] `astro.config.mjs` has `adapter: cloudflare()`
- [ ] `astro.config.mjs` has `site: 'https://mezcalomano.com'`
- [ ] `package.json` includes `@astrojs/cloudflare` dependency
- [ ] `config/wrangler.toml` exists with project name
- [ ] `_redirects` file exists with Shopify redirects

### Environment Variables (if needed)
- [ ] `PUBLIC_RECAPTCHA_SITE_KEY` set in Cloudflare Pages (if using contact form)
- [ ] `RECAPTCHA_SECRET` set in Cloudflare Pages (if using contact form)
- [ ] Variables are set for Production environment

### Redirects
- [ ] `https://mezcalomano.com/buy` redirects to Shopify product
- [ ] `https://mezcalomano.com/shop` redirects to Shopify store
- [ ] Legacy routes redirect to homepage

### Build & Deployment
- [ ] `npm run build` succeeds locally
- [ ] Build creates `dist/` directory
- [ ] `dist/_redirects` file exists
- [ ] Cloudflare Pages deployments succeed
- [ ] Site is accessible at `https://mezcalomano.com`

---

## Troubleshooting

### Build Fails

**Issue**: `npm run build` fails
- **Check**: All dependencies installed (`npm install`)
- **Check**: `@astrojs/cloudflare` is in `package.json`
- **Check**: `astro.config.mjs` has correct adapter configuration

### Deployment Fails

**Issue**: Cloudflare Pages build fails
- **Check**: Build command is `npm run build`
- **Check**: Output directory is `dist`
- **Check**: `package.json` exists and is valid
- **Check**: Cloudflare Pages build logs for specific errors

### Redirects Not Working

**Issue**: Redirects don't work after deployment
- **Check**: `_redirects` file exists in root directory
- **Check**: `_redirects` file is copied to `dist/` after build
- **Check**: Redirect syntax is correct (path, status code, destination)
- **Check**: Cloudflare Pages has processed the file (may need redeploy)

### Environment Variables Not Available

**Issue**: `import.meta.env.VARIABLE_NAME` is undefined
- **Check**: Variable is set in Cloudflare Pages dashboard
- **Check**: Variable name matches exactly (case-sensitive)
- **Check**: Redeployed after adding/changing variable
- **Check**: For client-side: variable must start with `PUBLIC_`

### Domain Not Working

**Issue**: `mezcalomano.com` doesn't load
- **Check**: Custom domain is connected in Cloudflare Pages
- **Check**: DNS records are correct in Cloudflare DNS
- **Check**: SSL/TLS certificate is active (may take a few minutes)
- **Check**: Site URL in `astro.config.mjs` matches domain

---

## Quick Reference

### Important URLs

- **GitHub Repository**: https://github.com/kimbersykes87-source/Mezcalomano
- **Cloudflare Dashboard**: https://dash.cloudflare.com/
- **Live Site**: https://mezcalomano.com
- **Shopify Store**: https://shop.mezcalomano.com
- **Instagram**: https://www.instagram.com/mezcalomano/
- **TikTok**: https://www.tiktok.com/@mezcalomano
- **Map**: https://map.mezcalomano.com (external)

### Key Commands

```bash
npm install          # Install dependencies
npm run dev          # Local development server
npm run build        # Production build
npm run preview      # Preview production build locally
```

### Key Files to Never Delete

- `astro.config.mjs` - Cloudflare adapter configuration
- `config/wrangler.toml` - Cloudflare Workers compatibility
- `_redirects` - Redirect rules
- `package.json` - Dependencies
- `src/env.d.ts` - Environment variable types

---

## For New Developers/Agents

When starting work on this project:

1. **Clone the repository**: `git clone https://github.com/kimbersykes87-source/Mezcalomano.git`
2. **Install dependencies**: `npm install`
3. **Read this file**: Understand all connections before making changes
4. **Test locally**: `npm run dev` to see changes
5. **Build test**: `npm run build` to ensure it works
6. **Verify critical files**: Check that `astro.config.mjs`, `_redirects`, and `package.json` are intact
7. **Commit and push**: Changes auto-deploy to Cloudflare Pages

**Remember**: 
- Never delete `astro.config.mjs`, `_redirects`, or `package.json` dependencies
- The site URL (`mezcalomano.com`) is configured in `astro.config.mjs`
- Redirects to Shopify are in `_redirects` file
- Environment variables are set in Cloudflare Pages dashboard, not in code

---

## Social Media Links

### Instagram
- **URL**: https://www.instagram.com/mezcalomano/
- **Location**: Footer social icons
- **Implementation**: `src/Footer.astro`

### TikTok
- **URL**: https://www.tiktok.com/@mezcalomano
- **Location**: Footer social icons
- **Implementation**: `src/Footer.astro`

## Shop Integration

### Shop Button
- **URL**: https://shop.mezcalomano.com
- **Locations**: 
  - Header navigation (desktop) - styled with border
  - Mobile navigation menu - styled with border
  - "Get the Discovery Deck" button on home page
- **Implementation**: 
  - `src/Header.astro` - `.nav-shop-btn` class
  - `src/MobileNav.astro` - `.mobile-nav-shop` class
  - `src/pages/index.astro` - hero CTA button
  - `src/styles/components.css` - border styling

### Redirects
- `/buy` → https://shop.mezcalomano.com/products/discovery-deck (via `_redirects`)
- `/shop` → https://shop.mezcalomano.com (via `_redirects`)

---

Last updated: 2026-01-26
