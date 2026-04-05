#!/usr/bin/env node
/**
 * Convert transparent PNG matrix cards → WebP, upload to Supabase Storage (`species-cards`),
 * set `species.image_url`, and rewrite `public/assets/matrix/cards/index.json` with public URLs.
 *
 * Requires: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (service role required for upload).
 * Optional: --dry-run (encode only, no upload / DB / index write)
 *
 * Apply migration first: npm run supabase:push (009_species_cards_storage_bucket.sql)
 * Run: node scripts/upload-species-cards-webp.mjs
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const CARDS_DIR = path.join(projectRoot, "public", "assets", "matrix", "cards");
const INDEX_PATH = path.join(CARDS_DIR, "index.json");

function loadEnvFile(relPath) {
  const p = path.join(projectRoot, relPath);
  if (!fs.existsSync(p)) return;
  const env = fs.readFileSync(p, "utf-8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const dryRun = process.argv.includes("--dry-run");
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!dryRun && (!supabaseUrl || !serviceKey)) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (anon key cannot upload in most setups)."
  );
  process.exit(1);
}

const BUCKET = "species-cards";

/** WebP settings: preserve alpha from transparent PNGs */
const webpOptions = {
  quality: 88,
  alphaQuality: 100,
  effort: 5,
};

function basenameFromMatrixPath(urlPath) {
  const s = String(urlPath).replace(/^\/+/, "");
  const prefix = "assets/matrix/cards/";
  if (!s.startsWith(prefix)) return null;
  return s.slice(prefix.length);
}

async function main() {
  if (!fs.existsSync(INDEX_PATH)) {
    console.error("Missing index:", INDEX_PATH);
    process.exit(1);
  }

  const list = JSON.parse(fs.readFileSync(INDEX_PATH, "utf-8"));
  const supabase = dryRun ? null : createClient(supabaseUrl, serviceKey);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;
  const out = [];

  for (const entry of list) {
    const common_name = entry.common_name;
    const img800 = entry.image_800;
    if (typeof img800 === "string" && img800.startsWith("http")) {
      out.push(entry);
      skipped++;
      continue;
    }

    const base = basenameFromMatrixPath(img800);
    if (!base || !base.toLowerCase().endsWith(".png")) {
      out.push(entry);
      skipped++;
      continue;
    }

    const localPng = path.join(CARDS_DIR, base);
    if (!fs.existsSync(localPng)) {
      console.warn(`Missing PNG (skip): ${base} (${common_name})`);
      out.push(entry);
      skipped++;
      continue;
    }

    const slug = base.replace(/\.png$/i, "");
    const storagePath = `${slug}.webp`;

    let webpBuffer;
    try {
      webpBuffer = await sharp(localPng).webp(webpOptions).toBuffer();
    } catch (e) {
      console.error(`Sharp failed ${base}:`, e.message);
      out.push(entry);
      failed++;
      continue;
    }

    if (dryRun) {
      console.log(`[dry-run] ${storagePath} (${(webpBuffer.length / 1024).toFixed(1)} KB) ← ${base}`);
      out.push(entry);
      continue;
    }

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(storagePath, webpBuffer, {
      contentType: "image/webp",
      upsert: true,
    });

    if (upErr) {
      console.error(`Upload failed ${storagePath}:`, upErr.message);
      out.push(entry);
      failed++;
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    out.push({
      common_name,
      image_800: publicUrl,
      image_400: publicUrl,
    });

    const { error: dbErr } = await supabase
      .from("species")
      .update({ image_url: publicUrl })
      .eq("common_name", common_name);

    if (dbErr) {
      console.warn(`DB update warning for "${common_name}":`, dbErr.message);
    }

    uploaded++;
    console.log(`OK ${common_name} → ${storagePath}`);
  }

  if (!dryRun) {
    fs.writeFileSync(INDEX_PATH, JSON.stringify(out, null, 2) + "\n", "utf-8");
    console.log(`\nWrote ${INDEX_PATH}`);
  }

  console.log(`\nDone: uploaded ${uploaded}, skipped ${skipped}, failed ${failed}${dryRun ? " (dry-run)" : ""}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
