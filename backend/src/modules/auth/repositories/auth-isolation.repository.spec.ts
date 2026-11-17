import { AuthRepository } from './auth.repository';
import { SupabaseAdminClient } from '../../../infra/supabase/supabase-admin.client';
import { ConfigService } from '@nestjs/config';

describe('Auth SDK session isolation', () => {
  const auth = {
    signUp: jest
      .fn()
      .mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
    signInWithPassword: jest.fn().mockResolvedValue({
      data: { session: { access_token: 'synthetic' } },
      error: null,
    }),
    refreshSession: jest.fn().mockResolvedValue({
      data: { session: { access_token: 'synthetic' } },
      error: null,
    }),
  };
  const admin = {
    createAuthClient: jest.fn(() => ({ auth })),
    getClient: jest.fn(),
  };
  const repository = new AuthRepository(
    admin as unknown as SupabaseAdminClient,
    {} as ConfigService,
  );
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('keeps signup sessions out of the shared database client', async () => {
    await repository.signup({
      email: 'test@example.invalid',
      password: 'password',
      fullName: 'Test',
    });
    expect(admin.createAuthClient).toHaveBeenCalled();
    expect(admin.getClient).not.toHaveBeenCalled();
  });
  it('keeps login sessions out of the shared database client', async () => {
    await repository.login({
      email: 'test@example.invalid',
      password: 'password',
    });
    expect(admin.createAuthClient).toHaveBeenCalled();
    expect(admin.getClient).not.toHaveBeenCalled();
  });
  it('keeps refresh sessions out of the shared database client', async () => {
    await repository.refresh('synthetic-refresh');
    expect(admin.createAuthClient).toHaveBeenCalled();
    expect(admin.getClient).not.toHaveBeenCalled();
  });
});
