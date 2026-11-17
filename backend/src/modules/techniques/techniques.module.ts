import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../infra/supabase/supabase.module';
import { TechniquesRepository } from './repositories/techniques.repository';
import { TechniquesController } from './techniques.controller';
import { TechniquesService } from './techniques.service';

@Module({
  imports: [SupabaseModule],
  controllers: [TechniquesController],
  providers: [TechniquesService, TechniquesRepository],
  exports: [TechniquesService, TechniquesRepository],
})
export class TechniquesModule {}
