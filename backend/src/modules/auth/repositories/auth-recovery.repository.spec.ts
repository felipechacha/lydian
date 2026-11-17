import { ConfigService } from '@nestjs/config';
import { AuthApiError } from '@supabase/supabase-js';
import {
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { SupabaseAdminClient } from '../../../infra/supabase/supabase-admin.client';

const token = 'synthetic-recovery-token-for-test';
describe('Password recovery repository', () => {
  const auth = {
    resetPasswordForEmail: jest.fn(),
    verifyOtp: jest.fn(),
    updateUser: jest.fn(),
    signOut: jest.fn(),
  };
  const admin = {
    createAuthClient: jest.fn(() => ({ auth })),
    getClient: jest.fn(),
  };
  const config = {
    get: jest.fn(() => 'https://localhost:4200/reset-password/confirm'),
  };
  let repository: AuthRepository;
  beforeEach(() => {
    jest.clearAllMocks();
    config.get.mockReturnValue('https://localhost:4200/reset-password/confirm');
    auth.verifyOtp.mockResolvedValue({
      data: { user: { id: 'one' }, session: { access_token: 'synthetic' } },
      error: null,
    });
    auth.updateUser.mockResolvedValue({ error: null });
    auth.signOut.mockResolvedValue({ error: null });
    auth.resetPasswordForEmail.mockResolvedValue({ error: null });
    repository = new AuthRepository(
      admin as unknown as SupabaseAdminClient,
      config as unknown as ConfigService,
    );
  });
  it('uses the configured redirect, isolated SDK client, and no shared auth state', async () => {
    await repository.requestPasswordRecovery('user@example.test');
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'user@example.test',
      { redirectTo: 'https://localhost:4200/reset-password/confirm' },
    );
    expect(admin.getClient).not.toHaveBeenCalled();
  });
  it('does not reveal provider account-not-found errors', async () => {
    auth.resetPasswordForEmail.mockResolvedValue({
      error: new AuthApiError('private provider detail', 400, 'user_not_found'),
    });
    await expect(
      repository.requestPasswordRecovery('missing@example.test'),
    ).resolves.toBeUndefined();
  });
  it('reports unavailable configuration before sending email', async () => {
    config.get.mockReturnValue('');
    await expect(
      repository.requestPasswordRecovery('user@example.test'),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(auth.resetPasswordForEmail).not.toHaveBeenCalled();
  });
  it('accepts only recovery tokens and revokes refresh sessions after the update', async () => {
    await repository.resetPassword({
      token_hash: token,
      password: 'newpassword',
    });
    expect(auth.verifyOtp).toHaveBeenCalledWith({
      token_hash: token,
      type: 'recovery',
    });
    expect(auth.updateUser).toHaveBeenCalledWith({ password: 'newpassword' });
    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'global' });
    expect(auth.updateUser.mock.invocationCallOrder[0]).toBeLessThan(
      auth.signOut.mock.invocationCallOrder[0],
    );
    expect(admin.getClient).not.toHaveBeenCalled();
  });
  it.each(['otp_expired', 'otp_disabled'])(
    'rejects %s without changing a password',
    async (code) => {
      auth.verifyOtp.mockResolvedValue({
        data: { session: null, user: null },
        error: new AuthApiError('private detail', 403, code),
      });
      await expect(
        repository.resetPassword({
          token_hash: token,
          password: 'newpassword',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(auth.updateUser).not.toHaveBeenCalled();
    },
  );
  it('rejects verification without a session', async () => {
    auth.verifyOtp.mockResolvedValue({
      data: { session: null, user: null },
      error: null,
    });
    await expect(
      repository.resetPassword({ token_hash: token, password: 'newpassword' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(auth.updateUser).not.toHaveBeenCalled();
  });
  it('invalidates the recovery session even if the new password is rejected', async () => {
    auth.updateUser.mockResolvedValue({
      error: new AuthApiError('weak password', 422, 'weak_password'),
    });
    await expect(
      repository.resetPassword({ token_hash: token, password: 'newpassword' }),
    ).rejects.toThrow('New password does not meet');
    expect(auth.signOut).toHaveBeenCalledWith({ scope: 'local' });
  });
  it('reports partial failure when session revocation fails after the password update', async () => {
    auth.signOut.mockResolvedValue({
      error: new AuthApiError(
        'provider unavailable',
        503,
        'unexpected_failure',
      ),
    });
    await expect(
      repository.resetPassword({ token_hash: token, password: 'newpassword' }),
    ).rejects.toThrow('Password updated but session revocation failed');
  });
  it('preserves password policy errors when session cleanup also fails', async () => {
    auth.updateUser.mockResolvedValue({
      error: new AuthApiError('weak password', 422, 'weak_password'),
    });
    auth.signOut.mockResolvedValue({
      error: new AuthApiError(
        'provider unavailable',
        503,
        'unexpected_failure',
      ),
    });
    await expect(
      repository.resetPassword({ token_hash: token, password: 'newpassword' }),
    ).rejects.toThrow('New password does not meet');
  });
});
