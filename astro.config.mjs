import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  adapter: cloudflare(),
  site: 'https://mezcalomano.com',
  integrations: [],
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
});
