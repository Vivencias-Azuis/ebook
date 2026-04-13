import { defineConfig } from "drizzle-kit";
import { resolveDatabaseUrl } from "./src/lib/database-url";

const databaseUrl = resolveDatabaseUrl({
  nodeEnv: process.env.NODE_ENV,
  databaseUrl: process.env.DATABASE_URL,
});

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: databaseUrl,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
});
