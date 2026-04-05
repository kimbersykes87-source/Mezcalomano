# Local development (UX / UI)

Use this flow to run the marketing site on your machine with hot reload while you change layouts, components, and styles.

## Prerequisites

- **Node.js** 20 or newer (`node -v`)
- **npm** (comes with Node)

## One-time setup

```bash
cd Mezcalomano
npm install
```

## Environment variables

1. Copy the example file:

   ```bash
   copy .env.local.example .env.local
   ```

   On macOS/Linux: `cp .env.local.example .env.local`

2. Open **`.env.local`** and set at least:

   | Variable | Purpose |
   |----------|---------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Required for **`/directory`**, **`/directory/[slug]`**, **`/map`**, and **`/sitemap.xml`** species URLs (live data). |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same as above. |

   Use the same values as **Vercel → Project → Settings → Environment Variables** (Production), or copy them from the **Supabase** dashboard (**Project Settings → API**).

3. **Optional for UI work**

   - **Contact page** (`/contact`): set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` if you need to test submissions end-to-end. Without them, the form may fail server verification—you can still edit layout and styles.
   - **Seeding the database** (`npm run seed:species`): add `SUPABASE_SERVICE_ROLE_KEY` (Supabase dashboard → **Settings → API → service_role**). Never expose this key in client code or commit it.

## Run the dev server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)**. Edit files under **`src/`**; the browser updates on save.

After a production build (`npm run build` && `npm run start`), you can spot-check **`http://localhost:3000/sitemap.xml`** and **`http://localhost:3000/llms.txt`**.

## Useful commands

| Command | When |
|--------|------|
| `npm run dev` | Daily UI/UX work (development mode). |
| `npm run build` | Check that production compile passes before pushing. |
| `npm run start` | Run the production build locally (after `npm run build`). |
| `npm run lint` | ESLint on `src/`. |

## What to edit for UX / UI

- **Pages & routes**: `src/app/**` (layouts in `layout.tsx`, each route in `page.tsx`).
- **Shared UI**: `src/components/**`.
- **Global styles / theme**: `src/app/globals.css`, Tailwind in component classes.
- **Images / static assets**: `public/**`.

## Troubleshooting

- **Directory or map is empty / errors**: Confirm **`NEXT_PUBLIC_SUPABASE_*`** in `.env.local` and restart `npm run dev` (Next only reads env at startup).
- **Map shows no states**: Ensure **`public/geo/mexico-states.geojson`** is present (fetched at runtime from `/geo/mexico-states.geojson`).
- **Port 3000 in use**: `npx next dev -p 3001` or stop the other process using 3000.
- **Windows path issues**: Run commands from the repo root; use PowerShell or Git Bash.

For production deploys and service connections, see **[CONNECTIONS.md](../CONNECTIONS.md)**.
