/**
 * Sync matrix cards from SPECIES artwork folder:
 * 1. Empty public/assets/matrix/cards
 * 2. Copy SPECIES PNGs into cards folder, renaming to slug.png
 * 3. Regenerate index.json from Species_Final - Cards.csv
 *
 * Run: node scripts/sync-matrix-cards-from-species.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Papa from "papaparse";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const SPECIES_DIR =
  "C:\\Users\\kimbe\\Dropbox\\Kimber\\Business\\Edward Kimber Sykes\\Clients\\Mezcalomano\\ARTWORK\\Discovery Deck\\SPECIES";
const CARDS_DIR = path.join(projectRoot, "public", "assets", "matrix", "cards");
const CSV_PATH = path.join(projectRoot, "data", "Species_Final - Cards.csv");
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

// 1. Parse Cards CSV for species rows (rank 2-10 or A)
const csvText = fs.readFileSync(CSV_PATH, "utf-8");
const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
const speciesRows = (parsed.data || []).filter(
  (r) =>
    r.common_name &&
    r.playing_suit &&
    (r.rank === "A" || (parseInt(r.rank, 10) >= 2 && parseInt(r.rank, 10) <= 10))
);

// Build suit_rank -> slug mapping
const suitRankToSlug = {};
for (const row of speciesRows) {
  const key = `${row.playing_suit}_${row.rank}`;
  suitRankToSlug[key] = toSlug(row.common_name.trim());
}

// 2. Empty cards folder
if (fs.existsSync(CARDS_DIR)) {
  const files = fs.readdirSync(CARDS_DIR);
  for (const f of files) {
    fs.unlinkSync(path.join(CARDS_DIR, f));
  }
  console.log(`Emptied ${CARDS_DIR} (removed ${files.length} files)`);
}
fs.mkdirSync(CARDS_DIR, { recursive: true });

// 3. Copy SPECIES PNGs with slug filenames
const speciesFiles = fs
  .readdirSync(SPECIES_DIR)
  .filter((f) => f.toLowerCase().endsWith(".png"));

let copied = 0;
for (const file of speciesFiles) {
  const m = file.match(/^(Hearts|Spades|Diamonds|Clubs)_(\d+|A)_/);
  if (!m) continue;
  const suit = m[1];
  const rank = m[2];
  const key = `${suit}_${rank}`;
  const slug = suitRankToSlug[key];
  if (!slug) {
    console.warn(`No mapping for ${key}, skipping ${file}`);
    continue;
  }
  const src = path.join(SPECIES_DIR, file);
  const dest = path.join(CARDS_DIR, `${slug}.png`);
  fs.copyFileSync(src, dest);
  copied++;
  console.log(`${file} -> ${slug}.png`);
}
console.log(`Copied ${copied} PNGs into ${CARDS_DIR}`);

// 4. Write index.json
const indexEntries = speciesRows.map((row) => {
  const common_name = row.common_name.trim();
  const slug = toSlug(common_name);
  return {
    common_name,
    image_800: `/assets/matrix/cards/${slug}.png`,
    image_400: `/assets/matrix/cards/${slug}.png`,
  };
});
fs.writeFileSync(INDEX_PATH, JSON.stringify(indexEntries, null, 2), "utf-8");
console.log(`Wrote ${INDEX_PATH} with ${indexEntries.length} entries.`);
