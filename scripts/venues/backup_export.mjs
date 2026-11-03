// Nightly export of the PUBLIC tables to CSV, for the venues-data branch (plan section 11).
// Never exports venue_submissions (private; Kimber saves a monthly export by hand).
//
//   node scripts/venues/backup_export.mjs --out backup/

import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import { getClient, parseArgs } from "./lib/stage.mjs";

export const PUBLIC_TABLES = ["venues", "venue_sources", "venue_menu_snapshots", "venue_claims", "venue_reports", "merge_review", "pipeline_runs", "unknown_terms"];
// venue_sources.raw can hold third party records, so it is exported without the raw column.
const DROP_COLUMNS = { venue_sources: ["raw"] };

const args = parseArgs();
const db = getClient();
if (!db) { console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required"); process.exit(1); }
const outDir = path.resolve(String(args.out || "backup"));
fs.mkdirSync(outDir, { recursive: true });
for (const table of PUBLIC_TABLES) {
  const { data, error } = await db.from(table).select("*").limit(50000);
  if (error) { console.error(`${table}: ${error.message}`); process.exitCode = 1; continue; }
  const rows = (data || []).map((r) => {
    const copy = { ...r };
    for (const col of DROP_COLUMNS[table] || []) delete copy[col];
    for (const [k, v] of Object.entries(copy)) if (v && typeof v === "object") copy[k] = JSON.stringify(v);
    return copy;
  });
  fs.writeFileSync(path.join(outDir, `${table}.csv`), Papa.unparse(rows));
  console.log(`${table}: ${rows.length} rows`);
}
