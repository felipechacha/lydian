import {
  BadRequestException,
  ForbiddenException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthError } from '@supabase/supabase-js';
import { TooManyRequestsException } from '../../common/exceptions/too-many-requests.exception';

export type AuthOperation =
  | 'signup'
  | 'login'
  | 'refresh'
  | 'logout'
  | 'recovery-request'
  | 'reset-password';

const RATE_LIMIT_CODES = new Set([
  'over_request_rate_limit',
  'over_email_send_rate_limit',
  'over_sms_send_rate_limit',
]);

export function throwMappedAuthError(
  error: AuthError,
  operation: Exclude<AuthOperation, 'recovery-request'>,
): never;
export function throwMappedAuthError(
  error: AuthError,
  operation: 'recovery-request',
): void;
export function throwMappedAuthError(
  error: AuthError,
  operation: AuthOperation,
): void {
  if (
    operation === 'recovery-request' &&
    [
      'user_not_found',
      'email_not_found',
      'email_not_confirmed',
      'user_banned',
    ].includes(error.code ?? '')
  ) {
    return; // Provider account errors must not reveal whether the email exists.
  }
  if (error.status === 429 || RATE_LIMIT_CODES.has(error.code ?? '')) {
    throw new TooManyRequestsException(
      operation === 'recovery-request' || operation === 'reset-password'
        ? 'Too many authentication requests'
        : error.message,
    );
  }

  if (error.code === 'email_not_confirmed') {
    throw new ForbiddenException('Email not confirmed');
  }

  if (error.code === 'user_banned') {
    throw new ForbiddenException('User access is disabled');
  }

  if (error.status !== undefined && error.status >= 500) {
    throw new ServiceUnavailableException(
      'Authentication service is temporarily unavailable',
    );
  }

  if (operation === 'recovery-request') {
    throw new ServiceUnavailableException(
      'Password recovery is temporarily unavailable',
    );
  }
  if (operation === 'reset-password') {
    if (
      ['weak_password', 'same_password', 'validation_failed'].includes(
        error.code ?? '',
      )
    ) {
      throw new BadRequestException(
        'New password does not meet the password requirements',
      );
    }
    throw new UnauthorizedException('Invalid or expired recovery token');
  }
  if (operation === 'signup') {
    throw new BadRequestException(error.message);
  }

  if (operation === 'login') {
    throw new UnauthorizedException('Invalid credentials');
  }

  if (operation === 'refresh') {
    throw new UnauthorizedException('Invalid refresh token');
  }

  throw new UnauthorizedException('Unable to invalidate session');
}
