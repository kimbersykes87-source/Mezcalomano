# Cloudflare Pages Deployment Checklist

## ✅ Completed
- [x] D1 Database created: `mezcalomano-shop` (ID: `058e2faf-6a00-403f-b8ad-1b545e5e1fe4`)
- [x] KV Namespace created: `mezcalomano-shop-kv` (ID: `e553a34b629d4a3cbd34be6845c9bb72`)
- [x] `wrangler.toml` updated with database and KV IDs
- [x] Database migrations applied (all 18 tables created)
- [x] Initial data seeded (Discovery Deck product, shipping zones, and rates)

## 📋 Remaining Steps

### 3. Create Cloudflare Pages Project
1. Go to https://dash.cloudflare.com
2. Left sidebar: **Workers & Pages** → **Pages**
3. Click **Create a project** (top right)
4. Connect your Git provider (GitHub/GitLab/Bitbucket)
5. Select the `Mezcalomano` repository
6. Configure:
   - **Project name**: `mezcalomano-shop`
   - **Production branch**: `main` (or your default branch)
   - **Root directory**: `apps/shop`
   - **Build command**: `npm ci && npm run pages:build`
   - **Build output directory**: `.open-next`
7. Click **Save and Deploy**

### 4. Add Bindings to Pages Project
After project creation:
1. In your Pages project, click **Settings** (top menu)
2. Click **Functions** (left sidebar)
3. Scroll to **D1 database bindings** section
   - Click **Add binding**
   - Variable name: `DB`
   - D1 database: Select `mezcalomano-shop`
   - Click **Save**
4. Scroll to **KV namespace bindings** section
   - Click **Add binding**
   - Variable name: `KV`
   - KV namespace: Select `mezcalomano-shop-kv`
   - Click **Save**

### 5. Add Environment Variables
In Pages project → **Settings** → **Environment variables** → **Production** tab:

**Required variables:**
- `NEXT_PUBLIC_SITE_URL` = `https://shop.mezcalomano.com`
- `STRIPE_SECRET_KEY` = `sk_live_...` (from Stripe dashboard)
- `STRIPE_WEBHOOK_SECRET` = `whsec_...` (from Stripe webhook settings)
- `SHIPSTATION_API_KEY` = (from ShipStation)
- `SHIPSTATION_API_SECRET` = (from ShipStation)
- `SHIPSTATION_STORE_ID` = (from ShipStation)
- `SHIPSTATION_WEBHOOK_SECRET` = (from ShipStation)
- `RESEND_API_KEY` = `re_...` (from Resend dashboard)
- `EMAIL_FROM` = `orders@mezcalomano.com` (or your verified domain)
- `TURNSTILE_SECRET_KEY` = (from Cloudflare Turnstile)
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = (from Cloudflare Turnstile)
- `GOOGLE_SHEETS_CLIENT_EMAIL` = `...@...iam.gserviceaccount.com`
- `GOOGLE_SHEETS_PRIVATE_KEY` = `-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n`
- `GOOGLE_SHEETS_SPREADSHEET_ID` = (after creating spreadsheet)
- `ADMIN_EMAIL_ALLOWLIST` = `admin@mezcalomano.com` (comma-separated)
- `NODE_ENV` = `production`

**Optional variables:**
- `NEXT_PUBLIC_GA4_MEASUREMENT_ID` = (if using Google Analytics)
- `STRIPE_TAX_CODE` = (if you have a specific tax code)

### 6. Set Up Custom Domain
1. In Pages project → **Settings** → **Custom domains**
2. Click **Set up a custom domain**
3. Enter: `shop.mezcalomano.com`
4. Follow DNS instructions (add CNAME record)
5. Wait for SSL certificate (usually 2-5 minutes)

### 7. Configure Cloudflare Turnstile
1. Go to **Security** → **Turnstile** in Cloudflare dashboard
2. Click **Add site**
3. Site name: `Mezcalomano Shop`
4. Domain: `shop.mezcalomano.com`
5. Copy **Site key** and **Secret key** to environment variables

### 8. Set Up Stripe Webhook
1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://shop.mezcalomano.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `charge.refunded`
5. Copy **Signing secret** → add as `STRIPE_WEBHOOK_SECRET`

### 9. Set Up ShipStation Webhook
1. Go to ShipStation → **Settings** → **Webhooks**
2. Click **Add Webhook**
3. URL: `https://shop.mezcalomano.com/api/shipstation/webhook`
4. Events: Select shipment updates
5. Copy **Webhook secret** → add as `SHIPSTATION_WEBHOOK_SECRET`

### 10. Create Google Sheets Spreadsheet
```bash
cd apps/shop
GOOGLE_SHEETS_CLIENT_EMAIL=... \
GOOGLE_SHEETS_PRIVATE_KEY="..." \
GOOGLE_SHEETS_SPREADSHEET_NAME="Mezcalomano Ops" \
npm run sheets:create
```
This creates the spreadsheet with required tabs. Copy the Spreadsheet ID to `GOOGLE_SHEETS_SPREADSHEET_ID`.

### 11. Test Deployment
1. Visit `https://shop.mezcalomano.com`
2. Test product page loads
3. Test cart functionality
4. Test checkout flow (use Stripe test mode first)
5. Verify webhooks are receiving events

## 🔍 Troubleshooting

**Build fails:**
- Check build logs in Pages → Deployments
- Verify `npm run pages:build` works locally
- Check environment variables are set

**Database errors:**
- Verify D1 binding is configured correctly
- Check migrations ran: `wrangler d1 execute mezcalomano-shop --command="SELECT name FROM sqlite_master WHERE type='table'"`

**KV errors:**
- Verify KV binding is configured correctly
- Check namespace ID matches `wrangler.toml`

**Webhook not receiving events:**
- Check webhook URL is accessible
- Verify webhook secret matches
- Check webhook logs in Stripe/ShipStation dashboards