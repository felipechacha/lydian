import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../infra/supabase/supabase.module';
import { SongsModule } from '../songs/songs.module';
import { SetlistSongsRepository } from './repositories/setlist-songs.repository';
import { SetlistsRepository } from './repositories/setlists.repository';
import { SetlistsController } from './setlists.controller';
import { SetlistsService } from './setlists.service';

@Module({
  imports: [SupabaseModule, SongsModule],
  controllers: [SetlistsController],
  providers: [SetlistsService, SetlistsRepository, SetlistSongsRepository],
})
export class SetlistsModule {}
