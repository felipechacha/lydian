import { Injectable } from '@nestjs/common';
import type { ResetPasswordSessionDto } from './dto/reset-password-session.dto';
import type {
  ResetPasswordDto,
  RequestPasswordRecoveryDto,
} from './dto/password-recovery.dto';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { AuthRepository } from './repositories/auth.repository';

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async requestPasswordRecovery(dto: RequestPasswordRecoveryDto) {
    await this.authRepository.requestPasswordRecovery(dto.email.trim());
    return {
      message:
        'If an account exists for this email, a password recovery link will be sent.',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    await this.authRepository.resetPassword(dto);
    return { message: 'Password updated. Please log in again.' };
  }

  async resetPasswordFromSession(dto: ResetPasswordSessionDto) {
    await this.authRepository.resetPasswordFromSession(dto);
    return { message: 'Password updated. Please log in again.' };
  }

  async signup(signupDto: SignupDto) {
    const user = await this.authRepository.signup(signupDto);
    const fullName: unknown = user.user_metadata.full_name;
    return {
      id: user.id,
      email: user.email ?? signupDto.email,
      fullName: typeof fullName === 'string' ? fullName : signupDto.fullName,
    };
  }

  async login(loginDto: LoginDto) {
    return this.authRepository.login(loginDto);
  }

  async logout(accessToken: string) {
    await this.authRepository.logout(accessToken);
  }

  async refresh(refreshToken: string) {
    return this.authRepository.refresh(refreshToken);
  }
}
