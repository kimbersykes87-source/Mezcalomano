# ⚠️ Security Notice - reCAPTCHA Keys Exposed

## What Happened

GitGuardian detected that reCAPTCHA keys were committed to the GitHub repository in `KEY_STORAGE_INSTRUCTIONS.md`. This has been fixed by removing the actual keys and replacing them with placeholders.

## ✅ Immediate Actions Taken

1. **Removed keys from documentation** - Updated `KEY_STORAGE_INSTRUCTIONS.md` to use placeholders
2. **Committed fix** - New commit removes exposed keys from the codebase
3. **Verified `.env` is gitignored** - Local `.env` file is properly excluded from git

## ⚠️ RECOMMENDED: Regenerate reCAPTCHA Keys

Since the keys were exposed in git history (which is public), you should **regenerate new keys** for security:

### Step 1: Create New reCAPTCHA Site

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Either:
   - **Delete the old site** and create a new one, OR
   - **Create a new site** and keep both temporarily during migration

3. Copy your **new Site Key** and **new Secret Key**

### Step 2: Update Cloudflare Pages

1. Go to Cloudflare Pages → Your Project → Settings → Environment Variables
2. **Update existing variables:**
   - `PUBLIC_RECAPTCHA_SITE_KEY` → Replace with new Site Key
   - `RECAPTCHA_SECRET` → Replace with new Secret Key
3. **Save** changes

### Step 3: Update Local .env (if using)

If you have a local `.env` file:
1. Update `.env` file with new keys
2. Restart dev server (`npm run dev`)

### Step 4: Redeploy

1. Push a commit (or redeploy manually in Cloudflare Pages)
2. Verify the contact form works with new keys

## ✅ Current Security Status

- ✅ **Keys removed from all code files**
- ✅ **Keys removed from documentation files**
- ✅ **`.env` file is gitignored** (won't be committed)
- ✅ **Keys only in Cloudflare Pages** (encrypted and secure)
- ⚠️ **Keys still in git history** (public, cannot be fully removed)
- ✅ **Fix committed** (prevents future exposure)

## 🔐 Best Practices Going Forward

### ✅ DO:
- Store keys **only** in Cloudflare Pages environment variables (for production)
- Store keys in **local `.env` file** (for development, gitignored)
- Use **placeholder values** in documentation examples

### ❌ DON'T:
- Never commit actual keys to git
- Never put keys in code files (`.js`, `.ts`, `.astro`)
- Never put keys in documentation files
- Never share keys in screenshots or public forums

## 📝 Key Storage Summary

**Current Secure Locations:**
- ✅ Cloudflare Pages → Settings → Environment Variables (Production)
- ✅ Local `.env` file (Development only, gitignored)

**Where Keys Should NEVER Be:**
- ❌ Git repository (commit history)
- ❌ Documentation files with actual values
- ❌ Code files
- ❌ Public files

---

## Need Help?

If you need assistance regenerating keys or updating Cloudflare Pages:
- See `docs/CLOUDFLARE_PAGES_SETUP.md` Part 1 for creating new reCAPTCHA keys
- See Part 3 for updating environment variables in Cloudflare Pages

**The site is currently working with the existing keys** - but for best security practices, regenerate them when convenient.
