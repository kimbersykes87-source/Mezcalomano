#!/bin/bash
set -e

# Ensure we're in the apps/shop directory
cd "$(dirname "$0")"

# Install dependencies
npm ci

# Build for Cloudflare Pages
npm run pages:build
