# Next.js Troubleshooting

Common issues and fixes for the Mezcalómano Next.js site.

## Build fails

**`npm run build` fails**

- Run `npm install` and ensure there are no dependency errors.
- Check that `next.config.ts` and `tsconfig.json` are present and valid.
- Look at the error in the build output (missing module, type error, etc.).

## Environment variables not available

**Contact form: Turnstile / delivery not working**

- **Exact names** (Vercel + `.env.local`): `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET`, `APPS_SCRIPT_URL`, `APPS_SCRIPT_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`, and Supabase URL (`SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`).
- **Do not use** `TURNSTILE_SECRET_KEY` or `PUBLIC_TURNSTILE_SITE_KEY` — unused by current code.
- **Site key + secret** must be a matching pair from the **same** Cloudflare Turnstile widget. Mismatch → `Verification failed: TURNSTILE_SECRET does not match the site key`.
- **Redeploy** after changing `NEXT_PUBLIC_*` or contact secrets (Vercel toast: “A new deployment is needed”).
- **Local**: Copy `.env.local.example` → `.env.local`. Restart `npm run dev` after edits.
- Missing required server env → HTTP **500** with the missing variable name. Invalid Turnstile token → HTTP **400** `{ ok: false, ... }` (expected for a wiring smoke test).

## Redirects not working

**/buy or /shop or /matrix not redirecting**

- Redirects are in `next.config.ts`, not in a `_redirects` file. Edit the `redirects` array in `next.config.ts`.
- Redeploy after changing. No extra Vercel redirect config is needed for the current rules.

## Domain not working (mezcalomano.com)

**Site doesn’t load on custom domain**

- **Vercel**: Project → Settings → Domains. Ensure `mezcalomano.com` (and `www` if used) are added and show as Valid.
- **Cloudflare**: Ensure DNS records match what Vercel shows (A or CNAME to Vercel’s target). Use **DNS only** (grey cloud) for those records so Vercel can verify and issue SSL.
- See [DOMAIN_CLOUDFLARE_VERCEL.md](../deploy/DOMAIN_CLOUDFLARE_VERCEL.md) for the full steps.

## Lint or type errors

**ESLint or TypeScript errors after changes**

- Run `npm run lint` and fix reported issues.
- For `next/image` warnings on `<img>`: optional; you can keep `<img>` for static assets or switch to `next/image` if you want optimization.
- Ensure new env vars used in client code are prefixed with `NEXT_PUBLIC_`.

## API route (contact) returns 405 or 404

**POST /api/contact not found or method not allowed**

- The handler lives in `src/app/api/contact/route.ts` and exports `POST`. GET is intentionally not implemented (405 is expected for GET).
- If you get 404, confirm the file path and that the project built successfully.

## Contact API still returns old `{ "success": true }` stub

- Production has not picked up the new route. Confirm Vercel’s latest **Ready** deployment commit includes the current `route.ts`, then hard-refresh. An invalid-token POST should return **400** `{ "ok": false, "error": "..." }`.

---

For deployment and connection details, see [CONNECTIONS.md](../../CONNECTIONS.md) and [docs/deploy/SETUP_CHECKLIST.md](../deploy/SETUP_CHECKLIST.md).
