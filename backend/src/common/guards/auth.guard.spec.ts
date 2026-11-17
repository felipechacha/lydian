import { UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { SupabaseAdminClient } from '../../infra/supabase/supabase-admin.client';

describe('AuthGuard', () => {
  const getUser = jest.fn();
  const supabase = {
    getClient: () => ({ auth: { getUser } }),
  } as unknown as SupabaseAdminClient;
  const reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
  const guard = new AuthGuard(reflector, supabase);

  function context(request: Record<string, unknown>) {
    return {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => undefined,
      getClass: () => undefined,
    } as unknown as ExecutionContext;
  }

  beforeEach(() => jest.clearAllMocks());

  it('allows public routes without a cookie', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    await expect(guard.canActivate(context({ cookies: {} }))).resolves.toBe(
      true,
    );
  });

  it('rejects protected routes without an access token', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    await expect(
      guard.canActivate(context({ cookies: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('attaches the validated user to the request', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    getUser.mockResolvedValue({
      data: {
        user: {
          id: 'user-1',
          email: 'user@example.com',
          role: 'authenticated',
        },
      },
      error: null,
    });
    const request = { cookies: { access_token: 'access-token' } };
    await expect(guard.canActivate(context(request))).resolves.toBe(true);
    expect(request).toHaveProperty('user.id', 'user-1');
  });
});
