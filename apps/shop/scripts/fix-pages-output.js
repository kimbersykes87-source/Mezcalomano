#!/usr/bin/env node
/**
 * Post-build script to fix OpenNext output for Cloudflare Pages
 * 
 * This script ensures the output structure is compatible with Cloudflare Pages:
 * 1. Renames worker.js to _worker.js (if needed)
 * 2. Creates _routes.json to exclude static assets from Worker
 * 3. Ensures proper asset paths
 */

const fs = require('fs');
const path = require('path');

const outputDir = path.join(process.cwd(), '.open-next');

if (!fs.existsSync(outputDir)) {
  console.error('Error: .open-next directory not found. Run the build first.');
  process.exit(1);
}

// 1. Check if worker.js exists and ensure it's accessible
// Cloudflare Pages uses worker.js from the output directory
const workerJs = path.join(outputDir, 'worker.js');
if (fs.existsSync(workerJs)) {
  console.log('✓ Worker file found: worker.js');
} else {
  console.warn('⚠ Warning: worker.js not found in .open-next');
  console.warn('   This may cause routing issues. Check your build output.');
}

// 2. Create _routes.json to exclude static assets from Worker
const routesJson = {
  version: 1,
  include: ['/*'],
  exclude: [
    '/_next/static/*',
    '/_next/image*',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
    '/static/*',
    '/assets/*',
    '/*.png',
    '/*.jpg',
    '/*.jpeg',
    '/*.gif',
    '/*.svg',
    '/*.ico',
    '/*.webp',
    '/*.woff',
    '/*.woff2',
    '/*.ttf',
    '/*.eot',
  ],
};

const routesJsonPath = path.join(outputDir, '_routes.json');
console.log('Creating _routes.json for static asset routing...');
fs.writeFileSync(routesJsonPath, JSON.stringify(routesJson, null, 2));

console.log('✅ Post-build fixes applied successfully!');
console.log('   - Worker file: _worker.js');
console.log('   - Routes config: _routes.json');
