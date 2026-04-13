import { describe, expect, it } from "vitest";

import { validateProductionEnvironment } from "@/lib/production-env";

describe("validateProductionEnvironment", () => {
  it("accepts a complete Turso production configuration", () => {
    expect(() =>
      validateProductionEnvironment({
        nodeEnv: "production",
        env: {
          DATABASE_URL: "libsql://vivencias-azuis.turso.io",
          DATABASE_AUTH_TOKEN: "token",
          BETTER_AUTH_SECRET: "super-secret",
          BETTER_AUTH_URL: "https://app.vivenciasazuis.com",
          NEXT_PUBLIC_APP_URL: "https://app.vivenciasazuis.com",
          STRIPE_SECRET_KEY: "sk_live_x",
          STRIPE_WEBHOOK_SECRET: "whsec_x",
        },
      }),
    ).not.toThrow();
  });

  it("fails when DATABASE_AUTH_TOKEN is missing for a remote production database", () => {
    expect(() =>
      validateProductionEnvironment({
        nodeEnv: "production",
        env: {
          DATABASE_URL: "libsql://vivencias-azuis.turso.io",
          BETTER_AUTH_SECRET: "super-secret",
          BETTER_AUTH_URL: "https://app.vivenciasazuis.com",
          NEXT_PUBLIC_APP_URL: "https://app.vivenciasazuis.com",
          STRIPE_SECRET_KEY: "sk_live_x",
          STRIPE_WEBHOOK_SECRET: "whsec_x",
        },
      }),
    ).toThrow("DATABASE_AUTH_TOKEN is required in production");
  });

  it("fails when public app url is missing in production", () => {
    expect(() =>
      validateProductionEnvironment({
        nodeEnv: "production",
        env: {
          DATABASE_URL: "libsql://vivencias-azuis.turso.io",
          DATABASE_AUTH_TOKEN: "token",
          BETTER_AUTH_SECRET: "super-secret",
          BETTER_AUTH_URL: "https://app.vivenciasazuis.com",
          STRIPE_SECRET_KEY: "sk_live_x",
          STRIPE_WEBHOOK_SECRET: "whsec_x",
        },
      }),
    ).toThrow("NEXT_PUBLIC_APP_URL is required in production");
  });

  it("fails when public app url still points to localhost in production", () => {
    expect(() =>
      validateProductionEnvironment({
        nodeEnv: "production",
        env: {
          DATABASE_URL: "libsql://vivencias-azuis.turso.io",
          DATABASE_AUTH_TOKEN: "token",
          BETTER_AUTH_SECRET: "super-secret",
          BETTER_AUTH_URL: "http://localhost:3000",
          NEXT_PUBLIC_APP_URL: "http://localhost:3000",
          STRIPE_SECRET_KEY: "sk_live_x",
          STRIPE_WEBHOOK_SECRET: "whsec_x",
        },
      }),
    ).toThrow("NEXT_PUBLIC_APP_URL must not point to localhost in production");
  });
});
