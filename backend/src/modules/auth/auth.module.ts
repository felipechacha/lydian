import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SupabaseModule } from '../../infra/supabase/supabase.module';
import { AuthRepository } from './repositories/auth.repository';
import { AuthCookieService } from './auth-cookie.service';

@Module({
  imports: [SupabaseModule],
  controllers: [AuthController],
  providers: [AuthService, AuthRepository, AuthCookieService],
})
export class AuthModule {}
