import { PracticeSummaryService } from './practice-summary.service';
import { PracticeSummaryController } from './practice-summary.controller';
import { PracticeSummaryRepository } from './repositories/practice-summary.repository';
import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../infra/supabase/supabase.module';
import { UsersController } from './users.controller';
import { UsersRepository } from './repositories/users.repository';
import { UsersService } from './users.service';

@Module({
  imports: [SupabaseModule],
  controllers: [UsersController, PracticeSummaryController],
  providers: [
    UsersService,
    UsersRepository,
    PracticeSummaryRepository,
    PracticeSummaryService,
  ],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
