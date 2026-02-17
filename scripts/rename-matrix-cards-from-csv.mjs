/**
 * Uses data/Species_Final - Website.csv as source of truth:
 * 1. Reads 40 species (common_name) in CSV order
 * 2. Builds target filenames: {slug}.png (same slug as src/lib/slug.ts)
 * 3. Renames PNGs in public/assets/matrix/cards/ by position: 01.png, 02.png, ... or 1.png, 2.png, ... -> slug.png
 * 4. Writes public/assets/matrix/cards/index.json with common_name -> /assets/matrix/cards/{slug}.png
 *
 * Run: node scripts/rename-matrix-cards-from-csv.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Papa from "papaparse";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const CSV_PATH = path.join(projectRoot, "data", "Species_Final - Website.csv");
const CARDS_DIR = path.join(projectRoot, "public", "assets", "matrix", "cards");
const INDEX_PATH = path.join(CARDS_DIR, "index.json");

function toSlug(name) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\u0300-\u036f/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

// Parse CSV and get common_name for each data row (expect 40)
const csvText = fs.readFileSync(CSV_PATH, "utf-8");
const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
const rows = parsed.data;
if (!rows || rows.length !== 40) {
  console.warn(`Expected 40 data rows, got ${rows?.length ?? 0}. Proceeding with what we have.`);
}

const commonNames = rows.map((r) => (r.common_name ?? "").trim()).filter(Boolean);
const slugs = commonNames.map(toSlug);
const indexEntries = commonNames.map((common_name, i) => ({
  common_name,
  image_800: `/assets/matrix/cards/${slugs[i]}.png`,
  image_400: `/assets/matrix/cards/${slugs[i]}.png`,
}));

// Write index.json (source of truth for the app)
fs.mkdirSync(CARDS_DIR, { recursive: true });
fs.writeFileSync(INDEX_PATH, JSON.stringify(indexEntries, null, 2), "utf-8");
console.log(`Wrote ${INDEX_PATH} with ${indexEntries.length} entries (CSV order, slug-based .png paths).`);

// Rename PNGs only when filenames are not already the target slugs (e.g. 01.png or COLOURED_PENCIL_001_...)
const existingFiles = fs.readdirSync(CARDS_DIR).filter((f) => f.toLowerCase().endsWith(".png"));
const slugSet = new Set(slugs);
const alreadySlugNamed = existingFiles.every((f) => slugSet.has(path.basename(f, ".png")));

if (existingFiles.length === 0) {
  console.log("No PNG files in cards dir. Add 40 PNGs (01.png..40.png or COLOURED_PENCIL_001_... in CSV order), then re-run.");
  process.exit(0);
}

if (alreadySlugNamed && existingFiles.length === slugs.length) {
  console.log("Files already use slug names; no rename needed.");
  process.exit(0);
}

// Sort by leading number: 001, 002, ... 040 (CSV row 1 -> index 0, etc.)
const numericSort = (a, b) => {
  const numA = parseInt(a.match(/\d+/)?.[0] ?? "0", 10) || 0;
  const numB = parseInt(b.match(/\d+/)?.[0] ?? "0", 10) || 0;
  return numA - numB;
};
existingFiles.sort(numericSort);

if (existingFiles.length !== slugs.length) {
  console.warn(
    `Found ${existingFiles.length} PNGs but have ${slugs.length} slugs. Rename skipped.`
  );
  process.exit(0);
}

let renamed = 0;
for (let i = 0; i < existingFiles.length; i++) {
  const from = path.join(CARDS_DIR, existingFiles[i]);
  const targetName = `${slugs[i]}.png`;
  const to = path.join(CARDS_DIR, targetName);
  if (path.resolve(from) === path.resolve(to) || existingFiles[i] === targetName) continue;
  if (fs.existsSync(to) && path.resolve(from) !== path.resolve(to)) {
    console.warn(`Skip ${existingFiles[i]} -> ${targetName} (target exists).`);
    continue;
  }
  fs.renameSync(from, to);
  console.log(`${existingFiles[i]} -> ${targetName}`);
  renamed++;
}
console.log(`Renamed ${renamed} files.`);
