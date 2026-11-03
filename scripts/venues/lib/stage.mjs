// Shared stage plumbing: Supabase client from env, pipeline_runs records, CLI flags.
// Secrets come from the environment only (GitHub Actions secrets or .env.local).

import { createClient } from "@supabase/supabase-js";
import { FAILURE_REASONS } from "./extract.mjs";

export function parseArgs(argv = process.argv.slice(2)) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const [k, v] = a.slice(2).split("=");
      if (v !== undefined) out[k] = v;
      else if (argv[i + 1] && !argv[i + 1].startsWith("--")) out[k] = argv[++i];
      else out[k] = true;
    } else out._.push(a);
  }
  return out;
}

export function getClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Normalize a failure tally so only fixed reasons are ever written. */
export function cleanFailures(tally) {
  const out = {};
  for (const [k, v] of Object.entries(tally || {})) if (FAILURE_REASONS.includes(k)) out[k] = v;
  return out;
}

/**
 * Run a stage and write one pipeline_runs row. fn receives {db, args, count(), fail(reason)}.
 * Without Supabase env vars the stage runs in dry mode and prints its record.
 */
export async function runStage(stage, fn, args = parseArgs()) {
  const db = args["dry-run"] ? null : getClient();
  const counts = {};
  const failures = {};
  const ctx = {
    db, args,
    count: (k, n = 1) => { counts[k] = (counts[k] || 0) + n; },
    fail: (reason) => { failures[reason] = (failures[reason] || 0) + 1; },
    release_id: undefined,
  };
  let runId = null;
  if (db) {
    const { data } = await db.from("pipeline_runs").insert({ stage }).select("id").single();
    runId = data?.id ?? null;
  }
  let ok = true, notes = null;
  try {
    notes = (await fn(ctx)) || null;
  } catch (err) {
    ok = false;
    notes = String(err?.message || err).slice(0, 500);
    console.error(`[${stage}] failed:`, notes);
  }
  const record = { ok, counts, failure_reasons: cleanFailures(failures), notes, finished_at: new Date().toISOString(), release_id: ctx.release_id ?? null };
  if (db && runId) await db.from("pipeline_runs").update(record).eq("id", runId);
  console.log(JSON.stringify({ stage, dry_run: !db, ...record }, null, 2));
  if (!ok) process.exitCode = 1;
  return record;
}
