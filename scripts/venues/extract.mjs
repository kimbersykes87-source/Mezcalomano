// Stage 5: extract claims. Reads cached menu text for new snapshots and writes proposed
// claims (never approved), unknown_terms, and the capped matched lines.
//
//   node scripts/venues/extract.mjs [--dry-run]

import fs from "node:fs";
import path from "node:path";
import { analyzeMenu } from "./lib/extract.mjs";
import { buildAliasTable } from "./lib/aliases.mjs";
import { CACHE_DIR } from "./lib/menu_fetch.mjs";
import { runStage } from "./lib/stage.mjs";

runStage("extract", async (ctx) => {
  const { db } = ctx;
  if (!db) return "no database env: nothing to do (dry run)";
  const table = buildAliasTable(fs.readFileSync(path.resolve("data/Species_Final - Website.csv"), "utf8"));
  const { data: snaps } = await db.from("venue_menu_snapshots").select("id,venue_id,format,content_hash,status").eq("status", "ok");
  const { data: done } = await db.from("venue_claims").select("snapshot_id");
  const doneIds = new Set((done || []).map((d) => d.snapshot_id));
  for (const s of snaps || []) {
    if (doneIds.has(s.id)) continue;
    const file = path.join(CACHE_DIR, `${s.content_hash}.txt`);
    if (!fs.existsSync(file)) { ctx.count("cache_miss"); continue; }
    const r = analyzeMenu({ text: fs.readFileSync(file, "utf8"), format: s.format }, table);
    if (r.failureReason) ctx.fail(r.failureReason);
    for (const c of r.claims) {
      await db.from("venue_claims").insert({
        venue_id: s.venue_id, snapshot_id: s.id, kind: "species_listed", species_slug: c.species_slug, species_group: c.species_group,
        line_text: c.line_text, heading: c.heading, confidence: c.confidence, state: "proposed",
      });
      ctx.count("claims_proposed");
    }
    for (const u of r.unknownTerms) {
      await db.from("unknown_terms").insert({ term: u.term, term_normalized: u.term, venue_id: s.venue_id, context_line: u.line, seen_count: u.seen });
      ctx.count("unknown_terms");
    }
  }
});
