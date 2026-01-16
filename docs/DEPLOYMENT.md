# Deployment Guide

Complete guide for deploying the Mezcalómano marketing site to Cloudflare Pages.

## Prerequisites

- GitHub account
- Cloudflare account with `mezcalomano.com` domain
- Repository: `https://github.com/kimbersykes87-source/Mezcalomano.git`

## Deployment Methods

### Option 1: GitHub Integration (Recommended)

1. **Connect Repository to Cloudflare Pages:**
   - Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Go to **Pages** → **Create a project**
   - Connect your GitHub account
   - Select the `Mezcalomano` repository

2. **Configure Build Settings:**
   - **Framework preset**: None (or Static)
   - **Build command**: (leave empty)
   - **Build output directory**: `/` (root)

3. **Deploy:**
   - Click **Save and Deploy**
   - Cloudflare will automatically deploy on every push to `main` branch

4. **Add Custom Domains:**
   - Go to **Custom domains** → **Set up a custom domain**
   - Enter `mezcalomano.com`
   - Cloudflare will automatically configure DNS

### Option 2: Direct Upload

If you prefer not to use GitHub:

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Pages** → **Create a project** → **Upload assets**
3. Drag and drop all files from the project root
4. Click **Deploy site**
5. Add custom domain: `mezcalomano.com`

## Post-Deployment

### Verify Deployment

1. Visit your site: `https://mezcalomano.com`
2. Test redirects:
   - `https://mezcalomano.com/buy` → Should redirect to Shopify product
   - `https://mezcalomano.com/shop` → Should redirect to Shopify store

### DNS Configuration

DNS is automatically configured by Cloudflare Pages when you add a custom domain. If you need to manually configure:

- **A Record**: Automatically managed by Cloudflare
- **CNAME**: Automatically managed by Cloudflare

## Important Notes

- The `_redirects` file must be in the root directory for Cloudflare Pages to process it
- No build process is required - this is a static HTML site
- Changes take effect immediately after deployment
- Email signature images need absolute URLs once live (see [Email Signature](docs/email-signature.html))

## Troubleshooting

**Redirects not working:**
- Ensure `_redirects` is in the root directory
- Check that URLs in `_redirects` match `js/shopify-config.js`
- Clear browser cache and test in incognito mode

**DNS issues:**
- Verify domain is properly configured in Cloudflare
- Check DNS records in Cloudflare Dashboard → DNS
- Allow 24-48 hours for DNS propagation