#!/bin/bash
# Build script that mimics Cloudflare Pages environment
# Run this locally to verify builds will succeed on Cloudflare

set -e

echo "=== Cloudflare-like Build Environment ==="
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Platform: $(uname -s)"
echo ""

# Clean install
echo "=== Clean Install ==="
rm -rf node_modules
npm ci

# Run build
echo "=== Build ==="
npm run build

echo ""
echo "=== Build Complete ==="
echo "Output in: dist/"
ls -la dist/
