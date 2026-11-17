import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthApiError } from '@supabase/supabase-js';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { SupabaseAdminClient } from '../src/infra/supabase/supabase-admin.client';

const userId = '00000000-0000-4000-8000-000000000001';
const setlistId = '00000000-0000-4000-8000-000000000041';
const songId = '00000000-0000-4000-8000-000000000011';
describe('Insights and recovery HTTP contracts', () => {
  let app: INestApplication<App>;
  const rpc = jest.fn();
  const auth = {
    getUser: jest.fn(),
    refreshSession: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    verifyOtp: jest.fn(),
    updateUser: jest.fn(),
    signOut: jest.fn(),
  };
  const proofQuery = {
    eq: jest.fn(),
    is: jest.fn(),
    gt: jest.fn(),
    select: jest.fn(),
    maybeSingle: jest.fn(),
  };
  const proofInsert = jest.fn();
  const proofCleanup = jest.fn();
  const from = jest.fn(() => ({
    insert: proofInsert,
    delete: () => ({ lt: proofCleanup }),
    update: () => proofQuery,
  }));
  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(SupabaseAdminClient)
      .useValue({
        getClient: () => ({ auth, rpc, from }),
        createAuthClient: () => ({ auth }),
      })
      .overrideProvider(ConfigService)
      .useValue({
        get: (key: string, fallback?: unknown) => {
          if (key === 'PASSWORD_RESET_REDIRECT_URL')
            return 'https://localhost:4200/reset-password/confirm';
          if (key === 'CORS_ORIGIN') return 'https://localhost:4200';
          if (key === 'NODE_ENV') return 'test';
          if (key === 'PASSWORD_RECOVERY_MODE') return 'default';
          return fallback;
        },
      })
      .compile();
    app = module.createNestApplication();
    configureApp(app);
    await app.init();
  });
  beforeEach(() => {
    jest.clearAllMocks();
    for (const key of ['eq', 'is', 'gt', 'select'] as const)
      proofQuery[key].mockReturnValue(proofQuery);
    proofQuery.maybeSingle.mockResolvedValue({
      data: { token_hash: 'synthetic' },
      error: null,
    });
    proofCleanup.mockResolvedValue({ error: null });
    proofInsert.mockResolvedValue({ error: null });
    auth.refreshSession.mockResolvedValue({
      data: {
        session: { access_token: 'synthetic' },
        user: { id: userId, email: 'user@example.test' },
      },
      error: null,
    });
    auth.getUser.mockResolvedValue({
      data: {
        user: { id: userId, role: 'authenticated', email: 'user@example.test' },
      },
      error: null,
    });
    auth.resetPasswordForEmail.mockResolvedValue({ error: null });
    auth.verifyOtp.mockResolvedValue({
      data: {
        user: { id: userId },
        session: { access_token: 'synthetic-test-only' },
      },
      error: null,
    });
    auth.updateUser.mockResolvedValue({ error: null });
    auth.signOut.mockResolvedValue({ error: null });
  });
  afterAll(async () => {
    await app.close();
  });

  it('requires authentication for aggregates', async () => {
    await request(app.getHttpServer())
      .get('/v1/me/practice-summary')
      .expect(401);
    expect(rpc).not.toHaveBeenCalled();
  });
  it('uses the guarded user identity and envelopes aggregates', async () => {
    rpc.mockResolvedValue({
      data: { timezone: 'UTC', totals: { session_count: 1500 } },
      error: null,
    });
    await request(app.getHttpServer())
      .get('/v1/me/practice-summary')
      .set('Cookie', 'access_token=synthetic')
      .expect(200)
      .expect({ data: { timezone: 'UTC', totals: { session_count: 1500 } } });
    expect(rpc).toHaveBeenCalledWith('get_practice_summary', {
      p_user_id: userId,
    });
  });
  it('preserves paginated setlist envelope and metadata', async () => {
    const result = {
      data: [{ id: setlistId, song_count: 1, duration_seconds: 120 }],
      meta: { page: 2, limit: 6, total: 10 },
    };
    rpc.mockResolvedValue({ data: result, error: null });
    await request(app.getHttpServer())
      .get('/v1/setlists?page=2&limit=6&sort_by=name&sort_order=asc')
      .set('Cookie', 'access_token=synthetic')
      .expect(200)
      .expect(result);
  });
  it('routes atomic ordering before the generic song UUID route', async () => {
    rpc.mockResolvedValue({ data: setlistId, error: null });
    await request(app.getHttpServer())
      .patch(`/v1/setlists/${setlistId}/songs/order`)
      .set('Cookie', 'access_token=synthetic')
      .send({ song_ids: [songId] })
      .expect(200)
      .expect({ data: { id: setlistId } });
    expect(rpc).toHaveBeenCalledWith('reorder_setlist_songs', {
      p_user_id: userId,
      p_setlist_id: setlistId,
      p_song_ids: [songId],
    });
  });
  it('rejects repeated ordering IDs before executing the transaction', async () => {
    await request(app.getHttpServer())
      .patch(`/v1/setlists/${setlistId}/songs/order`)
      .set('Cookie', 'access_token=synthetic')
      .send({ song_ids: [songId, songId] })
      .expect(400);
    expect(rpc).not.toHaveBeenCalled();
  });
  it('returns the same recovery response for known and missing accounts', async () => {
    const known = await request(app.getHttpServer())
      .post('/v1/auth/forgot-password')
      .send({ email: 'known@example.test' })
      .expect(200);
    auth.resetPasswordForEmail.mockResolvedValue({
      error: new AuthApiError('Private detail', 400, 'user_not_found'),
    });
    const missing = await request(app.getHttpServer())
      .post('/v1/auth/forgot-password')
      .send({ email: 'missing@example.test' })
      .expect(200);
    expect(known.body).toEqual(missing.body);
    expect(auth.getUser).not.toHaveBeenCalled();
  });
  it('rejects caller-controlled redirects before calling the provider', async () => {
    await request(app.getHttpServer())
      .post('/v1/auth/forgot-password')
      .send({ email: 'user@example.test', redirectTo: 'https://evil.example' })
      .expect(400);
    expect(auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });
  it('rejects expired tokens without changing passwords', async () => {
    auth.verifyOtp.mockResolvedValue({
      data: { user: null, session: null },
      error: new AuthApiError('Private detail', 403, 'otp_expired'),
    });
    await request(app.getHttpServer())
      .post('/v1/auth/reset-password')
      .send({ token_hash: 'synthetic-expired', password: 'newpassword' })
      .expect(401);
    expect(auth.updateUser).not.toHaveBeenCalled();
  });
  it('updates passwords without exposing sessions and clears cookies', async () => {
    const result = await request(app.getHttpServer())
      .post('/v1/auth/reset-password')
      .send({ token_hash: 'synthetic-valid', password: 'newpassword' })
      .expect(200);
    expect(result.body).toEqual({
      data: { message: 'Password updated. Please log in again.' },
    });
    expect(result.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringContaining('access_token=;'),
        expect.stringContaining('refresh_token=;'),
      ]),
    );
  });
  it('rejects disallowed Origins on recovery requests', async () => {
    await request(app.getHttpServer())
      .post('/v1/auth/forgot-password')
      .set('Origin', 'https://evil.example')
      .send({ email: 'user@example.test' })
      .expect(403);
  });
  it('throttles repeated recovery requests', async () => {
    let status = 0;
    for (let attempt = 0; attempt < 6; attempt++) {
      const response = await request(app.getHttpServer())
        .post('/v1/auth/forgot-password')
        .send({ email: 'user@example.test' });
      status = response.status;
    }
    expect(status).toBe(429);
  });
  it('supports the standard email redirect session with a one-use email proof', async () => {
    await request(app.getHttpServer())
      .post('/v1/auth/reset-password/session')
      .send({
        recovery_token: 'b'.repeat(64),
        refresh_token: 'synthetic-refresh',
        password: 'newpassword',
      })
      .expect(200)
      .expect({ data: { message: 'Password updated. Please log in again.' } });
    expect(auth.refreshSession).toHaveBeenCalledWith({
      refresh_token: 'synthetic-refresh',
    });
    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'global' });
  });
  it('rejects standard sessions without an email proof before calling Supabase', async () => {
    await request(app.getHttpServer())
      .post('/v1/auth/reset-password/session')
      .send({ refresh_token: 'synthetic-refresh', password: 'newpassword' })
      .expect(400);
    expect(auth.refreshSession).not.toHaveBeenCalled();
  });
  it('rejects reused or expired email proofs without changing passwords', async () => {
    proofQuery.maybeSingle.mockResolvedValue({ data: null, error: null });
    await request(app.getHttpServer())
      .post('/v1/auth/reset-password/session')
      .send({
        recovery_token: 'b'.repeat(64),
        refresh_token: 'synthetic-refresh',
        password: 'newpassword',
      })
      .expect(401);
    expect(auth.updateUser).not.toHaveBeenCalled();
  });
});
