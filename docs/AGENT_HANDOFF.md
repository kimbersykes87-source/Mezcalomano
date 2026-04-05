# Agent and maintainer handbook

This document is for **future AI agents and developers** working on the Mezcalómano marketing site. It complements [README.md](../README.md) and [CONNECTIONS.md](../CONNECTIONS.md) with **where secrets live**, **what to change for each kind of update**, and **policies** (especially around credentials).

---

## 1. Where secrets and keys are stored

**Nothing that grants database write access or account control belongs in the Git repository.**

| Secret / key | Purpose | Typical storage | In Git? |
|--------------|---------|-----------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Developer **`.env`** or **`.env.local`**; **Vercel** → Project → Settings → Environment Variables (Production + Preview) | No — values only in env |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key (browser + server metadata fetch) | Same as above | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Bypass RLS for seed upserts | **Local only** (`.env` / `.env.local`) or a secure CI secret — **not** required on Vercel for the running site | No |
| `SUPABASE_ACCESS_TOKEN` (`sbp_…`) | Supabase CLI login for `db push` | **Local only** (`.env` / `.env.local`) | No |
| `SUPABASE_DB_PASSWORD` | Optional; helps `supabase link` | Local `.env` / `.env.local` | No |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Contact form widget | Vercel env + local `.env.local` | No |
| `TURNSTILE_SECRET_KEY` | Contact API route verification | Vercel env + local `.env.local` | No |

**Template (no real values):** [`.env.local.example`](../.env.local.example) — lists variable names and short comments.

**Load order (scripts):** `scripts/seed-species-from-csv.mjs` and `scripts/supabase-cli-push.mjs` load **`.env` first**, then **`.env.local`** (later file wins for duplicates). Next.js dev/build loads `.env.local` automatically.

**Vercel:** Production and Preview need at least the **`NEXT_PUBLIC_*`** variables the app reads in the browser (`Supabase` + `Turnstile`). The directory detail page’s **`generateMetadata`** runs on the server and uses **`NEXT_PUBLIC_SUPABASE_URL`** and **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** to fetch species for titles and OG tags — same keys as the client.

**Supabase Dashboard:** Database password, service role key, and API keys are shown under **Project Settings** (API, Database). The personal **access token** for the CLI is under the user account (not the project).

### Rules for agents

1. **Never commit** `.env`, `.env.local`, or any file containing real tokens.
2. **Never paste** live keys, tokens, or passwords into chat logs, tickets, or public docs.
3. If a key may have been exposed, tell the human to **rotate** it in Supabase / Cloudflare / Vercel.
4. To run **`npm run seed:species`** or **`npm run supabase:push`**, the human must have filled local env files; the agent can run commands **on their machine** if those files already exist — do not ask them to paste secrets into the conversation.

---

## 2. What to update for common tasks

### A. Species copy, producers, or fields (no schema change)

1. Edit **`data/Species_Final - Website.csv`** (canonical for the website seed).
2. Keep **`data/Species_Final - Directory_updated_*.csv`** in sync if you maintain that export (same columns; copy row changes over when appropriate).
3. **`producers`** and **`producer_links`** are comma-separated lists; **counts must match** (one URL per producer name in order). The seed script warns on mismatch.
4. Run **`npm run seed:species`** (requires `SUPABASE_SERVICE_ROLE_KEY` or anon key per script docs).
5. Commit CSV changes and push; Vercel does **not** run the seed — hosted DB updates only when someone runs the seed (or applies SQL manually).

### B. Card images on the site (PNG in repo)

1. Add or replace PNGs under **`source/agave_images/`** using **slug** filenames (e.g. `espadin.png` — same rules as `toSlug(common_name)` in `src/lib/slug.ts`).
2. **`npm run normalize:agave-images`** — renames deck-style names using the log when needed.
3. **`npm run sync:agave-matrix`** — copies slug PNGs to **`public/assets/matrix/cards/`** and regenerates **`index.json`** from the Website CSV.
4. Commit **`public/assets/matrix/cards/`** changes and push.

### C. Database schema change

1. Add a new numbered file under **`supabase/migrations/`** (follow existing `00x_description.sql` pattern).
2. From a machine with the Supabase CLI and **`SUPABASE_ACCESS_TOKEN`** (and URL in env), run **`npm run supabase:push`**.
3. If migration history on the remote project conflicts with the CLI, use the Supabase **SQL Editor** for one-off fixes and follow Supabase docs to reconcile history — see [CONNECTIONS.md](../CONNECTIONS.md).

