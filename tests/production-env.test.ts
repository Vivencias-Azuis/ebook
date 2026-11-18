import { describe, expect, it } from "vitest";

import {
  ensureProductionEnvironment,
  isNextProductionBuild,
  validateProductionEnvironment,
} from "@/lib/production-env";

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

describe("isNextProductionBuild", () => {
  it("recognizes the Next.js production build phase", () => {
    expect(isNextProductionBuild("phase-production-build")).toBe(true);
    expect(isNextProductionBuild("phase-production-server")).toBe(false);
    expect(isNextProductionBuild("")).toBe(false);
  });
});

describe("ensureProductionEnvironment", () => {
  it("skips production checks while Next.js is collecting page data", () => {
    const previousPhase = process.env.NEXT_PHASE;

    process.env.NEXT_PHASE = "phase-production-build";

    try {
      expect(() => ensureProductionEnvironment()).not.toThrow();
    } finally {
      if (previousPhase === undefined) {
        delete process.env.NEXT_PHASE;
      } else {
        process.env.NEXT_PHASE = previousPhase;
      }
    }
  });
});
