#!/usr/bin/env node
/**
 * Seed species table from data/Species_Final - Website.csv
 * Requires: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY)
 * Run: node scripts/seed-species-from-csv.mjs
 */

import { createClient } from "@supabase/supabase-js";
import Papa from "papaparse";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { randomUUID } from "crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");
const csvPath = join(projectRoot, "data", "Species_Final - Website.csv");

// Load .env.local if present
const envPath = join(projectRoot, ".env.local");
if (existsSync(envPath)) {
  const env = readFileSync(envPath, "utf-8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY)."
  );
  process.exit(1);
}

function parseProducers(val) {
  if (!val || typeof val !== "string") return null;
  const cleaned = val.replace(/^"+|"+$/g, "").trim();
  const parts = cleaned.split(",").map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts.join(",") : null;
}

function parseProducerLinks(val) {
  if (!val || typeof val !== "string") return null;
  const parts = val
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
  return parts.length ? parts.join(",") : null;
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const csv = readFileSync(csvPath, "utf-8");
  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
  const rows = parsed.data;

  if (!rows.length) {
    console.error("No rows in CSV");
    process.exit(1);
  }

  console.log(`Loaded ${rows.length} rows from CSV`);

  const speciesRows = rows.map((row, i) => {
    const producersRaw = row.producers ?? "";
    const producers = parseProducers(producersRaw);
    const producerLinksRaw = row.producer_links ?? "";
    const producerLinks = parseProducerLinks(producerLinksRaw);

    const habitat =
      row.Terrain && String(row.Terrain).trim()
        ? { terrain: String(row.Terrain).trim() }
        : null;

    return {
      id: randomUUID(),
      species_id: i + 1,
      common_name: String(row.common_name ?? "").trim(),
      scientific_name: String(row.scientific_name ?? "").trim(),
      states: row.states ? String(row.states).trim() : null,
      geo_region: row.geo_region ? String(row.geo_region).trim() : null,
      size_height_feet: row.size_height_feet ? String(row.size_height_feet).trim() : null,
      size_height_meters: row.size_height_meters ? String(row.size_height_meters).trim() : null,
      mezcal_use: row.mezcal_use ? String(row.mezcal_use).trim() : null,
      description: row.description ? String(row.description).trim() : null,
      producers,
      producer_links: producerLinks,
      habitat,
      image_url: null,
    };
  });

  const { data: existing } = await supabase.from("species").select("id, common_name");
  const byCommonName = new Map((existing ?? []).map((s) => [s.common_name, s.id]));

  let inserted = 0;
  let updated = 0;

  for (const row of speciesRows) {
    const existingId = byCommonName.get(row.common_name);
    if (existingId) {
      const { error } = await supabase
        .from("species")
        .update({
          scientific_name: row.scientific_name,
          states: row.states,
          geo_region: row.geo_region,
          size_height_feet: row.size_height_feet,
          size_height_meters: row.size_height_meters,
          mezcal_use: row.mezcal_use,
          description: row.description,
          producers: row.producers,
          producer_links: row.producer_links,
          habitat: row.habitat,
        })
        .eq("id", existingId);
      if (error) {
        console.error(`Update failed for ${row.common_name}:`, error.message);
      } else {
        updated++;
      }
    } else {
      const { error } = await supabase.from("species").insert(row);
      if (error) {
        console.error(`Insert failed for ${row.common_name}:`, error.message);
      } else {
        inserted++;
        byCommonName.set(row.common_name, row.id);
      }
    }
  }

  console.log(`Done: ${inserted} inserted, ${updated} updated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
