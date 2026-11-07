#!/usr/bin/env node
// Monthly AI answer check. Usage:
//   node scripts/ai-check/run.mjs [--dry-run] [--only openai,gemini] [--out ai-check-results] [--runs 1] [--no-email]
// --dry-run uses built in mock answers, no keys, no network. Exit code 1 if any source failed badly.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ADAPTERS } from "./adapters.mjs";
import { score } from "./score.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const readJson = (f) => JSON.parse(fs.readFileSync(path.join(here, f), "utf8"));
const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };

const cfg = readJson("config.json");
const facts = readJson("facts.json");
const { questions } = readJson("questions.json");
const dry = flag("dry-run");
const sources = (opt("only", "openai,anthropic,gemini,google")).split(",").filter(Boolean);
const forcedRuns = opt("runs") ? Number(opt("runs")) : null;
const stamp = new Date().toISOString().slice(0, 10);
const outDir = path.resolve(opt("out", "ai-check-results"), stamp);
fs.mkdirSync(outDir, { recursive: true });

const mock = async (q, _c, src) => ({
  text: src === "google" ? "" : `Mock answer for ${src}. Mezcalómano Discovery Deck, 40 agave species, $29.99, ships Nov 30, US addresses only. Also TUYO. ${q}`,
  links: src === "anthropic" ? [] : [{ url: "https://mezcalomano.com/directory", title: "Directory" }],
  model: `mock-${src}`,
  raw: { mock: true },
});
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const rows = [];
const raws = [];
for (const src of sources) {
  const runs = forcedRuns ?? cfg.runsPerQuestion[src] ?? 1;
  for (const q of questions) {
    for (let run = 1; run <= runs; run++) {
      const at = new Date().toISOString();
      let r, error = "";
      try { r = await (dry ? mock : ADAPTERS[src])(q.text, cfg, src); }
      catch (e) { error = String(e.message ?? e).slice(0, 500); r = { text: "", links: [], model: "", raw: null }; }
      const s = score(r, facts);
      rows.push({ at, source: src, model: r.model, qid: q.id, run, error, ...s, links: r.links.map((l) => l.url).join(" "), text: r.text });
      raws.push({ at, source: src, qid: q.id, run, model: r.model, error, text: r.text, links: r.links, raw: r.raw });
      if (!dry) await sleep(cfg.delayMs);
    }
  }
}

// Store: raw answers (JSON) plus one CSV row per answer.
fs.writeFileSync(path.join(outDir, "raw.json"), JSON.stringify(raws, null, 2));
const cols = ["at", "source", "model", "qid", "run", "error", "empty", "mentioned", "domainLinked", "domainInText", "factsHit", "wrong", "competitors", "links"];
const cell = (v) => `"${(Array.isArray(v) ? v.join("|") : String(v ?? "")).replace(/"/g, '""').replace(/\n/g, " ")}"`;
fs.writeFileSync(path.join(outDir, "results.csv"), [cols.join(","), ...rows.map((r) => cols.map((c) => cell(r[c])).join(","))].join("\n") + "\n");

// Report. Shares are of successful runs only; errors are counted separately.
const pct = (n, d) => (d ? `${n}/${d}` : "n/a");
const lines = [];
const placeholder = questions.some((q) => /^PLACEHOLDER/.test(q.text));
lines.push(`# AI answer check ${stamp}${dry ? " (DRY RUN, mock answers)" : ""}`, "");
if (placeholder) lines.push("**Placeholder questions in use. These numbers are not a baseline.**", "");
lines.push("Counts are answers out of runs. Each question is asked several times per source because answers vary. Keyword scoring is crude: read the flagged items before acting (REVIEW_RULES.md).", "");
const failed = [];
lines.push("## By source", "", "| Source | Models seen | Mentioned us | Our domain linked | Wrong fact flags | Errors |", "| --- | --- | --- | --- | --- | --- |");
for (const src of sources) {
  const all = rows.filter((r) => r.source === src);
  const ok = all.filter((r) => !r.error);
  const errs = all.length - ok.length;
  if (all.length && errs / all.length > cfg.failRateAlert) failed.push(`${src}: ${errs} of ${all.length} calls failed (${all.find((r) => r.error)?.error.slice(0, 160)})`);
  const models = [...new Set(ok.map((r) => r.model).filter(Boolean))].join(", ") || "none";
  lines.push(`| ${src} | ${models} | ${pct(ok.filter((r) => r.mentioned).length, ok.length)} | ${pct(ok.filter((r) => r.domainLinked).length, ok.length)} | ${ok.filter((r) => r.wrong.length).length} | ${errs} |`);
}
lines.push("", "## By question", "", "| Question | " + sources.map((s) => `${s} mentioned`).join(" | ") + " |", "| --- | " + sources.map(() => "---").join(" | ") + " |");
for (const q of questions) {
  lines.push(`| ${q.id} ${q.text.slice(0, 70)} | ` + sources.map((s) => { const ok = rows.filter((r) => r.source === s && r.qid === q.id && !r.error); return pct(ok.filter((r) => r.mentioned).length, ok.length); }).join(" | ") + " |");
}
const wrongRows = rows.filter((r) => r.wrong.length);
lines.push("", "## For Siona: possible wrong facts", "");
lines.push(wrongRows.length ? wrongRows.map((r) => `- ${r.source} ${r.qid} run ${r.run}: ${r.wrong.join(", ")}`).join("\n") : "None flagged.");
const comp = {};
for (const r of rows) for (const c of r.competitors) comp[c] = (comp[c] ?? 0) + 1;
lines.push("", "## Competitors named (answers)", "", Object.entries(comp).sort((a, b) => b[1] - a[1]).map(([c, n]) => `- ${c}: ${n}`).join("\n") || "None.");
if (failed.length) lines.push("", "## FAILURES", "", ...failed.map((f) => `- ${f}`));
const report = lines.join("\n") + "\n";
fs.writeFileSync(path.join(outDir, "report.md"), report);
console.log(report);

// Optional five line email to hola@ through the existing Apps Script mailer, if its secrets are present.
if (!dry && !flag("no-email") && process.env.WEEKLY_EMAIL_URL && process.env.WEEKLY_EMAIL_TOKEN) {
  const five = [`AI answer check ${stamp}.`, ...sources.map((s) => { const ok = rows.filter((r) => r.source === s && !r.error); return `${s}: mentioned us in ${pct(ok.filter((r) => r.mentioned).length, ok.length)} answers, linked our domain in ${pct(ok.filter((r) => r.domainLinked).length, ok.length)}.`; })];
  if (wrongRows.length) five.push(`${wrongRows.length} answers flagged for possible wrong facts: Siona to review.`);
  try {
    await fetch(process.env.WEEKLY_EMAIL_URL, { method: "POST", headers: { "Content-Type": "application/json" }, redirect: "follow",
      body: JSON.stringify({ token: process.env.WEEKLY_EMAIL_TOKEN, to: "hola@mezcalomano.com", subject: `AI answer check ${stamp}${failed.length ? " (FAILED)" : ""}`, text: five.join("\n"), html: `<pre>${five.join("\n")}</pre>` }) });
  } catch (e) { console.error("email not sent:", String(e.message).slice(0, 120)); }
}
if (failed.length) { console.error("FAILED:\n" + failed.join("\n")); process.exit(1); }
