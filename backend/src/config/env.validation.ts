type Environment = Record<string, string | undefined>;

const REQUIRED_VARIABLES = [
  'NODE_ENV',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'CORS_ORIGIN',
] as const;

const ALLOWED_NODE_ENVIRONMENTS = [
  'development',
  'staging',
  'production',
  'test',
] as const;

export function validateEnvironment(config: Environment): Environment {
  const missing = REQUIRED_VARIABLES.filter((key) => !config[key]?.trim());

  if (missing.length > 0 && config.NODE_ENV !== 'test') {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`,
    );
  }

  if (
    config.NODE_ENV &&
    !ALLOWED_NODE_ENVIRONMENTS.includes(
      config.NODE_ENV as (typeof ALLOWED_NODE_ENVIRONMENTS)[number],
    )
  ) {
    throw new Error(
      `NODE_ENV must be one of: ${ALLOWED_NODE_ENVIRONMENTS.join(', ')}`,
    );
  }

  const port = Number(config.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  const supabaseUrl = config.SUPABASE_URL;
  if (supabaseUrl) {
    try {
      new URL(supabaseUrl);
    } catch {
      throw new Error('SUPABASE_URL must be a valid URL');
    }
  }

  const corsOrigins = config.CORS_ORIGIN?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  for (const origin of corsOrigins ?? []) {
    try {
      new URL(origin);
    } catch {
      throw new Error(`CORS_ORIGIN contains an invalid URL: ${origin}`);
    }
  }

  if (
    config.PASSWORD_RECOVERY_MODE &&
    !['default', 'token_hash'].includes(config.PASSWORD_RECOVERY_MODE)
  ) {
    throw new Error('PASSWORD_RECOVERY_MODE must be default or token_hash');
  }
  const recoveryUrl = config.PASSWORD_RESET_REDIRECT_URL;
  if (recoveryUrl) {
    let url: URL;
    try {
      url = new URL(recoveryUrl);
    } catch {
      throw new Error('PASSWORD_RESET_REDIRECT_URL must be a valid URL');
    }
    if (
      url.protocol !== 'https:' ||
      url.username ||
      url.password ||
      url.hash ||
      url.search ||
      !(corsOrigins ?? []).includes(url.origin)
    ) {
      throw new Error(
        'PASSWORD_RESET_REDIRECT_URL must use HTTPS, match a CORS_ORIGIN, and have no credentials, query or fragment',
      );
    }
  }
  return config;
}
