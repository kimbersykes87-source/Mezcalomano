# Deployment Checklist for Mezcalómano Astro Site

## Pre-Deployment Tasks

### 1. Install Dependencies
```bash
npm install
```

### 2. Copy CSV Data File
- Copy `assets/Mezcal Cards – Species Working - SPECIES MASTER.csv` to `public/data/species.csv`
- Verify the file exists: `public/data/species.csv`

### 3. Update reCAPTCHA Site Key
- Open `src/pages/contact.astro`
- Replace `RECAPTCHA_SITE_KEY_PLACEHOLDER` with your actual Google reCAPTCHA site key
- Or implement environment variable approach for dynamic key

### 4. Test Locally
```bash
npm run dev
# Visit http://localhost:4321
# Test all pages, navigation, contact form, resources page
```

### 5. Build for Production
```bash
npm run build
# Verify dist/ folder is created with all assets
```

## Cloudflare Pages Configuration

### Build Settings
- **Framework preset**: Astro
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (leave empty)

### Environment Variables (Required)
Set these in Cloudflare Pages → Settings → Environment Variables:

1. **RECAPTCHA_SECRET**
   - Value: Your Google reCAPTCHA secret key
   - Used for: Server-side reCAPTCHA verification in contact form API

2. **RECAPTCHA_SITE_KEY** (Optional if hardcoded)
   - Value: Your Google reCAPTCHA site key
   - Used for: Frontend reCAPTCHA widget display

3. **MAILCHANNELS_API_KEY** (Optional, if required by MailChannels)
   - Value: MailChannels API key (if needed)
   - Used for: Email delivery from contact form

### DNS Configuration
- Ensure `mezcalomano.com` is configured in Cloudflare Pages
- Add custom domain in Cloudflare Pages → Custom domains
- SSL/TLS will be automatically configured

## Post-Deployment Verification

### Test All Pages
- [ ] Home page loads and displays correctly
- [ ] About page displays mission statement
- [ ] Contact page form is visible
- [ ] Map page shows "coming soon" message
- [ ] Resources page loads species data from CSV
- [ ] Policy pages (privacy, terms, shipping, returns) are accessible

### Test Navigation
- [ ] Header navigation works (mobile hamburger menu)
- [ ] Footer links work
- [ ] Shop link goes to https://shop.mezcalomano.com (external)
- [ ] All internal links work correctly

### Test Contact Form
- [ ] Form validation works (client-side)
- [ ] reCAPTCHA widget displays
- [ ] Form submits to `/api/contact`
- [ ] Email is received at hola@mezcalomano.com (test submission)

### Test Resources Page
- [ ] CSV loads and displays species data
- [ ] Search box filters species correctly
- [ ] Filter dropdowns work (management category, suit)
- [ ] Mobile shows card layout
- [ ] Desktop shows table layout

### Test SEO
- [ ] robots.txt accessible at `/robots.txt`
- [ ] sitemap.xml accessible at `/sitemap.xml`
- [ ] Page titles are unique and descriptive
- [ ] Meta descriptions are present
- [ ] OpenGraph tags are present (check with social media debugger)

### Test Accessibility
- [ ] Skip-to-content link works
- [ ] Keyboard navigation works
- [ ] Focus states are visible
- [ ] Screen reader friendly (test with screen reader)

### Test Mobile Responsiveness
- [ ] Mobile menu works
- [ ] All pages are readable on mobile
- [ ] Touch targets are adequate size
- [ ] Forms are usable on mobile

## Known Issues / Notes

- **CSV File**: Must be manually copied to `public/data/species.csv` before resources page will work
- **reCAPTCHA**: Site key placeholder in contact.astro needs to be replaced with actual key
- **Environment Variables**: Must be set in Cloudflare Pages before contact form will work
- **MailChannels**: May require DNS configuration - check MailChannels documentation

## Troubleshooting

### Resources Page Not Loading Data
- Check that `public/data/species.csv` exists
- Check browser console for fetch errors
- Verify CSV format matches expected columns

### Contact Form Not Working
- Verify environment variables are set in Cloudflare Pages
- Check reCAPTCHA site key is correct
- Test API endpoint: `curl -X POST https://mezcalomano.com/api/contact`
- Check Cloudflare Pages function logs

### Build Fails
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors: `npm run build`
- Verify Node.js version compatibility (18+)

## Support

For issues or questions:
- **Email**: hola@mezcalomano.com
- **Repository**: https://github.com/kimbersykes87-source/Mezcalomano