### D. URL slugs for species

- Column **`slug`** on `species` (migration **`008_add_species_slug.sql`**). Seed sets `slug` from `toSlug(common_name)` unless you customize.
- App links use **`speciesDirectorySlug()`** in **`src/lib/slug.ts`**: prefers DB **`slug`**, falls back to **`toSlug(common_name)`**.
- Detail route: **`src/app/directory/[slug]/page.tsx`** (server metadata + `notFound`) and **`SpeciesDetailClient.tsx`** (client UI).

### E. SEO / social preview / sitemap / structured data

- **Global and page metadata** — Shared copy in **`src/lib/site-seo.ts`**; root **`src/app/layout.tsx`** sets default title template, description, Open Graph, Twitter, and site-wide JSON-LD (**Organization**, **WebSite**, **Product** pointing at the Shopify Discovery Deck URL). Per-page overrides: **`src/app/page.tsx`** (home), **`src/app/directory/layout.tsx`**, **`about/page.tsx`**, **`contact/page.tsx`**.
- **Species pages** — **`generateMetadata`** in **`src/app/directory/[slug]/page.tsx`**; OG image via **`src/lib/matrix-card-urls-server.ts`** and **`index.json`**, else default **`/assets/og/mezcalomano_og_1200x630.png`**. Same file injects **BreadcrumbList** JSON-LD via **`JsonLd.tsx`**.
- **Sitemap** — **`src/app/sitemap.ts`** uses **`src/lib/species-list-server.ts`** (Supabase `slug` + `common_name` → **`speciesDirectorySlug`**). Without Supabase env, only static URLs are emitted.
- **Agents** — **`public/llms.txt`**; keep it aligned with what the site actually does.

### F. Matrix `common_name` vs CSV mismatch

- Client mapping: **`src/lib/matrix-card-urls.ts`** — **`COMMON_NAME_ALIASES`** (minimal: e.g. alternate spellings → `index.json` key). Prefer aligning **`index.json`** and CSV **`common_name`** over adding aliases.
- Server OG resolution: **`src/lib/matrix-card-urls-server.ts`** uses the same alias table.

### G. Map popup links to directory

- **`src/app/map/page.tsx`** — uses **`speciesDirectorySlug(species)`** so links match DB slugs when set.

---

## 3. Important file map (directory + data)

| Area | Files |
|------|--------|
| Directory list UI | `src/app/directory/DirectoryClient.tsx`, `src/app/directory/page.tsx` |
| Species detail | `src/app/directory/[slug]/page.tsx`, `src/app/directory/[slug]/SpeciesDetailClient.tsx` |
| Cards / stack | `src/components/SwipeableCardStack.tsx`, `SpeciesCard.tsx`, `KeyCard.tsx` |
| Slugs | `src/lib/slug.ts` |
| Supabase (client singleton) | `src/lib/supabase.ts` |
| Server fetch for slug page | `src/lib/species-detail-server.ts` |
| Matrix images (client) | `src/lib/matrix-card-urls.ts` |
| Matrix images (server / OG) | `src/lib/matrix-card-urls-server.ts` |
| Species type | `src/types/species.ts` |
| Seed | `scripts/seed-species-from-csv.mjs` |
| Migrations push | `scripts/supabase-cli-push.mjs` |
| Canonical CSV | `data/Species_Final - Website.csv` |

---

## 4. Deploy and cloud summary

| Action | Effect |
|--------|--------|
| **`git push`** to **`main`** | Vercel build/deploy; static assets and Next.js app update. |
| **`npm run supabase:push`** | Remote Postgres schema (migrations only), local CLI + token. |
| **`npm run seed:species`** | Remote `species` row data from CSV; local service role (recommended). |

Shopify and Cloudflare DNS are **outside** this repo; see CONNECTIONS.md.

---

## 5. Verification after substantive changes

```bash
npm run build
npm run lint
```

After CSV or migration changes: run seed and/or `supabase:push` as appropriate, then smoke-test **`/directory`**, **`/directory/<slug>`**, and **`/map`** locally with valid `.env.local`.

---

**Last updated:** 2026-04-01
