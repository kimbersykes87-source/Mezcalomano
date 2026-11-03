// Stage 1: discover. Seeds and Overture bounding box queries into venue_sources.
//
//   node scripts/venues/discover.mjs --seeds scripts/venues/seeds/barcelona.csv
//   node scripts/venues/discover.mjs --overture --bbox=2.05,41.32,2.23,41.47 --release 2026-10-21.0 --licence "CDLA-Permissive-2.0"
//   add --dry-run to print without writing
//
// Seeds are the primary source (plan section 5). Overture validates and finds misses.
// The Overture release id and licence are recorded on every row and on the run.
// Overture is read with the DuckDB command line tool, which must be installed.

import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { parseSeeds, slugifyVenue } from "./lib/seeds.mjs";
import { runStage } from "./lib/stage.mjs";
import { normalizeVenueName } from "./lib/text.mjs";
import { geohash } from "./lib/geo.mjs";
import { websiteDomain } from "./lib/resolve.mjs";

const OVERTURE_CATEGORIES = ["bar", "pub", "cocktail_bar", "wine_bar", "lounge", "restaurant", "mexican_restaurant", "tapas_bar", "gastropub", "brewery"];

export function overtureSql({ release, bbox }) {
  const [west, south, east, north] = bbox;
  const cats = OVERTURE_CATEGORIES.map((c) => `'${c}'`).join(",");
  return `
INSTALL httpfs; LOAD httpfs; SET s3_region='us-west-2';
COPY (
  SELECT id, names.primary AS name, categories.primary AS category, confidence,
         websites[1] AS website, addresses[1].freeform AS address, addresses[1].locality AS city,
         addresses[1].country AS country_code, operating_status,
         ST_Y(geometry) AS lat, ST_X(geometry) AS lng
  FROM read_parquet('s3://overturemaps-us-west-2/release/${release}/theme=places/type=place/*', filename=true, hive_partitioning=1)
  WHERE bbox.xmin BETWEEN ${west} AND ${east} AND bbox.ymin BETWEEN ${south} AND ${north}
    AND categories.primary IN (${cats})
) TO '/dev/stdout' (FORMAT JSON);`.trim();
}

async function upsertVenueWithSource(db, row, source, sourceId, raw, licence, release) {
  const lat = row.lat ?? null, lng = row.lng ?? null;
  const slug = slugifyVenue(row.name, row.city);
  const { data: existing } = await db.from("venue_sources").select("venue_id").eq("source", source).eq("source_id", sourceId).maybeSingle();
  if (existing) return { created: false };
  const { data: venue, error } = await db.from("venues").insert({
    slug: `${slug}-${sourceId.slice(0, 6).toLowerCase().replace(/[^a-z0-9]/g, "")}`,
    name: row.name, name_normalized: normalizeVenueName(row.name), address: row.address, city: row.city,
    country_code: row.country_code, lat, lng,
    geom: lat !== null && lng !== null ? `SRID=4326;POINT(${lng} ${lat})` : null,
    geohash7: lat !== null && lng !== null ? geohash(lat, lng, 7) : null,
    website: row.website, website_domain: websiteDomain(row.website), status: "candidate",
  }).select("id").single();
  if (error) throw new Error(`venue insert: ${error.message}`);
  await db.from("venue_sources").insert({ venue_id: venue.id, source, source_id: sourceId, raw, licence, release_id: release });
  return { created: true };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) runStage("discover", async (ctx) => {
  const { args, db } = ctx;
  if (args.seeds) {
    const { rows, errors } = parseSeeds(fs.readFileSync(args.seeds, "utf8"));
    errors.forEach((e) => console.warn(`[discover] seed ${e}`));
    ctx.count("seed_rows", rows.length);
    ctx.count("seed_errors", errors.length);
    for (const row of rows) {
      if (!db) continue;
      const id = `${args.seeds}:${normalizeVenueName(row.name)}:${row.city || ""}`;
      const r = await upsertVenueWithSource(db, row, "seed", id, row, `seed:${row.list_name || "unspecified"}`, null);
      ctx.count(r.created ? "venues_created" : "already_known");
    }
  }
  if (args.overture) {
    const release = args.release;
    const bbox = String(args.bbox || "").split(",").map(Number);
    if (!release || bbox.length !== 4 || bbox.some((n) => !Number.isFinite(n))) {
      throw new Error("--overture needs --release <id> and --bbox=west,south,east,north");
    }
    ctx.release_id = release;
    const licence = args.licence || "CHECK_AT_BUILD_TIME";
    let out;
    try {
      out = execFileSync("duckdb", ["-c", overtureSql({ release, bbox })], { encoding: "utf8", maxBuffer: 256 * 1024 * 1024, timeout: 10 * 60 * 1000 });
    } catch (err) {
      ctx.fail("timeout");
      throw new Error(`duckdb query failed (is duckdb installed and S3 reachable?): ${String(err.message).slice(0, 200)}`);
    }
    const places = out.trim() ? JSON.parse(out) : [];
    ctx.count("overture_places", places.length);
    for (const p of places) {
      if (!db) continue;
      const r = await upsertVenueWithSource(db, p, "overture", p.id, p, licence, release);
      ctx.count(r.created ? "venues_created" : "already_known");
    }
  }
  return db ? null : "dry run: nothing written";
});
