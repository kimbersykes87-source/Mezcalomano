// Stage 7: export venues.geojson from approved, unexpired claims only, after the publish
// rule (section 4.2). Writes a local file; upload to the public bucket is a workflow step.
//
//   node scripts/venues/export.mjs [--out public/data/venues.geojson] [--dry-run]

import fs from "node:fs";
import path from "node:path";
import { buildGeoJson } from "./lib/publish.mjs";
import { runStage } from "./lib/stage.mjs";

runStage("export", async (ctx) => {
  const { db, args } = ctx;
  const out = path.resolve(String(args.out || "venues.geojson"));
  if (!db) {
    fs.writeFileSync(out, JSON.stringify({ type: "FeatureCollection", features: [] }));
    return "no database env: wrote an empty collection";
  }
  const { data: venues } = await db.from("venues").select("*").eq("status", "published");
  const items = [];
  for (const venue of venues || []) {
    const [{ data: claims }, { data: snapshots }, { data: reports }] = await Promise.all([
      db.from("venue_claims").select("*").eq("venue_id", venue.id).eq("state", "approved"),
      db.from("venue_menu_snapshots").select("id,url,status,fetched_at").eq("venue_id", venue.id),
      db.from("venue_reports").select("id").eq("venue_id", venue.id).is("handled_at", null),
    ]);
    items.push({ venue, claims: claims || [], snapshots: snapshots || [], openReports: reports || [] });
  }
  const geo = buildGeoJson(items);
  fs.writeFileSync(out, JSON.stringify(geo));
  ctx.count("published_venues", geo.features.length);
  ctx.count("candidates_checked", items.length);
});
