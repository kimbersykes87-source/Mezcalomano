# Cloudflare Pages Deployment Guide - Detailed Steps

This guide walks you through every step needed to deploy the Mezcalómano site to Cloudflare Pages.

---

## Part 1: Get Google reCAPTCHA Keys

You'll need both a **Site Key** (public, shown on the form) and a **Secret Key** (private, for server verification).

### Step 1.1: Create reCAPTCHA Site

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click **"+ Create"** (or **"Create"** if you see it)
3. Fill in the form:
   - **Label**: `Mezcalómano Contact Form`
   - **reCAPTCHA type**: Select **"reCAPTCHA v2"** → **"I'm not a robot" Checkbox**
   - **Domains**: 
     - Add: `mezcalomano.com`
     - Add: `*.mezcalomano.com` (covers subdomains)
     - If testing locally: `localhost` (optional, for dev)
   - **Accept the reCAPTCHA Terms of Service** (checkbox)
   - **Send alerts to owners** (optional)
4. Click **Submit**

### Step 1.2: Copy Your Keys

After creation, you'll see two keys:

1. **Site Key** (looks like: `6LcAbCdef1234567890_-abcdefghijklmnopqrstuvwxyz`)
   - This is public and will be embedded in your contact form
   - Copy this - you'll use it as `PUBLIC_RECAPTCHA_SITE_KEY`

2. **Secret Key** (looks like: `6LcAbCdef1234567890_-abcdefghijklmnopqrstuvwxyzSECRET`)
   - This is private and used for server-side verification
   - Copy this - you'll use it as `RECAPTCHA_SECRET`

**Important:** Keep the Secret Key secure. Never commit it to git or expose it in client-side code.

---

## Part 2: Set Up Cloudflare Pages Project

### Step 2.1: Access Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Log in with your account (e.g., `kimbersykes87@gmail.com`)
3. In the left sidebar, click **"Pages"**
   - If you don't see Pages, check that you're on the correct account
   - Pages should be available in most Cloudflare accounts

### Step 2.2: Create New Project (if not already created)

**If you're creating a new project:**

