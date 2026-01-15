import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import "@/lib/cloudflare-env";
import * as schema from "./schema";

export const getDb = () => {
  const { env } = getCloudflareContext();
  return drizzle(env.DB, { schema });
};

export { schema };
