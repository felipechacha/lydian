import { Injectable } from '@nestjs/common';
import type { Response } from 'express';

@Injectable()
export class AuthCookieService {
  private usesSecureCookies(): boolean {
    return ['staging', 'production'].includes(process.env.NODE_ENV ?? '');
  }

  setSession(response: Response, accessToken: string, refreshToken: string) {
    const sharedOptions = {
      httpOnly: true,
      secure: this.usesSecureCookies(),
      sameSite: 'lax' as const,
      path: '/',
    };

    response.cookie('access_token', accessToken, {
      ...sharedOptions,
      maxAge: 60 * 60 * 1000,
    });
    response.cookie('refresh_token', refreshToken, {
      ...sharedOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }

  clearSession(response: Response) {
    const options = {
      httpOnly: true,
      secure: this.usesSecureCookies(),
      sameSite: 'lax' as const,
      path: '/',
    };
    response.clearCookie('access_token', options);
    response.clearCookie('refresh_token', options);
  }
}