1. Click **"Create a project"** button (top right or center)
2. Select **"Connect to Git"** (GitHub, GitLab, or Bitbucket)
3. **Authorize Cloudflare** to access your repository
4. Select your repository: `Mezcalomano` (or whatever it's named)
5. Click **"Begin setup"**

**If project already exists:**
- Select your existing `Mezcalomano` project from the list

### Step 2.3: Configure Build Settings

In the build configuration page:

1. **Project name**: Should auto-populate as `Mezcalomano` (or your repo name)
   - You can change this if needed

2. **Production branch**: 
   - Select `main` (or `master` if that's your default branch)

3. **Framework preset**: 
   - Select **"Astro"** from the dropdown
   - This should auto-fill most settings

4. **Build command**: 
   - Should auto-fill as: `npm run build`
   - If not, enter: `npm run build`

5. **Build output directory**: 
   - Should auto-fill as: `dist`
   - If not, enter: `dist`

6. **Root directory**: 
   - Leave empty `/` (unless your Astro project is in a subfolder)

7. **Environment variables**: 
   - We'll configure these next - **DO NOT SKIP THIS**

8. Click **"Save and Deploy"** (but wait - we'll add env vars first)

---

## Part 3: Configure Environment Variables

**Critical:** Set environment variables BEFORE the first deployment so the contact form works immediately.

### Step 3.1: Navigate to Environment Variables

**Option A: During Initial Setup**
- Before clicking "Save and Deploy", scroll to the **"Environment variables"** section on the same page

**Option B: After Project Creation**
- Go to your Pages project
- Click **"Settings"** (top navigation)
- Click **"Environment variables"** (left sidebar)

### Step 3.2: Add Production Environment Variables

You'll see three sections: **Production**, **Preview**, and **Browser**. Focus on **Production** first.

#### Add `PUBLIC_RECAPTCHA_SITE_KEY`:

1. In the **Production** section, click **"Add variable"**
2. **Variable name**: Type exactly: `PUBLIC_RECAPTCHA_SITE_KEY`
   - Case-sensitive!
   - The `PUBLIC_` prefix exposes it to the browser (required for reCAPTCHA widget)
3. **Value**: Paste your reCAPTCHA **Site Key** (from Part 1.2)
4. Click **"Save"** or **"Add"**

#### Add `RECAPTCHA_SECRET`:

1. Click **"Add variable"** again (in Production section)
2. **Variable name**: Type exactly: `RECAPTCHA_SECRET`
   - Case-sensitive!
3. **Value**: Paste your reCAPTCHA **Secret Key** (from Part 1.2)
4. Click **"Save"** or **"Add"**

#### Add `MAILCHANNELS_API_KEY` (if needed):

**Note:** MailChannels typically doesn't require an API key for Cloudflare Workers/Pages. Skip this unless MailChannels documentation specifically requires it for your setup.

If you need it:
1. Get your MailChannels API key from [MailChannels Dashboard](https://mailchannels.zendesk.com/hc/en-us/articles/4565898358413-Setting-Up-MailChannels-for-Cloudflare-Workers)
2. Add as `MAILCHANNELS_API_KEY`
3. Paste the key value

### Step 3.3: Verify Variables Are Set

You should see in the **Production** section:
- `PUBLIC_RECAPTCHA_SITE_KEY` = `6Lc...` (your site key)
- `RECAPTCHA_SECRET` = `6Lc...SECRET` (your secret key)
- `MAILCHANNELS_API_KEY` (if you added it)

**Important Notes:**
- Variables are encrypted by Cloudflare
- After adding/changing variables, you must **redeploy** for changes to take effect
- Preview environment can have different values (useful for testing)

### Step 3.4: (Optional) Add Preview Environment Variables

For testing before production:
1. Switch to **Preview** section
2. Add the same variables with test/development keys if you created them
3. This allows pull requests/preview deployments to test the form

---

## Part 4: Deploy to Cloudflare Pages

### Step 4.1: Initial Deployment

**If you haven't deployed yet:**
1. After setting environment variables, click **"Save and Deploy"**
2. Cloudflare will start the build process
3. You'll see a deployment in progress with logs

**If project already exists:**
1. Make sure your code is committed and pushed to your connected branch
2. Cloudflare should auto-deploy, or you can trigger manually:
   - Go to your project → **"Deployments"** tab
   - Click **"Retry deployment"** on the latest deployment, or
   - Push a new commit to trigger auto-deployment

### Step 4.2: Monitor Build Process

1. Watch the **Build logs** in real-time:
   - You should see: `npm run build`
   - Then: `astro build`
   - Finally: "Build completed successfully"

2. **Common build issues:**
   - **"Module not found"**: Ensure all dependencies are in `package.json`
   - **"Environment variable not found"**: Double-check variable names (case-sensitive)
   - **"Build output not found"**: Verify build output directory is `dist`

### Step 4.3: Verify Deployment

After build completes:

1. **Check deployment status:**
   - Should show **"Success"** with a green checkmark
   - Deployment URL will be shown (e.g., `mezcalomano.pages.dev`)

2. **Visit the site:**
   - Click the deployment URL to open your site
   - Or go to your custom domain (if configured)

3. **Test pages:**
   - `/` - Home page loads
   - `/about` - About page works
   - `/contact` - Contact form displays (reCAPTCHA widget should appear)
   - `/resources` - Species index loads data
   - All other pages

---

## Part 5: Configure Custom Domain (mezcalomano.com)

### Step 5.1: Add Custom Domain in Cloudflare Pages

1. In your Pages project, go to **"Custom domains"** (left sidebar)
2. Click **"Set up a custom domain"**
3. Enter: `mezcalomano.com`
4. Click **"Continue"**

### Step 5.2: DNS Configuration

Cloudflare will guide you through DNS setup:

1. **If domain is already in Cloudflare:**
   - DNS records are automatically configured
   - You may see a CNAME record auto-created pointing to your Pages project

2. **If domain is elsewhere:**
   - Cloudflare will show you DNS records to add
   - Add a CNAME record: `@` or `mezcalomano.com` → `mezcalomano.pages.dev`
   - Or an A record if specified

### Step 5.3: SSL/TLS Configuration

1. **Automatic SSL:** Cloudflare will automatically provision SSL certificates
2. **Wait for activation:** SSL activation takes 1-5 minutes typically
3. **Verify:** Visit `https://mezcalomano.com` - should show secure lock icon

### Step 5.4: Domain Verification

1. Cloudflare will verify domain ownership
2. If domain is already in your Cloudflare account, verification is automatic
3. Otherwise, follow DNS verification steps shown

---

## Part 6: Test the Contact Form

### Step 6.1: Test Form Display

1. Visit `https://mezcalomano.com/contact` (or your deployment URL)
2. **Verify reCAPTCHA widget:**
   - Should see Google reCAPTCHA checkbox: "I'm not a robot"
   - If you see placeholder text or errors, check environment variables

### Step 6.2: Test Form Submission

1. Fill in the contact form:
   - Name: `Test User`
   - Email: `test@example.com`
   - Subject: `Test Message`
   - Message: `This is a test`
2. Complete reCAPTCHA checkbox
3. Click **"Send Message"**
4. **Expected result:**
   - Success message: "Thank you! Your message has been sent..."
   - Check `hola@mezcalomano.com` inbox for the email

### Step 6.3: Troubleshooting Form Issues

**If form doesn't submit:**

1. **Check browser console** (F12 → Console tab):
   - Look for errors mentioning reCAPTCHA
   - Check if `PUBLIC_RECAPTCHA_SITE_KEY` is loading

2. **Check Cloudflare Functions logs:**
   - Go to Pages project → **"Functions"** → **"Logs"**
   - Look for errors when submitting form
   - Check if `RECAPTCHA_SECRET` is accessible

3. **Common issues:**
   - **"reCAPTCHA verification failed"**: Secret key incorrect or not set
   - **"Please complete reCAPTCHA"**: Site key not set or incorrect
   - **"Failed to send email"**: MailChannels configuration issue (check domain DNS for MailChannels if required)

---

## Part 7: Verify All Features

### Checklist:

- [ ] All pages load correctly
- [ ] Navigation works (mobile menu too)
- [ ] Resources page loads species data from CSV
- [ ] Search and filters work on Resources page
- [ ] Contact form submits successfully
- [ ] Email received at hola@mezcalomano.com
- [ ] Footer links work
- [ ] Shop link goes to https://shop.mezcalomano.com
- [ ] Scroll animations work
- [ ] Mobile responsive design works
- [ ] SEO meta tags present (check page source)
- [ ] robots.txt accessible: `/robots.txt`
- [ ] sitemap.xml accessible: `/sitemap.xml`

---

## Part 8: Future Updates

### Making Changes and Redeploying

1. **Make code changes** locally
2. **Test locally**: `npm run dev`
3. **Build test**: `npm run build` (verify it works)
4. **Commit and push** to your connected branch:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```
5. **Cloudflare auto-deploys**: Deployment triggers automatically
6. **Monitor deployment**: Check Pages dashboard for build status

### Updating Environment Variables

1. Go to Pages project → **Settings** → **Environment variables**
2. Edit or add variables
3. **Important**: Click **"Save"** after changes
4. **Redeploy**: Changes only take effect after redeployment
   - Options:
     - Push a new commit (auto-redeploys)
     - Or manually retry latest deployment
     - Or create a new deployment

### Viewing Deployment History

- **Pages dashboard** → **"Deployments"** tab
- See all deployments with status, commit messages, and URLs
- **Rollback**: Click on a previous successful deployment → **"Promote to production"**

---

## Troubleshooting Common Issues

### Build Fails

**Error: "Cannot find module"**
- Solution: Ensure `package.json` includes all dependencies
- Check `node_modules` are committed (usually shouldn't be) or that npm install runs

**Error: "Environment variable not found"**
- Solution: Double-check variable names (case-sensitive, exact spelling)
- Ensure variables are set for **Production** environment
- Redeploy after adding variables

### reCAPTCHA Not Showing

**Widget missing or shows placeholder**
- Check: `PUBLIC_RECAPTCHA_SITE_KEY` is set in Cloudflare Pages
- Check: Site key is correct (copy from Google reCAPTCHA console)
- Check: Domain is added to reCAPTCHA allowed domains
- Solution: Redeploy after setting environment variable

### Contact Form Not Working

**Form submits but no email received**
- Check: Cloudflare Functions logs for errors
- Check: `RECAPTCHA_SECRET` is set correctly
- Check: MailChannels domain verification (if required)
- Check: Email inbox (including spam)

**Form validation fails**
- Check: Browser console for JavaScript errors
- Check: All required fields are filled
- Verify: reCAPTCHA is completed before submit

### Resources Page Shows No Data

**Species index empty**
- Check: `public/data/species.csv` exists in repository
- Check: File is in correct location (not in `.gitignore`)
- Verify: CSV file is copied to `dist/data/species.csv` after build
- Check: Browser console for fetch errors (404 on CSV)

---

## Quick Reference

### Environment Variables Summary

| Variable Name | Where Used | Example Value | Required |
|--------------|------------|---------------|----------|
| `PUBLIC_RECAPTCHA_SITE_KEY` | Contact form (browser) | `6LcAbCdef...` | Yes |
| `RECAPTCHA_SECRET` | API endpoint (server) | `6LcAbCdef...SECRET` | Yes |
| `MAILCHANNELS_API_KEY` | Email sending (if needed) | (varies) | No |

### Important URLs

- **Google reCAPTCHA Admin**: https://www.google.com/recaptcha/admin
- **Cloudflare Dashboard**: https://dash.cloudflare.com/
- **Cloudflare Pages**: https://dash.cloudflare.com/?to=/:account/pages
- **Your Site**: `https://mezcalomano.com` (after domain setup)

### Build Commands

```bash
# Local development
npm run dev          # Start dev server (http://localhost:4321)

# Production build
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build locally
```

---

## Support

If you encounter issues not covered here:

- **Email**: hola@mezcalomano.com
- **Cloudflare Support**: [Cloudflare Community](https://community.cloudflare.com/)
- **Astro Documentation**: https://docs.astro.build
- **Repository**: https://github.com/kimbersykes87-source/Mezcalomano

---

## Next Steps After Deployment

Once your site is live:

1. Test all pages and features thoroughly
2. Monitor contact form submissions
3. Check analytics (if set up)
4. Update sitemap if adding new pages
5. Keep dependencies updated: `npm update`

Your Mezcalómano site should now be fully deployed and functional!
