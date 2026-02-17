# Deployment setup checklist

Follow these steps to deploy the Mezcalómano Next.js site to Vercel.

---

## 1. Push your code

Ensure your Next.js changes are committed and pushed to GitHub (or GitLab/Bitbucket).

```bash
git add .
git commit -m "Migrate to Next.js"
git push origin main
```

---

## 2. Create a Vercel account and import the project

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub is easiest).
2. Click **Add New…** → **Project**.
3. Import your **Mezcalomano** repository.
4. Vercel will detect **Next.js**; leave the defaults:
   - **Build Command:** `npm run build` (or leave blank)
   - **Output Directory:** (leave default)
   - **Install Command:** `npm install` (or leave blank)
5. Do **not** deploy yet—add environment variables first (step 3).

---

## 3. Set environment variables (contact form)

The contact form uses **Cloudflare Turnstile**. You need two keys.

**Get the keys:**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Turnstile**.
2. Create a site or use an existing one (e.g. `mezcalomano.com`).
3. Copy the **Site Key** and **Secret Key**.

**Add them in Vercel:**

1. In your Vercel project: **Settings** → **Environment Variables**.
2. Add:

   | Name | Value | Environment |
   |------|--------|-------------|
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | (paste Site Key) | Production, Preview |
   | `TURNSTILE_SECRET_KEY` | (paste Secret Key) | Production, Preview |

3. Save.

If you skip this, the site will still deploy; the contact form will either fail verification or show a Turnstile error until the keys are set.

---

## 4. Deploy

1. In Vercel, click **Deploy** (or trigger a new deployment from the **Deployments** tab).
2. Wait for the build to finish. The first deploy may take 1–2 minutes.
3. You’ll get a URL like `mezcalomano-marketing-xxx.vercel.app`. Use it to test the site.

---

## 5. Add your production domain (optional)

If you use **mezcalomano.com**:

1. In the project: **Settings** → **Domains**.
2. Add **mezcalomano.com** (and **www.mezcalomano.com** if you use it).
3. Follow Vercel’s instructions to add the DNS records at your registrar (usually an A record or CNAME). Vercel will show the exact values.
4. After DNS propagates, Vercel will issue SSL automatically.

---

## 6. Optional: favicon and OG image

The layout expects these under `public/`:

- **Favicons:** `public/assets/favicon/`  
  - e.g. `favicon_16.png`, `favicon_32.png`, `favicon_48.png`, `app_icon_512.png`
- **OG image:** `public/assets/og/mezcalomano_og_1200x630.png`  
  - Used when the site is shared on social (1200×630 px).

If these are missing, the site still works; you may get 404s for favicons and a missing or wrong image when sharing. Add the files to `public/` and redeploy if needed.

---

## Summary

| Step | Action |
|------|--------|
| 1 | Push code to GitHub |
| 2 | Import repo in Vercel (Next.js detected) |
| 3 | Add `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` in Vercel |
| 4 | Deploy and test the `.vercel.app` URL |
| 5 | Add domain (e.g. mezcalomano.com) and DNS if you use it |
| 6 | Add favicon + OG image in `public/` if you want them |

For more detail, see [vercel.md](vercel.md).
