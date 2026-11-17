import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../infra/supabase/supabase.module';
import { SongsModule } from '../songs/songs.module';
import { PracticeController } from './practice.controller';
import { PracticeService } from './practice.service';
import { PracticeSessionSongsRepository } from './repositories/practice-session-songs.repository';
import { PracticeSessionsRepository } from './repositories/practice-sessions.repository';
import { TechniquesModule } from '../techniques/techniques.module';

@Module({
  imports: [SupabaseModule, SongsModule, TechniquesModule],
  controllers: [PracticeController],
  providers: [
    PracticeService,
    PracticeSessionsRepository,
    PracticeSessionSongsRepository,
  ],
})
export class PracticeModule {}
