import type { D1Database, KVNamespace } from "@cloudflare/workers-types";

export interface CloudflareEnv extends Record<string, unknown> {
  DB: D1Database;
  KV: KVNamespace;
}
