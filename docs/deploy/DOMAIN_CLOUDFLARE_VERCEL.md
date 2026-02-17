# Connect mezcalomano.com (Cloudflare DNS) to Vercel

Your domain is hosted with **Cloudflare**. Follow these steps to point it at your Vercel project.

---

## Part 1: Add the domain in Vercel

1. Open your **Mezcalomano** project on [vercel.com](https://vercel.com).
2. Go to **Settings** → **Domains**.
3. Click **Add** and enter:
   - **mezcalomano.com** (root domain)
   - **www.mezcalomano.com** (optional but recommended)
4. Click **Add** for each. Vercel will show a status like “Invalid Configuration” until DNS is set.
5. On each domain, Vercel will show **which DNS records to create**. Note or leave that tab open—you’ll use it in Part 2.

Typical values Vercel shows:

- **Root (mezcalomano.com):**  
  - Either **A** record → `76.76.21.21`  
  - Or **CNAME** → `cname.vercel-dns.com`
- **www (www.mezcalomano.com):**  
  - **CNAME** → `cname.vercel-dns.com`

Use the **exact** values Vercel displays for your project.

---

## Part 2: Update DNS in Cloudflare

1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com).
2. Select the zone for **mezcalomano.com**.
3. Go to **DNS** → **Records**.
4. Add or update records to match what Vercel asked for.

### If Vercel says “A record” for the root

| Type | Name | Content        | Proxy status |
|------|------|----------------|--------------|
| A    | `@`  | `76.76.21.21`  | **DNS only** (grey cloud) |
| CNAME| `www`| `cname.vercel-dns.com` | **DNS only** (grey cloud) |

### If Vercel says “CNAME” for the root (recommended)

| Type | Name | Content        | Proxy status |
|------|------|----------------|--------------|
| CNAME| `@`  | `cname.vercel-dns.com` | **DNS only** (grey cloud) |
| CNAME| `www`| `cname.vercel-dns.com` | **DNS only** (grey cloud) |

- **Name:** `@` = root (mezcalomano.com), `www` = www.mezcalomano.com.
- **Proxy:** Turn the cloud **grey** (“DNS only”) for these records so Vercel can verify and issue SSL. You can try enabling the orange cloud later if you want Cloudflare in front.

### Remove or update old records

- If you already have **A** or **CNAME** records for `@` or `www` pointing to your **old** host (e.g. Cloudflare Pages, another server), **edit** them to the Vercel values above, or **delete** them and add the new ones.

---

## Part 3: Wait for verification

1. Save the DNS records in Cloudflare.
2. In Vercel, **Domains** may take 1–2 minutes (up to 48 hours in rare cases) to show **Valid Configuration** and issue SSL.
3. When both domains show as valid, open **https://mezcalomano.com** and **https://www.mezcalomano.com** to confirm they load your Vercel site.

---

## Optional: Redirect www to root (or the other way)

In Vercel **Settings** → **Domains**, you can set one domain as primary and choose to redirect the other to it (e.g. www → root or root → www).

---

## Troubleshooting

- **“Invalid Configuration” for a long time:** Double-check name and content in Cloudflare match Vercel exactly; ensure proxy is **DNS only** for those records.
- **SSL / “Not secure”:** Leave DNS only until Vercel shows valid; then you can try enabling Cloudflare proxy and set SSL mode to **Full** or **Full (strict)** if you use the orange cloud.
- **Site still shows old host:** Clear browser cache and wait a few more minutes for DNS to propagate.
