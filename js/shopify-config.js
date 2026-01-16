/**
 * Shopify Store Configuration
 * 
 * Update these URLs once your Shopify store is set up:
 * - SHOPIFY_STORE_URL: Your main Shopify store URL (e.g., https://REPLACE_ME.myshopify.com)
 * - SHOPIFY_PRODUCT_URL: Direct link to your product page
 * - SHOPIFY_DOMAIN_URL: The custom domain for your shop (e.g., https://shop.mezcalomano.com)
 */

// Shopify URLs - Updated with real store URLs
const SHOPIFY_CONFIG = {
    STORE_URL: "https://shop.mezcalomano.com",
    PRODUCT_URL: "https://shop.mezcalomano.com/products/discovery-deck",
    DOMAIN_URL: "https://shop.mezcalomano.com",
    BUY_PATH: "/buy"
};

// Helper function to get Shopify product URL
function getShopifyProductUrl() {
    return SHOPIFY_CONFIG.PRODUCT_URL;
}

// Helper function to get Shopify store URL
function getShopifyStoreUrl() {
    return SHOPIFY_CONFIG.STORE_URL;
}