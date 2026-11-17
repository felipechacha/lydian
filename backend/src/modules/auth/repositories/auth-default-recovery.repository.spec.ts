import { ConfigService } from '@nestjs/config';
import { AuthApiError } from '@supabase/supabase-js';
import { UnauthorizedException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { AuthRepository } from './auth.repository';
import { SupabaseAdminClient } from '../../../infra/supabase/supabase-admin.client';

const hash = (value: string) =>
  createHash('sha256').update(value).digest('hex');
describe('Default email recovery', () => {
  const auth = {
    resetPasswordForEmail: jest.fn(),
    refreshSession: jest.fn(),
    updateUser: jest.fn(),
    signOut: jest.fn(),
  };
  const cleanup = jest.fn();
  const insert = jest.fn();
  const consume = jest.fn();
  const query = {
    eq: jest.fn(),
    is: jest.fn(),
    gt: jest.fn(),
    select: jest.fn(),
    maybeSingle: consume,
  };
  const update = jest.fn(() => query);
  const from = jest.fn(() => ({
    delete: () => ({ lt: cleanup }),
    insert,
    update,
  }));
  const admin = {
    createAuthClient: () => ({ auth }),
    getClient: () => ({ from }),
  };
  const config = {
    get: (key: string) =>
      key === 'PASSWORD_RECOVERY_MODE'
        ? 'default'
        : 'https://localhost:4200/reset-password/confirm',
  };
  const repository = new AuthRepository(
    admin as unknown as SupabaseAdminClient,
    config as unknown as ConfigService,
  );
  const dto = {
    refresh_token: 'synthetic-refresh',
    recovery_token: 'a'.repeat(64),
    password: 'newpassword',
  };
  beforeEach(() => {
    jest.clearAllMocks();
    for (const key of ['eq', 'is', 'gt', 'select'] as const)
      query[key].mockReturnValue(query);
    cleanup.mockResolvedValue({ error: null });
    insert.mockResolvedValue({ error: null });
    consume.mockResolvedValue({
      data: { token_hash: hash(dto.recovery_token) },
      error: null,
    });
    auth.resetPasswordForEmail.mockResolvedValue({ error: null });
    auth.refreshSession.mockResolvedValue({
      data: {
        session: { access_token: 'synthetic' },
        user: { id: 'test-user', email: 'User@Example.test' },
      },
      error: null,
    });
    auth.updateUser.mockResolvedValue({ error: null });
    auth.signOut.mockResolvedValue({ error: null });
  });
  it('sends the proof only in the email redirect and stores its hash with the intended email', async () => {
    await repository.requestPasswordRecovery('user@example.test');
    const args = auth.resetPasswordForEmail.mock.calls[0] as [
      string,
      { redirectTo: string },
    ];
    const proof = new URL(args[1].redirectTo).searchParams.get(
      'recovery_token',
    );
    expect(proof).toMatch(/^[a-f0-9]{64}$/);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        token_hash: hash(proof!),
        email_hash: hash('user@example.test'),
      }),
    );
    expect(cleanup).toHaveBeenCalled();
  });
  it('verifies the session server-side and consumes an email-bound proof before changing the password', async () => {
    await repository.resetPasswordFromSession(dto);
    expect(auth.refreshSession).toHaveBeenCalledWith({
      refresh_token: dto.refresh_token,
    });
    expect(update).toHaveBeenCalledWith({
      consumed_at: expect.any(String) as unknown,
    });
    expect(query.eq).toHaveBeenCalledWith(
      'token_hash',
      hash(dto.recovery_token),
    );
    expect(query.eq).toHaveBeenCalledWith(
      'email_hash',
      hash('user@example.test'),
    );
    expect(query.is).toHaveBeenCalledWith('consumed_at', null);
    expect(query.gt).toHaveBeenCalledWith('expires_at', expect.any(String));
    expect(consume.mock.invocationCallOrder[0]).toBeLessThan(
      auth.updateUser.mock.invocationCallOrder[0],
    );
    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'global' });
  });
  it.each(['expired', 'used', 'foreign-email', 'invalid'])(
    'rejects %s proofs without altering passwords',
    async () => {
      consume.mockResolvedValue({ data: null, error: null });
      await expect(
        repository.resetPasswordFromSession(dto),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(auth.updateUser).not.toHaveBeenCalled();
    },
  );
  it('rejects revoked refresh tokens before consuming the proof', async () => {
    auth.refreshSession.mockResolvedValue({
      data: null,
      error: new AuthApiError('private detail', 400, 'refresh_token_not_found'),
    });
    await expect(
      repository.resetPasswordFromSession(dto),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(update).not.toHaveBeenCalled();
  });
  it('rejects session verification without a user email', async () => {
    auth.refreshSession.mockResolvedValue({
      data: {
        session: { access_token: 'synthetic' },
        user: { id: 'test-user' },
      },
      error: null,
    });
    await expect(
      repository.resetPasswordFromSession(dto),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(update).not.toHaveBeenCalled();
  });
});
