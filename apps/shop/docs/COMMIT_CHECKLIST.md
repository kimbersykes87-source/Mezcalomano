# Pre-Commit Checklist

Before committing to git, verify these files are ready:

## Files to Commit

### Required
- [x] `apps/shop/` - Entire shop application directory
- [x] `wrangler.toml` - Root-level config (for Pages detection)

### Optional (can commit separately)
- [ ] Modified assets (if you want to include them)
- [ ] CSS changes (if you want to include them)

## What NOT to Commit

- `.env.local` or any `.env` files
- `node_modules/`
- `.next/` build output
- `.vercel/` build output
- Any files with secrets or API keys

## Quick Commit Command

```bash
cd C:\dev\Mezcalomano

# Stage only the shop app
git add apps/
git add wrangler.toml

# Review what will be committed
git status

# Commit
git commit -m "Add Mezcalomano shop application with Cloudflare Pages setup"

# Push
git push
```

## After Committing

1. Wait for Cloudflare Pages to detect the new commit
2. Check the build logs - it should now find `apps/shop`
3. If build still fails, check `docs/BUILD_FIX.md` for troubleshooting
