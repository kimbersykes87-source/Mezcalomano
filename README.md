# Mezcalómano Marketing Site

Lightweight marketing site for Mezcalómano with Shopify integration. Deployed on Cloudflare Pages.

## 🚀 Quick Start

1. **View locally**: Open `index.html` in a browser
2. **Deploy**: Push to GitHub → Cloudflare Pages auto-deploys
3. **Configure**: Update Shopify URLs in `js/shopify-config.js` and `_redirects`

## 📁 Project Structure

```
Mezcalomano/
├── index.html              # Home page
├── product.html            # Product page
├── about.html              # About page
├── support.html            # Support page
├── privacy.html            # Privacy policy
├── terms.html              # Terms of service
├── _redirects              # Cloudflare Pages redirects
├── css/
│   └── style.css           # Site styles
├── js/
│   └── shopify-config.js   # Shopify URL configuration
├── assets/                 # Images (desktop, tablet, mobile backgrounds)
├── Logos/                  # Brand logos and assets
├── config/                 # Configuration files
│   └── wrangler.toml       # Cloudflare configuration
└── docs/                   # Documentation
    ├── DEPLOYMENT.md       # Deployment guide
    ├── PHASE2_SHOPIFY_HANDOFF.md  # Shopify setup
    ├── REDIRECTS.md        # Redirect configuration
    └── RESOURCES.md        # Setup resources
```

## 🔗 Shopify Integration

Shopify URLs are configured in two places:

1. **`js/shopify-config.js`** - JavaScript configuration for dynamic links
2. **`_redirects`** - Cloudflare Pages redirect rules

See [docs/REDIRECTS.md](docs/REDIRECTS.md) for details on redirects and how to update URLs.

## 📄 Site Pages

- `/` - Home page
- `/product` - Product details
- `/about` - About Mezcalómano
- `/support` - Shipping, returns, contact
- `/privacy` - Privacy policy
- `/terms` - Terms of service
- `/buy` - Redirects to Shopify product (302)
- `/shop` - Redirects to Shopify store (302)

## 🛠️ Local Development

No build process required. Simply:

```bash
# Option 1: Open directly
open index.html

# Option 2: Use a local server
python -m http.server 8000
# or
npx serve
```

## 📚 Documentation

All documentation is in the [`docs/`](docs/) directory:

- **[Deployment Guide](docs/DEPLOYMENT.md)** - Complete deployment instructions
- **[Shopify Setup](docs/PHASE2_SHOPIFY_HANDOFF.md)** - Phase 2 Shopify integration
- **[Redirects](docs/REDIRECTS.md)** - Redirect configuration
- **[Resources](docs/RESOURCES.md)** - Cloudflare, email, DNS setup

## 🔧 Configuration

### Shopify URLs

Update these files when Shopify store URLs change:

1. `js/shopify-config.js` - Lines 11-13
2. `_redirects` - Lines 4-5

### Cloudflare Pages

- **Framework**: None (static site)
- **Build command**: (empty)
- **Output directory**: `/` (root)
- **Redirects**: Processed from `_redirects` in root

## 📦 Deployment

Deployment is automatic via Cloudflare Pages when you push to GitHub:

```bash
git add .
git commit -m "Your message"
git push origin main
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## 🎨 Brand Assets

- **Logos**: `/Logos/` directory
- **Backgrounds**: `/assets/` directory (responsive images)
- **Email Signature**: `docs/email-signature.html`

## 📞 Support

For questions or issues:
- **Email**: hola@mezcalomano.com
- **Repository**: https://github.com/kimbersykes87-source/Mezcalomano