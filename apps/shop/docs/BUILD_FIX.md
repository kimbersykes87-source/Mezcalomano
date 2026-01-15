# Fixing Cloudflare Pages Build Error

## Problem
The build is failing because:
1. The `apps/shop` directory hasn't been committed to git
2. Cloudflare Pages can't find the directory in the cloned repository

## Solution

### Step 1: Commit the Shop Code to Git

```bash
cd C:\dev\Mezcalomano

# Add the apps directory
git add apps/

# Add the root wrangler.toml (for Pages detection)
git add wrangler.toml

# Commit
git commit -m "Add Mezcalomano shop application"

# Push to your repository
git push
```

### Step 2: Update Cloudflare Pages Build Settings

1. Go to your Cloudflare Pages project
2. Click **Settings** → **Builds & deployments**
3. Verify these settings:
   - **Root directory**: `apps/shop` ✅
   - **Build command**: `npm ci && npm run pages:build`
   - **Build output directory**: `.vercel/output/static`
   - **Node version**: `20` (or latest LTS)

### Step 3: Re-trigger Build

After pushing the code:
1. Go to **Deployments** tab in Pages
2. Click **Retry deployment** on the failed build
3. Or push a new commit to trigger a new build

## Alternative: If Root Directory Setting Doesn't Work

If Pages still can't find the directory, try this build command instead:

```bash
cd apps/shop && npm ci && npm run pages:build
```

And set **Root directory** to: `.` (repo root)

## Verification

After the build succeeds, you should see:
- ✅ Build completes successfully
- ✅ Output directory contains `.vercel/output/static`
- ✅ No "Cannot find cwd" errors

## Next Steps After Build Succeeds

1. Add environment variables (see `docs/ENVIRONMENT.md`)
2. Add D1 and KV bindings
3. Configure custom domain
4. Test the deployment
