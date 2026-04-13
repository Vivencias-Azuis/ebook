import { describe, expect, it } from "vitest";

import { resolveDatabaseUrl } from "@/lib/database-url";

describe("resolveDatabaseUrl", () => {
  it("uses the configured Turso/libSQL URL when provided", () => {
    expect(
      resolveDatabaseUrl({
        nodeEnv: "production",
        databaseUrl: "libsql://vivencias-azuis.turso.io",
      }),
    ).toBe("libsql://vivencias-azuis.turso.io");
  });

  it("falls back to the local dev database outside production", () => {
    expect(
      resolveDatabaseUrl({
        nodeEnv: "development",
      }),
    ).toBe("file:dev.db");
  });

  it("fails in production when DATABASE_URL is missing", () => {
    expect(() =>
      resolveDatabaseUrl({
        nodeEnv: "production",
      }),
    ).toThrow("DATABASE_URL is required in production");
  });

  it("fails in production when DATABASE_URL points to a local sqlite file", () => {
    expect(() =>
      resolveDatabaseUrl({
        nodeEnv: "production",
        databaseUrl: "file:dev.db",
      }),
    ).toThrow("DATABASE_URL must point to Turso/libSQL in production");
  });
});
