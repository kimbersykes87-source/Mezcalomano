# Legacy: Astro Client Directives (Pre–Next.js)

**Note:** This project has been migrated to **Next.js**. This document described a common Astro pitfall and is kept for historical reference only. For current troubleshooting, see [CONNECTIONS.md](../../CONNECTIONS.md) and [README.md](../../README.md).

---

## The Issue (Astro)

Astro's `client:` directives (e.g. `client:load`, `client:idle`) are for **framework components** (React, Vue, Svelte) that need client-side hydration. **Astro components (`.astro` files) cannot use client directives** and are server-rendered only.

## Symptoms (Astro)

- Build errors like `Unexpected "default"` or null bytes in paths when `client:load` was incorrectly applied to Astro components.

## Current Stack (Next.js)

- Interactive UI uses React **client components** (`"use client"`) where needed.
- No Astro directives; see `src/components/` for React components and `src/app/` for pages and API routes.

---

Last updated: 2026-02-17
