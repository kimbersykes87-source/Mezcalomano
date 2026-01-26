import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

/**
 * Astro Configuration for Cloudflare Pages
 * 
 * CRITICAL: This file connects the site to Cloudflare Pages.
 * - adapter: cloudflare() - Required for Cloudflare deployment
 * - site: 'https://mezcalomano.com' - Canonical domain (used for SEO, sitemap, etc.)
 * - output: 'hybrid' - Enables both static and server-side rendering
 * 
 * See CONNECTIONS.md for full documentation of all external connections.
 * 
 * https://astro.build/config
 */
export default defineConfig({
  output: 'hybrid',
  adapter: cloudflare(),
  site: 'https://mezcalomano.com',
  integrations: [],
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
    esbuild: {
      include: /\.ts$/,
      exclude: /\.astro$/,
    },
  },
  typescript: {
    tsconfig: undefined,
  },
});
