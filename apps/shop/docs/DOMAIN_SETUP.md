# Setting Up shop.mezcalomano.com Custom Domain

## Step 1: Verify Your Cloudflare Pages Project

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Workers & Pages** → **Pages** (or just **Pages** in the sidebar)
3. Find your project named **`mezcalomano-shop`** (or similar)
4. Click on the project to open it

**Note:** If you don't see the project, it may be under a different name. Check all Pages projects.

---

## Step 2: Add Custom Domain in Cloudflare Pages

1. In your Pages project, click on the **Custom domains** tab (or **Settings** → **Custom domains**)
2. Click **Set up a custom domain** (or **Add a custom domain**)
3. Enter: `shop.mezcalomano.com`
4. Click **Continue** or **Add domain**

**What happens next:**
- Cloudflare will check if `mezcalomano.com` is already in your Cloudflare account
- If it is, it will automatically configure DNS
- If not, you'll need to add DNS records manually (see Step 3)

---

## Step 3: Configure DNS Records

### Option A: If `mezcalomano.com` is already in Cloudflare

Cloudflare should automatically create a CNAME record for you. Verify it exists:

1. In Cloudflare Dashboard, select the **`mezcalomano.com`** site (not the Pages project)
2. Go to **DNS** → **Records**
3. Look for a record:
   - **Type:** `CNAME`
   - **Name:** `shop`
   - **Target:** `mezcalomano-shop.pages.dev` (or similar `.pages.dev` URL)
   - **Proxy status:** Proxied (orange cloud)

If it doesn't exist, create it manually (see Option B).

### Option B: Manual DNS Configuration

If Cloudflare didn't auto-create the DNS record:

1. In Cloudflare Dashboard, select the **`mezcalomano.com`** site
2. Go to **DNS** → **Records**
3. Click **Add record**
4. Configure:
   - **Type:** `CNAME`
   - **Name:** `shop`
   - **Target:** Get this from your Pages project:
     - Go back to **Pages** → Your project → **Custom domains**
     - Look for the `.pages.dev` URL (e.g., `mezcalomano-shop.pages.dev`)
     - Copy that exact URL
   - **Proxy status:** ✅ **Proxied** (orange cloud) - **IMPORTANT: Keep this enabled**
   - **TTL:** Auto
5. Click **Save**

---

## Step 4: Wait for DNS Propagation

- DNS changes typically take **1-5 minutes** to propagate
- SSL certificate provisioning takes **2-10 minutes** (Cloudflare does this automatically)

**Check status:**
1. Go back to **Pages** → Your project → **Custom domains**
2. You should see `shop.mezcalomano.com` with status:
   - 🟡 **Pending** (waiting for DNS/SSL)
   - 🟢 **Active** (ready to use)

---

## Step 5: Verify It's Working

Once the status shows **Active**:

1. Visit: `https://shop.mezcalomano.com` (use HTTPS)
2. You should see your Next.js shop homepage

**Troubleshooting:**
- If you see "This site can't be reached":
  - Wait a few more minutes for DNS propagation
  - Clear your browser cache
  - Try in an incognito/private window
- If you see a Cloudflare error page:
  - Check that the CNAME target matches your Pages project URL exactly
  - Verify the Pages project is deployed successfully
- If you see the old static site:
  - Make sure you're accessing `shop.mezcalomano.com`, not `mezcalomano.com`
  - Check that the DNS record points to the correct Pages project

---

## Step 6: Update Environment Variables (Important!)

Once the domain is live, update your Cloudflare Pages environment variables:

1. Go to **Pages** → Your project → **Settings** → **Environment variables**
2. Add or update:
   - **Variable:** `NEXT_PUBLIC_SITE_URL`
   - **Value:** `https://shop.mezcalomano.com`
3. Click **Save**
4. **Redeploy** your project (or wait for the next automatic deployment)

This ensures Stripe webhooks and other integrations use the correct URL.

---

## Quick Reference: Finding Your Pages Project URL

If you need to find your default `.pages.dev` URL:

1. Go to **Pages** → Your project
2. Look at the top of the page - you'll see a URL like:
   - `https://mezcalomano-shop.pages.dev`
   - Or `https://d1d6b524.mezcalomano-shop.pages.dev` (if you see a hash)

This is what your CNAME should point to.

---

## Common Issues

### Issue: "Domain not in Cloudflare"
**Solution:** Make sure `mezcalomano.com` is added to your Cloudflare account. If it's managed elsewhere, you'll need to add it to Cloudflare first.

### Issue: "SSL certificate pending"
**Solution:** Wait 5-10 minutes. Cloudflare automatically provisions SSL certificates. If it's stuck, try removing and re-adding the custom domain.

### Issue: "CNAME conflict"
**Solution:** Check if there's already a DNS record for `shop.mezcalomano.com`. Remove any conflicting records (A, AAAA, or other CNAME records).

### Issue: Site shows "Not Found" or 404
**Solution:** 
- Verify the Pages project build succeeded (check **Deployments** tab)
- Make sure you're using the correct project (check the project name matches `wrangler.toml`)
- Check that the build output directory is correct (`.open-next`)

---

## Need Help?

If the domain still isn't working after following these steps:

1. Check the **Deployments** tab in your Pages project - make sure the latest deployment succeeded
2. Check the **Custom domains** tab - look for any error messages
3. Verify DNS in Cloudflare Dashboard → DNS → Records for `mezcalomano.com`
4. Try accessing the default `.pages.dev` URL directly to confirm the Pages project itself is working
