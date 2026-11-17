import type { Response } from 'express';
import { AuthCookieService } from './auth-cookie.service';

describe('AuthCookieService', () => {
  const originalNodeEnvironment = process.env.NODE_ENV;
  let service: AuthCookieService;
  let response: Response;
  let cookie: jest.Mock;
  let clearCookie: jest.Mock;

  beforeEach(() => {
    service = new AuthCookieService();
    cookie = jest.fn();
    clearCookie = jest.fn();
    response = { cookie, clearCookie } as unknown as Response;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnvironment;
  });

  it.each(['staging', 'production'])(
    'sets Secure session cookies in %s',
    (nodeEnvironment) => {
      process.env.NODE_ENV = nodeEnvironment;

      service.setSession(response, 'access', 'refresh');

      expect(cookie).toHaveBeenCalledTimes(2);
      expect(cookie).toHaveBeenNthCalledWith(
        1,
        'access_token',
        'access',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
        }),
      );
      expect(cookie).toHaveBeenNthCalledWith(
        2,
        'refresh_token',
        'refresh',
        expect.objectContaining({
          httpOnly: true,
          secure: true,
          sameSite: 'lax',
        }),
      );
    },
  );

  it('keeps local development cookies compatible with HTTP', () => {
    process.env.NODE_ENV = 'development';

    service.setSession(response, 'access', 'refresh');

    expect(cookie).toHaveBeenNthCalledWith(
      1,
      'access_token',
      'access',
      expect.objectContaining({ secure: false }),
    );
  });

  it('clears cookies with the same production security options', () => {
    process.env.NODE_ENV = 'production';

    service.clearSession(response);

    expect(clearCookie).toHaveBeenCalledTimes(2);
    expect(clearCookie).toHaveBeenNthCalledWith(
      1,
      'access_token',
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
      }),
    );
  });
});
