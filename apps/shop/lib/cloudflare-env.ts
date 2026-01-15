import type { D1Database, KVNamespace } from "@cloudflare/workers-types";

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    KV: KVNamespace;
  }
}

export {};
