# Project Connections Documentation

This document explains all external connections and configurations for the Mezcalómano marketing site. Use this as a reference when working with the project.

## Table of Contents

1. [GitHub Repository](#github-repository)
2. [Vercel Deployment](#vercel-deployment)
3. [Configuration Files](#configuration-files)
4. [Environment Variables](#environment-variables)
5. [Supabase (directory and map)](#supabase-directory-and-map)
6. [Git push and cloud services](#git-push-and-cloud-services)
7. [Redirects](#redirects)
8. [Domain and DNS (Cloudflare)](#domain-and-dns-cloudflare)
9. [Verification Checklist](#verification-checklist)
10. [External Links](#external-links)
11. [Agent handbook](#agent-handbook)

---

## GitHub Repository

### Repository Details

- **URL**: `https://github.com/kimbersykes87-source/Mezcalomano`
- **Default branch**: `main`
- **Connection**: Git integration via Vercel

### How It Works

1. The repository is connected to Vercel in the Vercel dashboard.
2. Pushing to `main` triggers an automatic build and deployment.
3. Preview deployments are created for pull requests.

### To Connect or Reconnect

1. Vercel Dashboard → Add New → Project (or Settings → Git).
2. Import from GitHub and select `kimbersykes87-source/Mezcalomano`.
3. Choose production branch: `main`.

---

## Vercel Deployment

### Deployment Configuration

The site is deployed on **Vercel** with the following settings:

- **Framework**: Next.js (auto-detected)
- **Build command**: `npm run build`
- **Output**: `.next` (default; no custom output directory)
- **Install command**: `npm install`
- **Node version**: 20+ (see `package.json` engines)

### Key Configuration Files

#### `next.config.ts`

Redirects and Next.js configuration:

```typescript
const nextConfig: NextConfig = {
  redirects: async () => [
    { source: "/buy", destination: "https://shop.mezcalomano.com/products/discovery-deck", permanent: false },
    { source: "/shop", destination: "https://shop.mezcalomano.com", permanent: false },
    { source: "/matrix", destination: "/directory", permanent: true },
    { source: "/matrix/", destination: "/directory", permanent: true },
  ],
};
```

#### `package.json`

- **Scripts**: `dev`, `build`, `start`, `lint`, `build:matrix-cards`, `build:og-icon-png`
- **Dependencies**: `next`, `react`, `react-dom`, `@supabase/supabase-js`, `maplibre-gl`, `papaparse`, etc. (see `package.json`)

### Build and Deploy Flow

1. Push code to `main` (or open a PR for a preview).
2. Vercel runs `npm install` and `npm run build`.
3. Next.js builds the app; static pages are prerendered where possible.
4. Site is served at the Vercel URL and any custom domains (e.g. mezcalomano.com).

---

## Environment Variables

### Contact form: Turnstile + Supabase + Apps Script

The contact page posts JSON `{ name, email, message, token }` to **`POST /api/contact`**. Flow: fail-fast env check → Turnstile `siteverify` → validate fields → insert **`contacts`** (`emailed=false`) with the service role → POST to Apps Script → set `emailed=true` on `ok:true`. Email failure still returns success (row is saved).

Set these in **Vercel** (Project → Settings → Environment Variables) and local **`.env.local`**:

| Variable | Purpose | Where used | Required |
|----------|---------|------------|----------|
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key (public) | `ContactForm.tsx` (client) | Yes |
| `TURNSTILE_SECRET` | Matching secret from the **same** widget | `src/app/api/contact/route.ts` | Yes |
| `APPS_SCRIPT_URL` | Deployed Apps Script web app `/exec` URL | Contact API | Yes |
| `APPS_SCRIPT_TOKEN` | Shared secret (= Apps Script `SHARED_SECRET`) | Contact API | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Insert/update `contacts` (bypasses RLS) | Contact API (+ local seed/upload) | Yes on Vercel for contact |
| `SUPABASE_URL` | Optional project URL for contact API | Contact API (falls back to `NEXT_PUBLIC_SUPABASE_URL`) | Optional |

**Do not use** legacy names: `TURNSTILE_SECRET_KEY`, `PUBLIC_TURNSTILE_SITE_KEY`, Recaptcha keys — the app ignores them.

- **Production / Preview**: Vercel env vars above. After changing `NEXT_PUBLIC_*` or secrets, **Redeploy**.
- **Local**: Copy **`.env.local.example`** → **`.env.local`**. Never commit real secrets.
- **Schema**: `public.contacts` (migration `20260726143813_create_contacts.sql`); RLS on, no client policies.

### Where keys live (summary)

| Keys | Production / Preview | Local development |
|------|---------------------|-------------------|
| Turnstile site + `TURNSTILE_SECRET` | Vercel Environment Variables | `.env.local` (from `.env.local.example`) |
| Apps Script URL + token | Same in Vercel | `.env.local` |
| Supabase URL + anon | Vercel (directory, map, SEO, sitemap) | `.env` / `.env.local` |
| Supabase service role | **Required on Vercel** for contact inserts | `.env.local` for contact + `seed:species` / uploads |
| Supabase CLI token (`sbp_…`) | **Not** on Vercel | `.env.local` for `npm run supabase:push` only |

Authoritative variable list: **`.env.local.example`**. Agent workflows: **[docs/AGENT_HANDOFF.md](docs/AGENT_HANDOFF.md)**.

### Access in Code

- **Client**: `process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY` only (never expose the service role or Turnstile secret).
- **Server**: `TURNSTILE_SECRET`, `APPS_SCRIPT_*`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_URL` \|\| `NEXT_PUBLIC_SUPABASE_URL` in `src/app/api/contact/route.ts`.

---

## Supabase (directory and map)

The **directory** (`/directory`, `/directory/[slug]`) and **map** (`/map`) read the **`species`** table via the Supabase JS client.

### Environment variables

| Variable | Purpose | Required for |
|----------|---------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | App + seed + CLI script |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anonymous key (public) | App (browser client) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (server-side only) | Contact API on Vercel; local `npm run seed:species` / card upload |
| `SUPABASE_ACCESS_TOKEN` | Personal token (`sbp_…`) | `npm run supabase:push` |
| `SUPABASE_DB_PASSWORD` | Database password | Optional; helps `supabase link` |
| `SUPABASE_PROJECT_REF` | Project ref substring | Optional if URL is nonstandard |

Set the **same** `NEXT_PUBLIC_*` values in **Vercel** (Project → Settings → Environment Variables) for Production and Preview. The species detail route uses these on the **server** for `generateMetadata` (title, description, Open Graph / Twitter image). Do **not** expose `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_ACCESS_TOKEN` to the browser — keep them local (or in CI secrets) for **`seed:species`** and **`supabase:push`** only.

### Schema migrations

- **Location**: [`supabase/migrations/`](supabase/migrations/) — numbered **`001`–`008`** (aligned with the MM_Directory history, plus **`008_add_species_slug.sql`** for URL slugs).
- **Apply to hosted DB**: Install [Supabase CLI](https://supabase.com/docs/guides/cli), copy **`.env.local.example`** → **`.env.local`**, fill `SUPABASE_ACCESS_TOKEN` and Supabase URL, then from the repo root:

  ```bash
  npm run supabase:push
  ```

  This runs `supabase link` and `supabase db push`. If history ever drifts, use the SQL Editor to run specific files, then repair migration history per [Supabase docs](https://supabase.com/docs/guides/cli/managing-environments#migration-history).

### Seed species from CSV

```bash
npm run seed:species
```

Reads **`data/Species_Final - Website.csv`**. Loads **`.env`** then **`.env.local`**.

### Card images (static)

Directory card art is served from **`public/assets/matrix/cards/`** and **`index.json`** (see README: `sync:agave-matrix`, `normalize:agave-images`). That is independent of Supabase Storage unless you later add storage uploads.

### Directory detail: SEO and slugs

- **`/directory/[slug]`** — Server component **`src/app/directory/[slug]/page.tsx`**: `fetchSpeciesBySlug`, `generateMetadata`, Open Graph / Twitter cards (matrix PNG or default OG asset); **`SpeciesDetailClient.tsx`** renders the card.
- **Links** — **`speciesDirectorySlug()`** in **`src/lib/slug.ts`**: uses DB **`slug`** when set, else `toSlug(common_name)`. Used in **`SpeciesCard`**, directory UI, and **map state detail** links.

---

## Git push and cloud services

### Production: always ship via Vercel

- **Going live** means **`git push`** (or merge) to **`main`** on GitHub with the **Vercel** project connected to this repo. Vercel runs **`npm run build`** and deploys; that is the only intended path for the marketing Next.js app.
- **Do not** rely on **Cloudflare Pages** (or any host expecting a **`dist`** folder) for this repository. DNS for `mezcalomano.com` stays in Cloudflare, but **the app is built and served by Vercel**. If a Cloudflare Pages project is wired to the same Git repo, disable it or point it elsewhere so builds do not fail on missing `dist` and you do not maintain two deploy pipelines.
- Agents and contributors: after merging changes, **push `main`** and confirm the deployment in the **Vercel** dashboard (and production URL), not Cloudflare Pages build logs.

| Action | What it updates |
|--------|------------------|
| **`git push`** to **`main`** on GitHub | **Vercel** builds and deploys the marketing site (when the project is connected to the repo). |
| **`npm run supabase:push`** (local, with CLI + token) | **Supabase** hosted Postgres — applies new migration files only. |
| **Shop / DNS** | **Shopify** and **Cloudflare** are unchanged by this repo’s git push; manage in their dashboards. |

There is **no** separate “git push to Supabase”: database changes go through **migrations** (CLI or SQL Editor). Keeping **`supabase/migrations/`** in this repo lets the team reproduce the same schema from Git + CLI.

---

## Redirects

Redirects are configured in **`next.config.ts`** (not in a file like `_redirects`). No extra Vercel redirect config is needed unless you add more rules.

### Current Redirects

| Source | Destination | Type |
|--------|-------------|------|
| `/buy` | https://shop.mezcalomano.com/products/discovery-deck | 302 (temporary) |
| `/shop` | https://shop.mezcalomano.com | 302 (temporary) |
| `/matrix` | `/directory` | 301 (permanent) |
| `/matrix/` | `/directory` | 301 (permanent) |

### Testing

After deployment, verify:

- `https://mezcalomano.com/buy` → Shopify Discovery Deck product
- `https://mezcalomano.com/shop` → Shopify store
- `https://mezcalomano.com/matrix` → redirects to `/directory`

---

## Domain and DNS (Cloudflare)

### Primary Domain

- **Domain**: `mezcalomano.com` (and optionally `www.mezcalomano.com`)
- **DNS**: Hosted with **Cloudflare**. DNS records point to Vercel; the site is built and served by Vercel.
- **SSL**: Issued and managed by Vercel when the domain is added in Vercel and DNS is correct.

### How It Works

1. **Vercel**: You add `mezcalomano.com` and `www.mezcalomano.com` in Project → Settings → Domains. Vercel shows which DNS records to create.
2. **Cloudflare**: In the Cloudflare zone for `mezcalomano.com`, you add the records Vercel specifies (typically A and/or CNAME to Vercel’s targets). Use **DNS only** (grey cloud) for those records so Vercel can verify and issue SSL.
3. **Shop**: `shop.mezcalomano.com` points to Shopify via Cloudflare DNS (separate from this project).

### Step-by-Step

See **[docs/deploy/DOMAIN_CLOUDFLARE_VERCEL.md](docs/deploy/DOMAIN_CLOUDFLARE_VERCEL.md)** for the full walkthrough (adding domain in Vercel, then updating DNS in Cloudflare).

---

## Configuration Files

### Critical Files (Do Not Delete)

```
├── next.config.ts       # Redirects and Next.js config
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript and path alias @/* → src/*
├── src/
│   └── env.d.ts         # Optional; env types
└── .gitignore           # Includes .next, .env.local
```

### Important Directories

```
├── src/
│   ├── app/             # App Router: layout, pages, api
│   ├── components/      # React components
│   ├── data/            # matrix.json etc.
│   ├── scripts/         # build-matrix-cards etc.
│   └── styles/          # global.css, components.css
├── public/              # Static assets (favicons, assets/*)
├── supabase/migrations/ # Numbered SQL migrations for hosted Postgres
└── docs/                # Documentation
```

---

## Verification Checklist

Use this to verify connections:

### GitHub

- [ ] Repository exists at `https://github.com/kimbersykes87-source/Mezcalomano`
- [ ] Vercel project is connected to this repo
- [ ] Pushing to `main` triggers a deployment

### Vercel

- [ ] Build command: `npm run build` (or default)
- [ ] Framework: Next.js
- [ ] Custom domains: `mezcalomano.com` (and `www` if used) added and valid
- [ ] Contact env: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET`, `APPS_SCRIPT_URL`, `APPS_SCRIPT_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY` (and Supabase URL) set for Production (and Preview if needed); Redeploy after changes
- [ ] `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` set for Production (and Preview) so `/directory`, `/map`, **`/sitemap.xml`** (species URLs), and species JSON-LD work

### Supabase

- [ ] Migrations in `supabase/migrations/` are applied (including **`contacts`** for the contact form)
- [ ] `npm run seed:species` has been run after CSV updates (uses `SUPABASE_SERVICE_ROLE_KEY` locally)

### Configuration

- [ ] `next.config.ts` contains redirects for `/buy`, `/shop`, `/matrix`
- [ ] `package.json` has scripts `dev`, `build`, `start`
- [ ] Local `.env.local` (from `.env.local.example`) has Turnstile, Apps Script, and Supabase keys for `npm run dev`

### Redirects

- [ ] `/buy` redirects to Shopify product
- [ ] `/shop` redirects to Shopify store
- [ ] `/matrix` and `/matrix/` redirect to `/directory`

### Build and Site

- [ ] `npm run build` succeeds locally
- [ ] Site is accessible at `https://mezcalomano.com` (after DNS and domain setup)
- [ ] Contact form loads and Turnstile widget appears (if keys are set)
- [ ] `https://mezcalomano.com/sitemap.xml` returns XML and lists `/directory` and multiple `/directory/{slug}` entries when Supabase env is set on Vercel
- [ ] `https://mezcalomano.com/llms.txt` returns the agent summary file
- [ ] Optional: [Google Rich Results Test](https://search.google.com/test/rich-results) on the homepage reports valid structured data (Organization / Product / etc.)

---

## External Links

### Important URLs

- **GitHub**: https://github.com/kimbersykes87-source/Mezcalomano
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard (project → SQL Editor, Table Editor)
- **Cloudflare Dashboard** (DNS): https://dash.cloudflare.com/
- **Live site**: https://mezcalomano.com
- **Sitemap**: https://mezcalomano.com/sitemap.xml
- **llms.txt** (agent summary): https://mezcalomano.com/llms.txt
- **Shop**: https://shop.mezcalomano.com
- **Instagram**: https://www.instagram.com/mezcalomano/
- **TikTok**: https://www.tiktok.com/@mezcalomano
- **Map** (in-app): https://mezcalomano.com/map — MapLibre Mexico map; may coexist with other map subdomains if configured separately in DNS

### Key Commands

```bash
npm install          # Install dependencies
npm run dev          # Local dev (http://localhost:3000)
npm run build        # Production build
npm run start        # Run production build locally
npm run lint         # Run ESLint
npm run supabase:push   # Apply DB migrations (Supabase CLI + token; see Supabase section)
npm run seed:species    # Sync species rows from CSV (service role key locally)
```

---

## Agent handbook

**[docs/AGENT_HANDOFF.md](docs/AGENT_HANDOFF.md)** — For AI agents and maintainers: where secrets are stored (never in Git), what to edit for CSV vs migrations vs images, file map, and verification commands.

---

## For New Developers / Agents

When starting work on this project:

1. **Clone**: `git clone https://github.com/kimbersykes87-source/Mezcalomano.git`
2. **Install**: `npm install`
3. **Read** [README.md](README.md), this file, and **[docs/AGENT_HANDOFF.md](docs/AGENT_HANDOFF.md)** for workflows and secret handling.
4. **Env**: Copy **`.env.local.example`** to **`.env.local`** and add Turnstile and Supabase keys (see [Environment variables](#environment-variables) and [Supabase](#supabase-directory-and-map)).
5. **Run**: `npm run dev` and open http://localhost:3000.
6. **Build**: `npm run build` to ensure the project builds.
7. **Deploy**: Push to `main`; Vercel deploys automatically. Set env vars in Vercel if not already set.

**Remember:**

- Redirects live in `next.config.ts`, not in a `_redirects` file.
- Domain DNS is in Cloudflare; the app is hosted on Vercel.
- Environment variables are set in Vercel (and in `.env.local` for local dev).
- Database schema is versioned in `supabase/migrations/`; apply with `npm run supabase:push` or the Supabase SQL Editor.
- **Do not commit** `.env` / `.env.local` or paste live tokens into chat.

---

## Social and Shop Integration

### Social (Footer)

- **Instagram**: https://www.instagram.com/mezcalomano/ — `src/components/Footer.tsx`
- **TikTok**: https://www.tiktok.com/@mezcalomano — `src/components/Footer.tsx`

### Shop

- **Store**: https://shop.mezcalomano.com
- **Locations**: Header (basket icon), MobileNav (“SHOP” link), Home hero CTA (“BUY THE DISCOVERY DECK” → `/buy`).
- **Redirects**: `/buy` and `/shop` configured in `next.config.ts`.

---

Last updated: 2026-04-05 (map URL correction, state-detail dialog on `/map`)
