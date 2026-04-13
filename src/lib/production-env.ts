type ProductionEnvironmentInput = {
  nodeEnv?: string;
  env: Partial<Record<string, string | undefined>>;
};

function requireValue(
  value: string | undefined,
  message: string,
  invalidValues: string[] = [],
) {
  const normalizedValue = value?.trim();

  if (!normalizedValue || invalidValues.includes(normalizedValue)) {
    throw new Error(message);
  }

  return normalizedValue;
}

function requirePublicUrl(value: string | undefined, variableName: string) {
  const normalizedValue = requireValue(
    value,
    `${variableName} is required in production. Set the public HTTPS URL before starting the app.`,
  );

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(normalizedValue);
  } catch {
    throw new Error(
      `${variableName} must be a valid absolute URL in production.`,
    );
  }

  if (parsedUrl.hostname === "localhost" || parsedUrl.hostname === "127.0.0.1") {
    throw new Error(
      `${variableName} must not point to localhost in production.`,
    );
  }

  return normalizedValue;
}

export function validateProductionEnvironment({
  nodeEnv,
  env,
}: ProductionEnvironmentInput) {
  if (nodeEnv !== "production") {
    return;
  }

  const databaseUrl = requireValue(
    env.DATABASE_URL,
    "DATABASE_URL is required in production. Configure the Turso/libSQL connection string before starting the app.",
  );

  if (databaseUrl.startsWith("file:")) {
    throw new Error(
      "DATABASE_URL must point to Turso/libSQL in production. Local file databases are not allowed.",
    );
  }

  requireValue(
    env.DATABASE_AUTH_TOKEN,
    "DATABASE_AUTH_TOKEN is required in production for the Turso/libSQL database.",
  );

  const appUrl = requirePublicUrl(env.NEXT_PUBLIC_APP_URL, "NEXT_PUBLIC_APP_URL");
  const authUrl = requirePublicUrl(env.BETTER_AUTH_URL, "BETTER_AUTH_URL");

  if (appUrl !== authUrl) {
    throw new Error(
      "BETTER_AUTH_URL must match NEXT_PUBLIC_APP_URL in production.",
    );
  }

  requireValue(
    env.BETTER_AUTH_SECRET ?? env.AUTH_SECRET,
    "BETTER_AUTH_SECRET is required in production.",
    ["ebook-development-secret-not-for-production", "replace-with-strong-secret"],
  );

  requireValue(
    env.STRIPE_SECRET_KEY,
    "STRIPE_SECRET_KEY is required in production.",
    ["sk_test_replace", "sk_test_placeholder"],
  );

  requireValue(
    env.STRIPE_WEBHOOK_SECRET,
    "STRIPE_WEBHOOK_SECRET is required in production.",
    ["whsec_replace"],
  );
}

export function ensureProductionEnvironment() {
  validateProductionEnvironment({
    nodeEnv: process.env.NODE_ENV,
    env: process.env,
  });
}
