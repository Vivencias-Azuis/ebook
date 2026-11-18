const DEFAULT_LOCAL_DATABASE_URL = "file:dev.db";

const BUILD_PLACEHOLDER_DATABASE_URL = "http://127.0.0.1:9";

type ResolveDatabaseUrlInput = {
  nodeEnv?: string;
  databaseUrl?: string;
  nextPhase?: string;
};

export function resolveDatabaseUrl({
  nodeEnv,
  databaseUrl,
  nextPhase,
}: ResolveDatabaseUrlInput) {
  const normalizedUrl = databaseUrl?.trim();

  if (normalizedUrl) {
    if (nodeEnv === "production" && normalizedUrl.startsWith("file:")) {
      throw new Error(
        "DATABASE_URL must point to Turso/libSQL in production. Local file databases are not allowed.",
      );
    }

    return normalizedUrl;
  }

  if (nodeEnv === "production") {
    if (nextPhase === "phase-production-build") {
      return BUILD_PLACEHOLDER_DATABASE_URL;
    }

    throw new Error(
      "DATABASE_URL is required in production. Configure the Turso/libSQL connection string before starting the app.",
    );
  }

  return DEFAULT_LOCAL_DATABASE_URL;
}

export { DEFAULT_LOCAL_DATABASE_URL };
