import { drizzle } from "drizzle-orm/d1";
import { getRequestContext } from "@cloudflare/next-on-pages";

import { CloudflareEnv } from "@/lib/cloudflare-env";
import * as schema from "./schema";

export const getDb = () => {
  const { env } = getRequestContext<CloudflareEnv>();
  return drizzle(env.DB, { schema });
};

export { schema };
