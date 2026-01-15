# Troubleshooting 404 Errors on Cloudflare Pages

## Problem
After successful build, the site returns 404 errors on both:
- `https://[hash].mezcalomano-shop.pages.dev`
- `https://shop.mezcalomano.com`

## Root Causes

### 1. Missing `_routes.json`
Cloudflare Pages needs `_routes.json` in the build output directory to know which paths should be handled by the Worker vs served as static files.

**Solution:** The post-build script (`scripts/fix-pages-output.js`) now automatically creates this file.

### 2. Worker File Location
OpenNext generates `worker.js` in `.open-next/`. Cloudflare Pages should automatically detect and use it.

### 3. Static Asset Path Mismatch
If static assets are in `.open-next/assets/_next/static/...` but HTML references `/_next/static/...`, there will be a path mismatch.

## Verification Steps

### Step 1: Check Build Output
After a build, verify these files exist in `.open-next/`:
- `worker.js` (or `_worker.js`)
- `_routes.json` (created by post-build script)
- `assets/` directory with static files

### Step 2: Check Build Logs
In Cloudflare Pages → Deployments → [Latest deployment] → Build logs:
- Look for "Worker saved in `.open-next/worker.js`"
- Look for "Creating _routes.json for static asset routing..."
- Verify no errors about missing files

### Step 3: Test Locally
```bash
cd apps/shop
npm run pages:build
npx wrangler pages dev .open-next
```

Visit `http://localhost:8788` and check if the site loads.

### Step 4: Check Cloudflare Pages Settings
1. Go to Pages → Your project → Settings → Builds & deployments
2. Verify:
   - **Build output directory**: `.open-next`
   - **Root directory**: `apps/shop`
   - **Build command**: `npm ci && npm run pages:build`

## Common Fixes

### Fix 1: Rebuild with Post-Build Script
The `pages:build` script now includes the post-build fix. Just trigger a new deployment.

### Fix 2: Manual `_routes.json` Creation
If the script didn't run, manually create `.open-next/_routes.json`:
```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": [
    "/_next/static/*",
    "/_next/image*",
    "/favicon.ico",
    "/robots.txt",
    "/static/*",
    "/assets/*"
  ]
}
```

### Fix 3: Check Worker File
Verify `.open-next/worker.js` exists after build. If not:
- Check build logs for errors
- Verify `@opennextjs/cloudflare` is installed correctly
- Try `npm run pages:build` locally and check output

### Fix 4: Verify Output Directory Structure
The `.open-next/` directory should contain:
```
.open-next/
├── worker.js          # Main Worker entry point
├── _routes.json        # Routing configuration (created by script)
├── assets/            # Static assets
│   ├── _next/
│   └── ...
└── cache/             # ISR cache files
```

## Still Not Working?

1. **Check deployment status:**
   - Pages → Deployments → Check if deployment shows "Success"
   - Look for any warnings or errors

2. **Check custom domain:**
   - Pages → Custom domains → Verify `shop.mezcalomano.com` shows "Active"
   - Check DNS records in Cloudflare → DNS → Records

3. **Check browser console:**
   - Open DevTools → Network tab
   - Look for which specific files are returning 404
   - Check if it's static assets or the main page

4. **Try the default Pages URL:**
   - Visit `https://[your-pages-url].pages.dev` directly
   - If this works but custom domain doesn't, it's a DNS/SSL issue

5. **Review build output:**
   - Download build artifacts from Pages → Deployments
   - Verify `.open-next/` structure matches expected format

## Next Steps

If none of these fix the issue:
1. Share the latest build log
2. Share the structure of `.open-next/` directory (list files)
3. Share any browser console errors
4. Check OpenNext Cloudflare documentation for version-specific issues
