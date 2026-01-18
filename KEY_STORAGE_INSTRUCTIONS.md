# Where to Store reCAPTCHA Keys

## ⚠️ CRITICAL: Never Commit Keys to Git

**DO NOT** store your reCAPTCHA keys directly in code files. They must be stored as **environment variables**.

---

## 🔑 Your Keys

- **Site Key**: `6Ldc4k4sAAAAADW0Vpjg0KmHUwiGSiDH5VOTKauf`
- **Secret Key**: `6Ldc4k4sAAAAAHN7JiEt1zxhbNH7sC1F1gzpHX0K`

---

## 📍 Where to Store Them

### Option 1: Cloudflare Pages (Production) ⭐ REQUIRED

**This is where your live site will get the keys from.**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → Your Pages Project
2. **Settings** → **Environment Variables**
3. In the **Production** section, add:

   **Variable 1:**
   - Name: `PUBLIC_RECAPTCHA_SITE_KEY`
   - Value: `6Ldc4k4sAAAAADW0Vpjg0KmHUwiGSiDH5VOTKauf`
   - Click **Save**

   **Variable 2:**
   - Name: `RECAPTCHA_SECRET`
   - Value: `6Ldc4k4sAAAAAHN7JiEt1zxhbNH7sC1F1gzpHX0K`
   - Click **Save**

4. **Redeploy** your site after adding variables (push a new commit or retry deployment)

### Option 2: Local .env File (Development Only)

**For local testing with `npm run dev`:**

1. Create a `.env` file in the project root (same folder as `package.json`)
2. Add these lines:

```
PUBLIC_RECAPTCHA_SITE_KEY=6Ldc4k4sAAAAADW0Vpjg0KmHUwiGSiDH5VOTKauf
RECAPTCHA_SECRET=6Ldc4k4sAAAAAHN7JiEt1zxhbNH7sC1F1gzpHX0K
```

3. **Important**: The `.env` file should be in `.gitignore` (already added)
   - This prevents committing secrets to git
   - Verify: Check `.gitignore` contains `.env`

---

## ✅ Verification

### Check Cloudflare Pages Variables:

1. Pages Project → Settings → Environment Variables
2. Under **Production**, you should see:
   - `PUBLIC_RECAPTCHA_SITE_KEY` = `6Ldc4k4sAAAAADW0Vpjg0...`
   - `RECAPTCHA_SECRET` = `6Ldc4k4sAAAAAHN7JiEt1z...`

### Check Local .env (if created):

```bash
# Verify .env exists (should show the file)
cat .env

# Verify .env is in .gitignore (should list .env)
cat .gitignore | grep .env
```

---

## 🚫 What NOT to Do

❌ **DON'T** put keys in:
- `src/pages/contact.astro` (hardcoded)
- `astro.config.mjs`
- `package.json`
- Any `.js` or `.ts` files
- Any file that gets committed to git

❌ **DON'T** commit `.env` file to git (check `.gitignore` includes it)

✅ **DO** use environment variables only

---

## 📝 Summary

**For Production (Cloudflare Pages):**
- Store in Cloudflare Pages → Settings → Environment Variables
- Variable names: `PUBLIC_RECAPTCHA_SITE_KEY` and `RECAPTCHA_SECRET`

**For Local Development:**
- Store in `.env` file in project root
- File is automatically ignored by git (if `.gitignore` includes `.env`)

**Your keys are already configured correctly in the code** - the contact form will automatically pick them up from environment variables. You just need to set them in Cloudflare Pages for the live site to work!
