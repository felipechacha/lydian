import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import type { ResetPasswordDto } from '../dto/password-recovery.dto';
import type { ResetPasswordSessionDto } from '../dto/reset-password-session.dto';
import type { Database } from '../../../infra/supabase/database.types';
import { throwMappedDatabaseError } from '../../../common/database/database-error.mapper';
import type { Session, User, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseAdminClient } from '../../../infra/supabase/supabase-admin.client';
import type { LoginDto } from '../dto/login.dto';
import type { SignupDto } from '../dto/signup.dto';
import { throwMappedAuthError } from '../auth-error.mapper';

@Injectable()
export class AuthRepository {
  constructor(
    private readonly supabaseAdmin: SupabaseAdminClient,
    private readonly configService: ConfigService,
  ) {}

  async requestPasswordRecovery(email: string): Promise<void> {
    const redirectTo = this.configService.get<string>(
      'PASSWORD_RESET_REDIRECT_URL',
    );
    if (!redirectTo)
      throw new ServiceUnavailableException(
        'Password recovery is not configured',
      );
    let recoveryRedirect = redirectTo;
    if (
      this.configService.get<string>('PASSWORD_RECOVERY_MODE', 'default') ===
      'default'
    ) {
      const database = this.supabaseAdmin.getClient();
      const now = new Date();
      const { error: cleanupError } = await database
        .from('password_recovery_requests')
        .delete()
        .lt('expires_at', now.toISOString());
      if (cleanupError) throwMappedDatabaseError(cleanupError);
      const proof = randomBytes(32).toString('hex');
      const { error: requestError } = await database
        .from('password_recovery_requests')
        .insert({
          token_hash: hash(proof),
          email_hash: hash(email.trim().toLowerCase()),
          expires_at: new Date(now.getTime() + 3600000).toISOString(),
        });
      if (requestError) throwMappedDatabaseError(requestError);
      // The proof is not returned by the API; only the email recipient receives it.
      recoveryRedirect = redirectTo + '?recovery_token=' + proof;
    }
    const client = this.supabaseAdmin.createAuthClient();
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: recoveryRedirect,
    });
    if (error) throwMappedAuthError(error, 'recovery-request');
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const client = this.supabaseAdmin.createAuthClient();
    const { data, error } = await client.auth.verifyOtp({
      token_hash: dto.token_hash,
      type: 'recovery',
    });
    if (error) throwMappedAuthError(error, 'reset-password');
    if (!data.session || !data.user)
      throw new UnauthorizedException('Invalid or expired recovery token');
    return this.updateRecoveryPassword(client, dto.password);
  }

  async resetPasswordFromSession(dto: ResetPasswordSessionDto): Promise<void> {
    const client = this.supabaseAdmin.createAuthClient();
    // Refresh verifies the token and server-side session before any claim is trusted.
    const { data, error } = await client.auth.refreshSession({
      refresh_token: dto.refresh_token,
    });
    if (error) throwMappedAuthError(error, 'reset-password');
    if (!data.session || !data.user)
      throw new UnauthorizedException('Invalid recovery session');
    if (!data.user.email)
      throw new UnauthorizedException('Invalid recovery session');
    const now = new Date().toISOString();
    // Email-bound proof prevents ordinary login/OTP sessions from authorizing a reset.
    // Concurrent updates re-check consumed_at after row locking, so only one succeeds.
    const { data: request, error: redemptionError } = await this.supabaseAdmin
      .getClient()
      .from('password_recovery_requests')
      .update({ consumed_at: now })
      .eq('token_hash', hash(dto.recovery_token))
      .eq('email_hash', hash(data.user.email.trim().toLowerCase()))
      .is('consumed_at', null)
      .gt('expires_at', now)
      .select('token_hash')
      .maybeSingle();
    if (redemptionError) throwMappedDatabaseError(redemptionError);
    if (!request)
      throw new UnauthorizedException(
        'Invalid, expired or used recovery request',
      );
    return this.updateRecoveryPassword(client, dto.password);
  }

  private async updateRecoveryPassword(
    client: SupabaseClient<Database>,
    password: string,
  ): Promise<void> {
    let passwordUpdated = false;
    let updateFailure: unknown;
    try {
      const { error: updateError } = await client.auth.updateUser({
        password,
      });
      if (updateError) throwMappedAuthError(updateError, 'reset-password');
      passwordUpdated = true;
    } catch (error) {
      updateFailure = error;
    }
    // Revoke only the recovery session on failure; preserve other sessions.
    let revocationFailed = false;
    try {
      const { error: signOutError } = await client.auth.signOut({
        scope: passwordUpdated ? 'global' : 'local',
      });
      revocationFailed = Boolean(signOutError);
    } catch {
      revocationFailed = true;
    }
    if (!passwordUpdated) throw updateFailure;
    if (revocationFailed)
      throw new ServiceUnavailableException(
        'Password updated but session revocation failed',
      );
  }

  async signup(dto: SignupDto): Promise<User> {
    const { data, error } = await this.supabaseAdmin
      .createAuthClient()
      .auth.signUp({
        email: dto.email,
        password: dto.password,
        options: { data: { full_name: dto.fullName } },
      });

    if (error) throwMappedAuthError(error, 'signup');
    if (!data.user) throw new BadRequestException('Unable to create user');
    return data.user;
  }

  async login(dto: LoginDto): Promise<Session> {
    const { data, error } = await this.supabaseAdmin
      .createAuthClient()
      .auth.signInWithPassword(dto);
    if (error) throwMappedAuthError(error, 'login');
    if (!data.session) throw new UnauthorizedException('Invalid credentials');
    return data.session;
  }

  async refresh(refreshToken: string): Promise<Session> {
    const { data, error } = await this.supabaseAdmin
      .createAuthClient()
      .auth.refreshSession({ refresh_token: refreshToken });
    if (error) throwMappedAuthError(error, 'refresh');
    if (!data.session) throw new UnauthorizedException('Invalid refresh token');
    return data.session;
  }

  async logout(accessToken: string): Promise<void> {
    const { error } = await this.supabaseAdmin
      .getClient()
      .auth.admin.signOut(accessToken, 'global');
    if (error) throwMappedAuthError(error, 'logout');
  }
}

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
