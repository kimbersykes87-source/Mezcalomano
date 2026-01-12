# Deployment Guide - Mezcalomano.com

## Option 1: Cloudflare Pages (Recommended)

### Step 1: Push to GitHub
1. Create a new repository on GitHub (e.g., `Mezcalomano`)
2. Run these commands:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/Mezcalomano.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy via Cloudflare Pages
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Pages** → **Create a project**
3. Connect your GitHub account and select the `Mezcalomano` repository
4. Configure build settings:
   - **Framework preset**: None (or Static)
   - **Build command**: (leave empty)
   - **Build output directory**: `/` (root)
5. Click **Save and Deploy**
6. Once deployed, go to **Custom domains** → **Set up a custom domain**
7. Enter `mezcalomano.com` and `www.mezcalomano.com`
8. Cloudflare will automatically configure DNS

---

## Option 2: Direct Upload via Cloudflare Pages

If you prefer not to use GitHub:
1. Log in to Cloudflare Dashboard
2. Go to **Pages** → **Create a project** → **Upload assets**
3. Drag and drop all files from your project folder
4. Click **Deploy site**
5. Add custom domain: `mezcalomano.com`

---

## Important Notes

- **Email Signature Images**: Remember that for the email signature to work properly in emails, the images need to be hosted online. Once your site is live, update the image URLs in `email_signature.html` to use absolute URLs like `https://mezcalomano.com/Logos/email_sig_180x40px.png` before copying it into Gmail.

- **DNS**: Make sure your domain's DNS is properly configured in Cloudflare (as outlined in RESOURCES.md)
