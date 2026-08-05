#!/usr/bin/env node
/**
 * Cheap DB read against public.species to keep a free-tier Supabase project awake.
 * Requires: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 * Run: npm run keepalive:supabase
 *
 * public.species has "Allow public read access on species" (SELECT, using true),
 * so the anon key is sufficient — no service role key needed.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

function loadEnvFile(relPath) {
  const p = join(projectRoot, relPath);
  if (!existsSync(p)) return;
  const env = readFileSync(p, "utf-8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

// .env first, then .env.local overrides (matches seed / other scripts)
loadEnvFile(".env");
loadEnvFile(".env.local");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error: selectError } = await supabase
    .from("species")
    .select("species_id")
    .limit(1);

  if (selectError) {
    console.error("Select failed:", selectError.message);
    process.exit(1);
  }

  const { count, error: countError } = await supabase
    .from("species")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("Count failed:", countError.message);
    process.exit(1);
  }

  const ts = new Date().toISOString();
  console.log(
    `[${ts}] Supabase keep-alive OK — species row sample: ${data?.length ?? 0}, count: ${count ?? "null"}`
  );
}

main().catch((err) => {
  console.error("Keep-alive failed:", err?.message || err);
  process.exit(1);
});
