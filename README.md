# Mezcalómano Marketing Site

Modern, multi-page marketing site for Mezcalómano built with Astro and deployed on Cloudflare Pages. Features a contact form with reCAPTCHA, interactive agave species index, and responsive design.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The site will be available at `http://localhost:4321` (or another port if 4321 is in use).

## 📁 Project Structure

```
Mezcalomano/
├── public/
│   ├── data/
│   │   └── species.csv        # Agave species data (copy from assets/)
│   ├── robots.txt             # SEO robots file
│   ├── sitemap.xml            # SEO sitemap
│   ├── assets/                # Images (desktop, tablet, mobile backgrounds)
│   └── Logos/                 # Brand logos and assets
├── src/
│   ├── components/            # Reusable Astro components
│   │   ├── AnnouncementBar.astro
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Button.astro
│   │   └── Section.astro
│   ├── layouts/
│   │   └── Layout.astro       # Main site layout
│   ├── pages/                 # Astro pages (routes)
│   │   ├── index.astro        # Home page
│   │   ├── about.astro
│   │   ├── contact.astro
│   │   ├── map.astro
│   │   ├── resources.astro    # Species index page
│   │   ├── privacy.astro
│   │   ├── terms.astro
│   │   ├── shipping.astro
│   │   ├── returns.astro
│   │   └── api/
│   │       └── contact.ts     # Contact form API endpoint
│   ├── scripts/               # Client-side TypeScript
│   │   ├── contact-form.ts
│   │   ├── resources-filter.ts
│   │   └── scroll-observer.ts
│   ├── styles/
│   │   └── global.css         # Global styles and design tokens
│   └── env.d.ts               # TypeScript environment types
├── astro.config.mjs           # Astro configuration
├── package.json
├── tsconfig.json
└── _redirects                 # Cloudflare Pages redirects
```

## 📄 Site Pages

- `/` - Home page
- `/about` - About Mezcalómano
- `/contact` - Contact form
- `/map` - Mezcal store directory (coming soon)
- `/resources` - Agave species index with search/filters
- `/privacy` - Privacy policy
- `/terms` - Terms of service
- `/shipping` - Shipping policy
- `/returns` - Returns policy

## 🔧 Configuration

### Environment Variables (Cloudflare Pages)

The following environment variables must be set in Cloudflare Pages for the contact form to work:

- `RECAPTCHA_SECRET` - Google reCAPTCHA secret key (server-side verification, required)
- `PUBLIC_RECAPTCHA_SITE_KEY` - Google reCAPTCHA site key (frontend display, exposed to client, preferred)
  - OR `RECAPTCHA_SITE_KEY` - Alternative name (will be used if `PUBLIC_RECAPTCHA_SITE_KEY` is not set)
- `MAILCHANNELS_API_KEY` - Optional, if MailChannels requires API key

**To set environment variables in Cloudflare Pages:**

1. Go to your Cloudflare Pages project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable for **Production** (and optionally **Preview**)
4. Redeploy your site after adding variables

**📖 For detailed step-by-step instructions, see [CLOUDFLARE_PAGES_SETUP.md](docs/CLOUDFLARE_PAGES_SETUP.md)**

**Note:** The contact form automatically uses `PUBLIC_RECAPTCHA_SITE_KEY` or `RECAPTCHA_SITE_KEY` environment variables. If neither is set, it will fall back to a placeholder. Set `PUBLIC_RECAPTCHA_SITE_KEY` in Cloudflare Pages for production use.

### CSV Data Source

The Resources page requires a CSV file at `public/data/species.csv`. 

**To set up the CSV file:**

1. Copy the file from `assets/Mezcal Cards – Species Working - SPECIES MASTER.csv` to `public/data/species.csv`
2. Or manually place your species CSV file at `public/data/species.csv`

The CSV should have the following columns (or compatible):
- `scientific_name`
- `common_name`
- `geographic_region`
- `elevation_range`
- `mezcal_use`
- `conservation_status`
- `management_category`
- `suit`
- `rank` (optional)

## 🌐 Deployment to Cloudflare Pages

### Initial Setup

1. **Connect Repository**
   - Go to Cloudflare Dashboard → Pages
   - Click **Create a project**
   - Connect your GitHub/GitLab repository
   - Select the repository and branch (usually `main`)

2. **Build Settings**
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (leave empty)

3. **Environment Variables**
   - Add the environment variables listed above
   - See "Environment Variables" section for details

4. **Deploy**
   - Click **Save and Deploy**
   - Cloudflare will build and deploy automatically

### Automatic Deployments

After initial setup, deployments happen automatically when you push to your connected branch:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

Cloudflare Pages will automatically:
1. Build the site using `npm run build`
2. Deploy to production
3. Update the preview deployment

### Custom Domain

To use `mezcalomano.com`:

1. In Cloudflare Pages project settings, go to **Custom domains**
2. Add your domain: `mezcalomano.com`
3. Update DNS records as instructed by Cloudflare
4. SSL/TLS will be automatically configured

## 🔗 External Links

- **Shop**: Links to `https://shop.mezcalomano.com` (external Shopify store)
- All shop links open in the same tab

## 🎨 Design System

The site uses a consistent design system with CSS variables defined in `src/styles/global.css`:

- Colors: Dark grey background, muted olive primary, yellow agave secondary
- Typography: Open Sans font family
- Buttons: Primary (yellow agave), secondary (outlined), CTA styles
- Scroll animations: Subtle fade-in and slide-up on scroll

## 🛠️ Development Tips

### Adding New Pages

Create a new `.astro` file in `src/pages/`. The filename becomes the route:

- `src/pages/about.astro` → `/about`
- `src/pages/products/item.astro` → `/products/item`

### Using Components

Import and use components in your pages:

```astro
---
import Section from '../components/Section.astro';
import Button from '../components/Button.astro';
---

<Section>
  <h2>Title</h2>
  <Button href="/link" variant="primary">Click</Button>
</Section>
```

### Scroll Animations

Add scroll animations using `data-scroll` attribute:

```astro
<div data-scroll class="fade-in">
  Content that fades in on scroll
</div>
```

## 📚 Resources

- [Astro Documentation](https://docs.astro.build)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages)
- [MailChannels API](https://mailchannels.zendesk.com/hc/en-us)

## 📞 Support

For questions or issues:
- **Email**: hola@mezcalomano.com
- **Repository**: https://github.com/kimbersykes87-source/Mezcalomano

## 📝 Notes

- The contact form uses MailChannels for email delivery (configured for Cloudflare Workers/Pages)
- reCAPTCHA keys must be obtained from Google reCAPTCHA and added to Cloudflare Pages environment variables
- The species CSV file must be manually copied to `public/data/species.csv` before the resources page will work
- All pages include SEO meta tags, OpenGraph tags, and proper semantic HTML for accessibility
