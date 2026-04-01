/**
 * Copy slug-named PNGs from source/agave_images to public/assets/matrix/cards/
 * and write index.json from the directory Website CSV (common_name order = alphabetical).
 *
 * Run: node scripts/sync-agave-images-to-matrix.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Papa from "papaparse";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const SOURCE_DIR = path.join(projectRoot, "source", "agave_images");
const CARDS_DIR = path.join(projectRoot, "public", "assets", "matrix", "cards");
const CSV_PATH = path.join(projectRoot, "data", "Species_Final - Website.csv");

function toSlug(name) {
  return String(name)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

function main() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error("Missing CSV:", CSV_PATH);
    process.exit(1);
  }
  const csvText = fs.readFileSync(CSV_PATH, "utf-8");
  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  const rows = (parsed.data || [])
    .map((r) => String(r.common_name ?? "").trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "en"));

  if (!rows.length) {
    console.error("No species rows in CSV");
    process.exit(1);
  }

  fs.mkdirSync(CARDS_DIR, { recursive: true });
  for (const f of fs.readdirSync(CARDS_DIR)) {
    if (f.endsWith(".png")) {
      fs.unlinkSync(path.join(CARDS_DIR, f));
    }
  }

  const manifest = [];
  let copied = 0;
  let missing = 0;
  for (const common_name of rows) {
    const slug = toSlug(common_name);
    const src = path.join(SOURCE_DIR, `${slug}.png`);
    const dest = path.join(CARDS_DIR, `${slug}.png`);
    if (!fs.existsSync(src)) {
      console.warn(`Missing source image for "${common_name}" (${slug}.png)`);
      missing++;
      manifest.push({
        common_name,
        image_800: `/assets/matrix/cards/${slug}.png`,
        image_400: `/assets/matrix/cards/${slug}.png`,
      });
      continue;
    }
    fs.copyFileSync(src, dest);
    copied++;
    manifest.push({
      common_name,
      image_800: `/assets/matrix/cards/${slug}.png`,
      image_400: `/assets/matrix/cards/${slug}.png`,
    });
  }

  const indexPath = path.join(CARDS_DIR, "index.json");
  fs.writeFileSync(indexPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`Copied ${copied} PNGs → ${CARDS_DIR}`);
  if (missing) console.warn(`${missing} species had no source PNG (index still lists paths)`);
  console.log(`Wrote ${indexPath} (${manifest.length} entries)`);
}

main();
