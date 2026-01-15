import type { D1Database, KVNamespace } from "@cloudflare/workers-types";

export interface CloudflareEnv {
  DB: D1Database;
  KV: KVNamespace;
}
