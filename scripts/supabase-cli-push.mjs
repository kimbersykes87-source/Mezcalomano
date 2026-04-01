/**
 * Run Supabase CLI: link + db push (applies supabase/migrations in order).
 *
 * Requires (in `.env` and/or `.env.local` — local overrides):
 *   - SUPABASE_ACCESS_TOKEN — personal token from https://supabase.com/dashboard/account/tokens (sbp_...)
 *   - NEXT_PUBLIC_SUPABASE_URL — used to derive project ref, or set SUPABASE_PROJECT_REF
 *   - SUPABASE_DB_PASSWORD — optional; avoids link password prompt
 *
 * Install CLI: https://supabase.com/docs/guides/cli
 * Run: npm run supabase:push
 */
import { spawnSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync, existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

function loadEnvFile(relPath) {
  const p = join(projectRoot, relPath);
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf-8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const token = process.env.SUPABASE_ACCESS_TOKEN;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const dbPassword = process.env.SUPABASE_DB_PASSWORD;

if (!token || !token.startsWith("sbp_")) {
  console.error(
    "SUPABASE_ACCESS_TOKEN must be set (in .env or .env.local) and must start with sbp_.\n" +
      "Create one at: https://supabase.com/dashboard/account/tokens"
  );
  process.exit(1);
}

let projectRef = process.env.SUPABASE_PROJECT_REF;
if (!projectRef && url) {
  try {
    projectRef = new URL(url).hostname.split(".")[0];
  } catch (_) {
    /* ignore */
  }
}
if (!projectRef) {
  console.error("Set SUPABASE_PROJECT_REF or NEXT_PUBLIC_SUPABASE_URL.");
  process.exit(1);
}

const env = { ...process.env, SUPABASE_ACCESS_TOKEN: token };
if (dbPassword) env.SUPABASE_DB_PASSWORD = dbPassword;

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    stdio: "inherit",
    cwd: projectRoot,
    env: { ...env, ...opts.env },
    ...opts,
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

console.log("Linking project...");
run("supabase", ["link", "--project-ref", projectRef, "--yes"]);

console.log("Pushing migrations...");
run("supabase", ["db", "push", "--yes"]);

console.log("Done.");
