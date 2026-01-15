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

// 1. Copy worker.js to _worker.js for Cloudflare Pages advanced mode
// Cloudflare Pages requires _worker.js in the output directory root
const workerJs = path.join(outputDir, 'worker.js');
const workerJsPages = path.join(outputDir, '_worker.js');

if (fs.existsSync(workerJs)) {
  console.log('✓ Worker file found: worker.js');
  // Copy to _worker.js for Pages advanced mode
  if (!fs.existsSync(workerJsPages)) {
    console.log('Creating _worker.js for Cloudflare Pages advanced mode...');
    fs.copyFileSync(workerJs, workerJsPages);
    console.log('✓ Created _worker.js');
  } else {
    console.log('✓ _worker.js already exists');
  }
} else {
  console.error('❌ Error: worker.js not found in .open-next');
  console.error('   The OpenNext build may have failed or the output structure changed.');
  process.exit(1);
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

// 3. Ensure _next directory exists and static files are accessible
// OpenNext may put static files in different locations depending on version
// We need to ensure they're at .open-next/_next/static/ for Cloudflare Pages
// Check both the OpenNext output directory and the original Next.js build directory
const nextStaticDest = path.join(outputDir, '_next', 'static');
const appDir = process.cwd(); // This should be apps/shop when running the build
const possibleSources = [
  path.join(outputDir, '.next', 'static'), // OpenNext might copy here
  path.join(outputDir, '_next', 'static'), // Already in correct location
  path.join(appDir, '.next', 'static'), // Original Next.js build output
];

let staticSource = null;
for (const source of possibleSources) {
  if (fs.existsSync(source)) {
    staticSource = source;
    break;
  }
}

if (staticSource && staticSource !== nextStaticDest) {
  console.log(`Found static files in ${path.relative(outputDir, staticSource)}`);
  console.log('Ensuring _next/static exists at correct location...');
  
  // Create _next directory if it doesn't exist
  const nextDir = path.join(outputDir, '_next');
  if (!fs.existsSync(nextDir)) {
    fs.mkdirSync(nextDir, { recursive: true });
  }
  
  // Copy static files if _next/static doesn't exist or is different
  if (!fs.existsSync(nextStaticDest)) {
    console.log('Copying static files to _next/static...');
    
    // Recursive copy function
    function copyRecursive(src, dest) {
      const exists = fs.existsSync(src);
      const stats = exists && fs.statSync(src);
      const isDirectory = exists && stats.isDirectory();
      
      if (isDirectory) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach((childItemName) => {
          copyRecursive(
            path.join(src, childItemName),
            path.join(dest, childItemName)
          );
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    }
    
    copyRecursive(staticSource, nextStaticDest);
    console.log('✓ Static files copied to _next/static');
  } else {
    console.log('✓ _next/static already exists');
  }
} else if (fs.existsSync(nextStaticDest)) {
  console.log('✓ _next/static exists at correct location');
} else {
  // If static files still not found, check if we need to copy from the Next.js .next directory
  // Next.js builds to .next/static in the app directory
  const nextBuildStatic = path.join(appDir, '.next', 'static');
  if (fs.existsSync(nextBuildStatic)) {
    console.log(`Found static files in Next.js build output: ${path.relative(appDir, nextBuildStatic)}`);
    console.log('Copying to _next/static for Cloudflare Pages...');
    
    const nextDir = path.join(outputDir, '_next');
    if (!fs.existsSync(nextDir)) {
      fs.mkdirSync(nextDir, { recursive: true });
    }
    
    // Recursive copy function
    function copyRecursive(src, dest) {
      const exists = fs.existsSync(src);
      const stats = exists && fs.statSync(src);
      const isDirectory = exists && stats.isDirectory();
      
      if (isDirectory) {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        fs.readdirSync(src).forEach((childItemName) => {
          copyRecursive(
            path.join(src, childItemName),
            path.join(dest, childItemName)
          );
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    }
    
    copyRecursive(nextBuildStatic, nextStaticDest);
    console.log('✓ Static files copied from Next.js build to _next/static');
  } else {
    console.log('⚠ Warning: Static files not found. They may be generated during build.');
    console.log('   Checked locations:');
    possibleSources.forEach(src => {
      console.log(`   - ${src}`);
    });
    console.log(`   - ${nextBuildStatic} (Next.js build output)`);
  }
}

console.log('✅ Post-build fixes applied successfully!');
console.log('   - Worker file: _worker.js (for Pages advanced mode)');
console.log('   - Routes config: _routes.json');
console.log('   - Static files: _next/static/');
