// Stage 4: fetch menus. At most 6 pages per site, 1 request per second per host, robots.txt
// and noindex obeyed, conditional requests, content hash. pdftotext for PDFs, tesseract for
// images (low confidence, proposals only), Playwright only for client rendered pages
// (--render). Blocks are recorded as "blocked" and never worked around.
//
//   node scripts/venues/fetch_menu.mjs [--venue <uuid>] [--limit 25] [--render] [--ocr] [--dry-run]
//
// Extracted text is cached under .cache/venues/<hash>.txt (git ignored) so the extract
// stage can read it. Only capped matched lines ever reach the database.

import fs from "node:fs";
import path from "node:path";
import { pickMenuLinks } from "./lib/http.mjs";
import { CACHE_DIR, MAX_PAGES_PER_SITE, fetchPage } from "./lib/menu_fetch.mjs";
import { contentHash } from "./lib/text.mjs";
import { runStage } from "./lib/stage.mjs";
import { analyzeMenu } from "./lib/extract.mjs";
import { buildAliasTable } from "./lib/aliases.mjs";

runStage("fetch_menu", async (ctx) => {
  const { db, args } = ctx;
  if (!db) return "no database env: use scripts/venues/fetch_one.mjs for a single site (dry run)";
  const limit = Number(args.limit || 25);
  let q = db.from("venues").select("id,website").not("website", "is", null).in("status", ["candidate", "in_review"]).limit(limit);
  if (args.venue) q = db.from("venues").select("id,website").eq("id", args.venue);
  const { data: venues } = await q;
  const table = buildAliasTable(fs.readFileSync(path.resolve("data/Species_Final - Website.csv"), "utf8"));
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  for (const v of venues || []) {
    ctx.count("venues_attempted");
    const queue = [v.website];
    const done = new Set();
    let anyOk = false;
    while (queue.length > 0 && done.size < MAX_PAGES_PER_SITE) {
      const url = queue.shift();
      if (done.has(url)) continue;
      done.add(url);
      const page = await fetchPage(url, { render: Boolean(args.render), ocr: Boolean(args.ocr) });
      if (!page.ok) {
        if (page.reason && !["robots", "noindex"].includes(page.reason)) {
          ctx.fail(page.reason);
          await db.from("venue_menu_snapshots").insert({ venue_id: v.id, url, format: "html", status: page.reason === "blocked" ? "blocked" : "parse_error" });
        } else ctx.count(`skipped_${page.reason}`);
        continue;
      }
      if (page.notModified) { ctx.count("not_modified"); continue; }
      if (done.size === 1 && page.html) for (const l of pickMenuLinks(page.html, url, MAX_PAGES_PER_SITE - 1)) queue.push(l);
      const analysis = analyzeMenu({ text: page.text, html: page.html, format: page.format, imageOnly: page.imageOnly }, table);
      const hash = contentHash(page.text || url);
      fs.writeFileSync(path.join(CACHE_DIR, `${hash}.txt`), page.text || "");
      if (analysis.failureReason && analysis.status !== "ok") ctx.fail(analysis.failureReason);
      anyOk = anyOk || analysis.status === "ok";
      await db.from("venue_menu_snapshots").insert({
        venue_id: v.id, url, format: page.format, content_hash: hash, status: analysis.status,
        mezcal_lines: analysis.mezcalLines, low_confidence: analysis.lowConfidence,
      });
      ctx.count("snapshots");
    }
    if (!anyOk) ctx.fail("no_menu_found");
    await db.from("venues").update({ last_checked_at: new Date().toISOString() }).eq("id", v.id);
  }
});
