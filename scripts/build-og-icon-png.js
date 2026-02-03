#!/usr/bin/env node
/**
 * Build PNG from mezcalomano_icon_white.svg for social share (og:image).
 * Output: public/assets/og/mezcalomano_icon_white.png (1200×960, 5:4 ratio).
 */
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const inputSvg = path.join(projectRoot, 'assets', 'brand', 'logos', 'mezcalomano_icon_white.svg');
const outputPng = path.join(projectRoot, 'public', 'assets', 'og', 'mezcalomano_icon_white.png');

const WIDTH = 1200;
const HEIGHT = 960; // 5:4 ratio (matches SVG viewBox 150×120)

sharp(inputSvg)
  .resize(WIDTH, HEIGHT)
  .png()
  .toFile(outputPng)
  .then((info) => {
    console.log(`✓ Wrote ${outputPng} (${info.width}×${info.height})`);
  })
  .catch((err) => {
    console.error('Error building og icon PNG:', err);
    process.exit(1);
  });
