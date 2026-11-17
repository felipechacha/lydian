import {
  BadRequestException,
  ForbiddenException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthApiError } from '@supabase/supabase-js';
import { TooManyRequestsException } from '../../common/exceptions/too-many-requests.exception';
import { throwMappedAuthError } from './auth-error.mapper';

describe('throwMappedAuthError', () => {
  it('maps email rate limits to HTTP 429', () => {
    const error = new AuthApiError(
      'email rate limit exceeded',
      429,
      'over_email_send_rate_limit',
    );

    expect(() => throwMappedAuthError(error, 'signup')).toThrow(
      TooManyRequestsException,
    );
  });

  it('maps rate-limit codes to HTTP 429 even with a legacy status', () => {
    const error = new AuthApiError(
      'too many requests',
      400,
      'over_request_rate_limit',
    );

    expect(() => throwMappedAuthError(error, 'login')).toThrow(
      TooManyRequestsException,
    );
  });

  it('maps unconfirmed email to HTTP 403', () => {
    const error = new AuthApiError(
      'Email not confirmed',
      400,
      'email_not_confirmed',
    );

    expect(() => throwMappedAuthError(error, 'login')).toThrow(
      ForbiddenException,
    );
  });

  it('keeps invalid login credentials generic and returns HTTP 401', () => {
    const error = new AuthApiError(
      'Invalid login credentials',
      400,
      'invalid_credentials',
    );

    expect(() => throwMappedAuthError(error, 'login')).toThrow(
      UnauthorizedException,
    );
  });

  it('keeps signup validation failures as HTTP 400', () => {
    const error = new AuthApiError(
      'Password should be at least 6 characters',
      400,
      'weak_password',
    );

    expect(() => throwMappedAuthError(error, 'signup')).toThrow(
      BadRequestException,
    );
  });

  it('maps upstream failures to HTTP 503', () => {
    const error = new AuthApiError(
      'upstream unavailable',
      503,
      'unexpected_failure',
    );

    expect(() => throwMappedAuthError(error, 'login')).toThrow(
      ServiceUnavailableException,
    );
  });
});
