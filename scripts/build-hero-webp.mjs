/**
 * Encode hero PNGs next to WebP siblings (same basename, .webp).
 * Run after adding/updating source PNGs under public/assets/photos/.
 */
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const HERO_PNGS_REL = [
  "public/assets/photos/home_hero_mobile_1200x900.png",
  "public/assets/photos/home_hero_tablet_1920x1080.png",
  "public/assets/photos/home_hero_desktop_2800x1333.png",
  "public/assets/photos/about_hero_mobile_1200x900.png",
  "public/assets/photos/about_hero_tablet_1920x1080.png",
  "public/assets/photos/about_hero_desktop_2800x1333.png",
];

async function main() {
  let ok = 0;
  let skipped = 0;
  for (const rel of HERO_PNGS_REL) {
    const input = path.join(root, rel);
    const output = input.replace(/\.png$/i, ".webp");
    try {
      await fs.access(input);
    } catch {
      console.warn(`skip (missing): ${rel}`);
      skipped++;
      continue;
    }
    await sharp(input).webp({ quality: 82, effort: 4 }).toFile(output);
    console.log(`wrote ${path.relative(root, output)}`);
    ok++;
  }
  console.log(`\nHero WebP: ${ok} written, ${skipped} skipped (no source PNG).`);
  if (ok === 0 && skipped > 0) {
    console.warn("Add PNG heroes under public/assets/photos/ then re-run: npm run build:hero-webp");
    process.exitCode = 0;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
