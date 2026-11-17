import { validateEnvironment } from './env.validation';

describe('validateEnvironment', () => {
  const validEnvironment = {
    NODE_ENV: 'development',
    PORT: '3000',
    SUPABASE_URL: 'https://project.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
    CORS_ORIGIN: 'http://localhost:4200',
  };

  it('accepts the backend configuration without an anon key or JWT secret', () => {
    expect(() => validateEnvironment(validEnvironment)).not.toThrow();
  });

  it('requires the URL and service-role key outside tests', () => {
    expect(() =>
      validateEnvironment({ NODE_ENV: 'development', PORT: '3000' }),
    ).toThrow(
      'Missing required environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CORS_ORIGIN',
    );
  });

  it('requires an explicit environment outside tests', () => {
    expect(() =>
      validateEnvironment({
        PORT: '3000',
        SUPABASE_URL: 'https://project.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
        CORS_ORIGIN: 'http://localhost:4200',
      }),
    ).toThrow('Missing required environment variables: NODE_ENV');
  });

  it.each(['development', 'staging', 'production', 'test'])(
    'accepts the %s environment',
    (nodeEnvironment) => {
      expect(() =>
        validateEnvironment({
          ...validEnvironment,
          NODE_ENV: nodeEnvironment,
        }),
      ).not.toThrow();
    },
  );

  it('rejects unknown environments', () => {
    expect(() =>
      validateEnvironment({ ...validEnvironment, NODE_ENV: 'prod' }),
    ).toThrow(
      'NODE_ENV must be one of: development, staging, production, test',
    );
  });

  it('rejects invalid Supabase URLs', () => {
    expect(() =>
      validateEnvironment({ ...validEnvironment, SUPABASE_URL: 'invalid' }),
    ).toThrow('SUPABASE_URL must be a valid URL');
  });

  it('accepts multiple valid CORS origins', () => {
    expect(() =>
      validateEnvironment({
        ...validEnvironment,
        CORS_ORIGIN: 'http://localhost:4200,https://stg.lydianmusic.com',
      }),
    ).not.toThrow();
  });
});

describe('password recovery redirect configuration', () => {
  const config = {
    NODE_ENV: 'test',
    CORS_ORIGIN: 'https://localhost:4200,https://lydian.example',
  };
  it('accepts a fixed HTTPS URL on an allowed origin', () => {
    expect(() =>
      validateEnvironment({
        ...config,
        PASSWORD_RESET_REDIRECT_URL:
          'https://localhost:4200/reset-password/confirm',
      }),
    ).not.toThrow();
  });
  it.each([
    'http://localhost:4200/reset',
    'https://other.example/reset',
    'https://lydian.example/reset?next=evil',
    'https://lydian.example/reset#token',
    'https://user:password@lydian.example/reset',
    'invalid',
  ])('rejects unsafe redirect %s', (url) => {
    expect(() =>
      validateEnvironment({ ...config, PASSWORD_RESET_REDIRECT_URL: url }),
    ).toThrow('PASSWORD_RESET_REDIRECT_URL');
  });
});

describe('password recovery mode', () => {
  it.each(['default', 'token_hash'])('accepts %s', (mode) => {
    expect(() =>
      validateEnvironment({ NODE_ENV: 'test', PASSWORD_RECOVERY_MODE: mode }),
    ).not.toThrow();
  });
  it('rejects unknown modes', () => {
    expect(() =>
      validateEnvironment({
        NODE_ENV: 'test',
        PASSWORD_RECOVERY_MODE: 'unsafe',
      }),
    ).toThrow('PASSWORD_RECOVERY_MODE');
  });
});
