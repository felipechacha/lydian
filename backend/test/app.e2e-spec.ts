import { Test, TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AuthApiError } from '@supabase/supabase-js';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { SupabaseAdminClient } from '../src/infra/supabase/supabase-admin.client';

describe('Lydian API (e2e)', () => {
  let app: INestApplication<App>;
  const auth = {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    refreshSession: jest.fn(),
    getUser: jest.fn(),
    admin: { signOut: jest.fn() },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SupabaseAdminClient)
      .useValue({
        getClient: () => ({ auth }),
        createAuthClient: () => ({ auth }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    configureApp(app);
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: '2d13361f-a68e-45a2-b076-3c11ba625e75',
          email: 'user@example.com',
          role: 'authenticated',
        },
      },
      error: null,
    });
  });

  it('GET /v1/health is public', () =>
    request(app.getHttpServer())
      .get('/v1/health')
      .expect(200)
      .expect({ status: 'ok' }));

  it('POST /v1/auth/signup validates and creates an account', async () => {
    auth.signUp.mockResolvedValue({
      data: {
        user: {
          id: '2d13361f-a68e-45a2-b076-3c11ba625e75',
          email: 'user@example.com',
          user_metadata: { full_name: 'User Example' },
        },
      },
      error: null,
    });
    await request(app.getHttpServer())
      .post('/v1/auth/signup')
      .send({
        email: 'user@example.com',
        password: 'secret123',
        fullName: 'User Example',
      })
      .expect(201)
      .expect(({ body }) => {
        const payload = body as {
          data: { email: string; fullName: string };
        };
        expect(payload.data).toEqual(
          expect.objectContaining({
            email: 'user@example.com',
            fullName: 'User Example',
          }),
        );
      });
  });

  it('POST /v1/auth/signup preserves Supabase rate limits as HTTP 429', async () => {
    auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: new AuthApiError(
        'email rate limit exceeded',
        429,
        'over_email_send_rate_limit',
      ),
    });

    await request(app.getHttpServer())
      .post('/v1/auth/signup')
      .send({
        email: 'user@example.com',
        password: 'secret123',
        fullName: 'User Example',
      })
      .expect(429)
      .expect(({ body }) => {
        const payload = body as {
          statusCode: number;
          message: string;
          error: string;
        };
        expect(payload).toEqual(
          expect.objectContaining({
            statusCode: 429,
            message: 'email rate limit exceeded',
            error: 'TooManyRequests',
          }),
        );
      });
  });

  it('POST /v1/auth/login writes HttpOnly cookies', async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: { session: { access_token: 'access', refresh_token: 'refresh' } },
      error: null,
    });
    const response = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'user@example.com', password: 'secret123' })
      .expect(200);
    const cookies = response.headers['set-cookie'] as unknown as string[];
    expect(cookies.join(';')).toContain('access_token=access');
    expect(cookies.join(';')).toContain('HttpOnly');
  });

  it('POST /v1/auth/login identifies an unconfirmed email as HTTP 403', async () => {
    auth.signInWithPassword.mockResolvedValue({
      data: { session: null, user: null },
      error: new AuthApiError(
        'Email not confirmed',
        400,
        'email_not_confirmed',
      ),
    });

    await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'user@example.com', password: 'secret123' })
      .expect(403)
      .expect(({ body }) => {
        const payload = body as {
          statusCode: number;
          message: string;
          error: string;
        };
        expect(payload).toEqual(
          expect.objectContaining({
            statusCode: 403,
            message: 'Email not confirmed',
            error: 'Forbidden',
          }),
        );
      });
  });

  it('GET /v1/auth/me rejects requests without a cookie', () =>
    request(app.getHttpServer()).get('/v1/auth/me').expect(401));

  it('GET /v1/auth/me returns the validated session user', () =>
    request(app.getHttpServer())
      .get('/v1/auth/me')
      .set('Cookie', 'access_token=access')
      .expect(200)
      .expect(({ body }) => {
        const payload = body as { data: { id: string } };
        expect(payload.data.id).toBe('2d13361f-a68e-45a2-b076-3c11ba625e75');
      }));

  it('POST /v1/auth/refresh rotates cookies', async () => {
    auth.refreshSession.mockResolvedValue({
      data: {
        session: { access_token: 'new-access', refresh_token: 'new-refresh' },
      },
      error: null,
    });
    const response = await request(app.getHttpServer())
      .post('/v1/auth/refresh')
      .set('Cookie', 'refresh_token=refresh')
      .expect(200);
    expect(
      (response.headers['set-cookie'] as unknown as string[]).join(';'),
    ).toContain('access_token=new-access');
  });

  it('POST /v1/auth/logout invalidates the Supabase session', async () => {
    auth.admin.signOut.mockResolvedValue({ error: null });
    await request(app.getHttpServer())
      .post('/v1/auth/logout')
      .set('Cookie', 'access_token=access')
      .expect(200);
    expect(auth.admin.signOut).toHaveBeenCalledWith('access', 'global');
  });

  afterAll(async () => app.close());
});
