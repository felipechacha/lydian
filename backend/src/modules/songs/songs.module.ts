import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../infra/supabase/supabase.module';
import { SongsController } from './songs.controller';
import { SongsRepository } from './repositories/songs.repository';
import { SongsService } from './songs.service';
import { TechniquesModule } from '../techniques/techniques.module';

@Module({
  imports: [SupabaseModule, TechniquesModule],
  controllers: [SongsController],
  providers: [SongsService, SongsRepository],
  exports: [SongsService, SongsRepository],
})
export class SongsModule {}
