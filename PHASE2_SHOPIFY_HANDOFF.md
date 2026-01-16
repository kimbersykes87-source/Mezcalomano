# Phase 2: Shopify Handoff Instructions

This document contains the exact steps to connect your Shopify store to `shop.mezcalomano.com` once your Shopify store setup is complete.

## 📍 Where to Paste Shopify URLs

### Primary Location: `js/shopify-config.js`

Update the following lines in `js/shopify-config.js` (lines 10-13):

```javascript
const SHOPIFY_CONFIG = {
    STORE_URL: "https://REPLACE_ME.myshopify.com",  // ← Replace this
    PRODUCT_URL: "https://REPLACE_ME.myshopify.com/products/REPLACE_ME",  // ← Replace this
    DOMAIN_URL: "https://shop.mezcalomano.com",
    BUY_PATH: "/buy"
};
```

**Example after update:**
```javascript
const SHOPIFY_CONFIG = {
    STORE_URL: "https://mezcalomano.myshopify.com",
    PRODUCT_URL: "https://mezcalomano.myshopify.com/products/discovery-deck",
    DOMAIN_URL: "https://shop.mezcalomano.com",
    BUY_PATH: "/buy"
};
```

### Secondary Location: `_redirects`

Update the following lines in `_redirects` (lines 5-7) with the **same URLs**:

```
/buy 302 https://REPLACE_ME.myshopify.com/products/REPLACE_ME  ← Replace this
/shop 302 https://REPLACE_ME.myshopify.com  ← Replace this
/cart 302 https://REPLACE_ME.myshopify.com  ← Replace this
```

**Example after update:**
```
/buy 302 https://mezcalomano.myshopify.com/products/discovery-deck
/shop 302 https://mezcalomano.myshopify.com
/cart 302 https://mezcalomano.myshopify.com
```

## 🌐 DNS Configuration in Cloudflare

Once Shopify is ready and you want to point `shop.mezcalomano.com` directly to Shopify:

1. **Log in to Cloudflare Dashboard**: https://dash.cloudflare.com/
2. **Select the `mezcalomano.com` domain**
3. **Go to DNS → Records**
4. **Add a new CNAME record:**
   - **Type**: `CNAME`
   - **Name**: `shop`
   - **Target**: `shops.myshopify.com`
   - **Proxy status**: ⚠️ **Grey cloud (DNS only)** - This is critical!
   - **TTL**: Auto
5. **Save the record**

⚠️ **Important**: The proxy status must be **DNS only (grey cloud)**, NOT proxied (orange cloud). Shopify requires direct DNS resolution for domain verification.

## ✅ Shopify Domain Verification Steps

1. **In Shopify Admin**, go to **Settings → Domains**
2. **Click "Connect existing domain"**
3. **Enter**: `shop.mezcalomano.com`
4. **Shopify will provide verification instructions** - these typically involve:
   - Adding a TXT record for domain verification
   - Waiting for DNS propagation (can take up to 48 hours, usually much faster)
5. **Once verified**, Shopify will automatically configure SSL/HTTPS

## 🧪 Final Testing Checklist

After completing the above steps, test the following:

- [ ] **Test `/buy` link**: Visit `https://mezcalomano.com/buy` (or `https://shop.mezcalomano.com/buy` if domain is connected) - should redirect to Shopify product page
- [ ] **Test checkout flow**: Add product to cart and proceed through checkout
- [ ] **Test order email**: Place a test order and verify you receive order confirmation email
- [ ] **Test payment**: Complete a test transaction (use Shopify's test mode or a real payment method)
- [ ] **Test mobile**: Verify the site works correctly on mobile devices
- [ ] **Test redirects**: Verify `/shop` and `/cart` redirects work correctly

## 📝 Notes

- The site currently hosts a marketing/handoff page. Once `shop.mezcalomano.com` is connected to Shopify, Shopify will serve the storefront directly.
- The `/buy`, `/shop`, and `/cart` redirects in `_redirects` will continue to work even after the domain is connected to Shopify.
- All "Buy Now" buttons on the site are configured to use `SHOPIFY_CONFIG.PRODUCT_URL` from `js/shopify-config.js`.

## 🚨 Troubleshooting

**If domain verification fails:**
- Ensure the CNAME record has grey cloud (DNS only) in Cloudflare
- Wait 24-48 hours for DNS propagation
- Double-check the CNAME target is exactly `shops.myshopify.com` (no trailing slash)

**If redirects don't work:**
- Ensure `_redirects` file is in the root of your Cloudflare Pages deployment
- Verify the URLs in `_redirects` match the URLs in `js/shopify-config.js`
- Clear browser cache and test again