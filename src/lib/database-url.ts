const DEFAULT_LOCAL_DATABASE_URL = "file:dev.db";

type ResolveDatabaseUrlInput = {
  nodeEnv?: string;
  databaseUrl?: string;
};

export function resolveDatabaseUrl({
  nodeEnv,
  databaseUrl,
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
    throw new Error(
      "DATABASE_URL is required in production. Configure the Turso/libSQL connection string before starting the app.",
    );
  }

  return DEFAULT_LOCAL_DATABASE_URL;
}

export { DEFAULT_LOCAL_DATABASE_URL };
