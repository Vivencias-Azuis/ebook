import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import { resolveDatabaseUrl } from "@/lib/database-url";
import { ensureProductionEnvironment } from "@/lib/production-env";
import * as schema from "./schema";

ensureProductionEnvironment();

const url = resolveDatabaseUrl({
  nodeEnv: process.env.NODE_ENV,
  databaseUrl: process.env.DATABASE_URL,
});

export const client = createClient({
  url,
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
