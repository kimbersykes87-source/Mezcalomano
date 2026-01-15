# Setup Values Collection Guide

Collect these values from each service before adding them to Cloudflare Pages environment variables.

## Cloudflare Turnstile
1. Go to: https://dash.cloudflare.com → **Security** → **Turnstile**
2. Click **Add site**
3. Site name: `Mezcalomano Shop`
4. Domain: `shop.mezcalomano.com`
5. Copy:
   - **Site key** → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
   - **Secret key** → `TURNSTILE_SECRET_KEY`

## Stripe (UK Account)
1. Go to: https://dashboard.stripe.com
2. **API keys** (Developers → API keys):
   - **Secret key** (use `sk_live_...`) → `STRIPE_SECRET_KEY`
3. **Products**:
   - Create product: "Mezcalomano - Discovery Deck"
   - Create price: $39.99 USD
4. **Stripe Tax**:
   - Enable Stripe Tax
   - Add tax registrations for your jurisdictions
   - Set shipping origin to USA
5. **Webhooks** (Developers → Webhooks):
   - Add endpoint: `https://shop.mezcalomano.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`
   - Copy **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`

**Optional:**
- **Tax code**: If you have a specific HS/tax code, add as `STRIPE_TAX_CODE`

## ShipStation
1. Go to: https://ss.shipstation.com
2. **API Settings** (Settings → API Settings):
   - Copy **API Key** → `SHIPSTATION_API_KEY`
   - Copy **API Secret** → `SHIPSTATION_API_SECRET`
3. **Stores** (Settings → Stores):
   - Find or create store for `iprintandship.com`
   - Copy **Store ID** → `SHIPSTATION_STORE_ID`
4. **Webhooks** (Settings → Webhooks):
   - Add webhook URL: `https://shop.mezcalomano.com/api/shipstation/webhook`
   - Select events: shipment updates
   - Copy **Webhook secret** → `SHIPSTATION_WEBHOOK_SECRET`

## Resend
1. Go to: https://resend.com
2. **API Keys** (API Keys tab):
   - Create new API key
   - Copy key (`re_...`) → `RESEND_API_KEY`
3. **Domains** (Domains tab):
   - Add domain: `mezcalomano.com`
   - Verify DNS records
   - Use: `orders@mezcalomano.com` → `EMAIL_FROM`

## Google Sheets / Service Account
1. Go to: https://console.cloud.google.com
2. **Create Project** (or select existing)
3. **Enable Google Sheets API**:
   - APIs & Services → Enable APIs
   - Search "Google Sheets API" → Enable
4. **Create Service Account**:
   - IAM & Admin → Service Accounts
   - Create Service Account
   - Name: `mezcalomano-sheets-sync`
   - Role: Editor (or custom with Sheets access)
5. **Create Key**:
   - Click service account → Keys → Add Key → JSON
   - Download JSON file
   - From JSON, copy:
     - `client_email` → `GOOGLE_SHEETS_CLIENT_EMAIL`
     - `private_key` (entire block with newlines as `\n`) → `GOOGLE_SHEETS_PRIVATE_KEY`
6. **Create Spreadsheet**:
   - Run: `npm run sheets:create` (see GOOGLE_SHEETS.md)
   - Copy **Spreadsheet ID** from URL → `GOOGLE_SHEETS_SPREADSHEET_ID`
   - Share spreadsheet with service account email (Editor access)

## Google Analytics 4 (Optional)
1. Go to: https://analytics.google.com
2. Create property: `Mezcalomano Shop`
3. **Admin** → **Data Streams** → **Web**
4. Copy **Measurement ID** (`G-...`) → `NEXT_PUBLIC_GA4_MEASUREMENT_ID`

## Admin Email Allowlist
- Format: comma-separated emails
- Example: `admin@mezcalomano.com,operations@mezcalomano.com`
- Set as: `ADMIN_EMAIL_ALLOWLIST`

## Site URL
- Production: `https://shop.mezcalomano.com`
- Set as: `NEXT_PUBLIC_SITE_URL`

## Environment Checklist

Copy this checklist and check off as you collect each value:

### Required
- [ ] `NEXT_PUBLIC_SITE_URL`
- [ ] `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- [ ] `TURNSTILE_SECRET_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `SHIPSTATION_API_KEY`
- [ ] `SHIPSTATION_API_SECRET`
- [ ] `SHIPSTATION_STORE_ID`
- [ ] `SHIPSTATION_WEBHOOK_SECRET`
- [ ] `RESEND_API_KEY`
- [ ] `EMAIL_FROM`
- [ ] `GOOGLE_SHEETS_CLIENT_EMAIL`
- [ ] `GOOGLE_SHEETS_PRIVATE_KEY`
- [ ] `GOOGLE_SHEETS_SPREADSHEET_ID`
- [ ] `ADMIN_EMAIL_ALLOWLIST`
- [ ] `NODE_ENV` = `production`

### Optional
- [ ] `NEXT_PUBLIC_GA4_MEASUREMENT_ID`
- [ ] `STRIPE_TAX_CODE`