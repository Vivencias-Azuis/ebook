import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { nextCookies } from "better-auth/next-js";

import { db } from "@/db/client";
import * as schema from "@/db/schema";

const authSecret = process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET;

if (!authSecret && process.env.NODE_ENV === "production") {
  throw new Error(
    "BETTER_AUTH_SECRET environment variable is required in production. Set it before starting the server.",
  );
}

export const auth = betterAuth({
  baseURL:
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000",
  secret: authSecret ?? "ebook-development-secret-not-for-production",
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      ...schema,
      user: schema.users,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
});
