/**
 * Rename files in source/agave_images to match app slugs (ASCII, no accents).
 * Parses agave_background_removal_log.txt: "OK | Deck_original.png -> current_on_disk.png"
 * Deck_original is URL-encoded in the log; middle segment is the display name.
 *
 * Run: node scripts/normalize-agave-images.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const IMAGES_DIR = path.join(projectRoot, "source", "agave_images");
const LOG_PATH = path.join(IMAGES_DIR, "agave_background_removal_log.txt");

function toSlug(name) {
  return String(name)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

/** e.g. Hearts_2_Espad%C3%ADn_v004.png -> display "Espadín" */
function extractDisplayNameFromDeckLine(raw) {
  const trimmed = raw.trim();
  let decoded = trimmed;
  try {
    decoded = decodeURIComponent(trimmed.replace(/ /g, ""));
  } catch {
    decoded = trimmed;
  }
  const base = decoded.replace(/\.png$/i, "");
  const m = base.match(/^(?:Hearts|Spades|Diamonds|Clubs)_(?:\d+|A)_(.+)$/i);
  if (!m) return null;
  let middle = m[1].replace(/_v\d+$/i, "");
  return middle.replace(/-/g, " ").trim();
}

function parseLog(content) {
  const rows = [];
  for (const line of content.split("\n")) {
    const m = line.match(/OK\s+\|\s+(.+?)\s+->\s+(\S+)\s*$/);
    if (!m) continue;
    const [, srcPart, dstFile] = m;
    const display = extractDisplayNameFromDeckLine(srcPart);
    if (!display) {
      console.warn("Could not parse deck name from:", srcPart);
      continue;
    }
    const slug = toSlug(display);
    rows.push({ display, slug, currentFile: dstFile.trim() });
  }
  return rows;
}

function main() {
  if (!fs.existsSync(LOG_PATH)) {
    console.error("Missing log:", LOG_PATH);
    process.exit(1);
  }
  const logText = fs.readFileSync(LOG_PATH, "utf-8");
  const rows = parseLog(logText);
  if (!rows.length) {
    console.error("No OK lines parsed from log.");
    process.exit(1);
  }

  const bySlug = new Map();
  for (const r of rows) {
    if (bySlug.has(r.slug)) {
      console.warn(`Duplicate slug "${r.slug}" from "${r.display}" and earlier row`);
    }
    bySlug.set(r.slug, r);
  }

  const phase1 = [];
  for (const { slug, currentFile } of rows) {
    const fromPath = path.join(IMAGES_DIR, currentFile);
    if (!fs.existsSync(fromPath)) {
      console.warn("Missing file (skip):", currentFile);
      continue;
    }
    const tmpName = `.__norm__${slug}__.png`;
    const tmpPath = path.join(IMAGES_DIR, tmpName);
    fs.renameSync(fromPath, tmpPath);
    phase1.push({ tmpPath, finalPath: path.join(IMAGES_DIR, `${slug}.png`), slug });
  }

  for (const { tmpPath, finalPath, slug } of phase1) {
    if (fs.existsSync(finalPath)) {
      fs.unlinkSync(finalPath);
    }
    fs.renameSync(tmpPath, finalPath);
    console.log("→", path.basename(finalPath));
  }

  console.log(`\nRenamed ${phase1.length} images to slug filenames in ${IMAGES_DIR}`);
}

main();
