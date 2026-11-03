// Stage 2: resolve entities. Finds possible duplicates and writes merge_review rows.
// Keys: normalized name, geohash 7 neighborhood, name similarity. The website domain is
// a key only when it is not on the aggregator blocklist. There is no auto merge.
//
//   node scripts/venues/resolve.mjs [--dry-run]

import { comparePair } from "./lib/resolve.mjs";
import { runStage } from "./lib/stage.mjs";

runStage("resolve", async (ctx) => {
  const { db } = ctx;
  if (!db) return "no database env: nothing to do (dry run)";
  const { data: venues, error } = await db.from("venues").select("id,name,lat,lng,website,geohash7").neq("status", "closed");
  if (error) throw new Error(error.message);
  ctx.count("venues", venues.length);
  const byCell = new Map();
  for (const v of venues) {
    const cell = v.geohash7 ? v.geohash7.slice(0, 5) : "none";
    byCell.set(cell, [...(byCell.get(cell) || []), v]);
  }
  const { data: existing } = await db.from("merge_review").select("venue_a,venue_b");
  const known = new Set((existing || []).flatMap((r) => [`${r.venue_a}|${r.venue_b}`, `${r.venue_b}|${r.venue_a}`]));
  for (const group of byCell.values()) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const [a, b] = [group[i], group[j]];
        if (known.has(`${a.id}|${b.id}`)) continue;
        const hit = comparePair(a, b);
        if (!hit) continue;
        await db.from("merge_review").insert({ venue_a: a.id, venue_b: b.id, similarity: hit.similarity, distance_m: hit.distance_m, reason: hit.reason });
        ctx.count("pairs_for_review");
      }
    }
  }
});
