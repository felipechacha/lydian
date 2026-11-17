import { Injectable } from '@nestjs/common';
import { SupabaseAdminClient } from '../../../infra/supabase/supabase-admin.client';
import { throwMappedDatabaseError } from '../../../common/database/database-error.mapper';
import type { AddPracticeSongDto } from '../dto/add-practice-song.dto';
import type { UpdatePracticeSongDto } from '../dto/update-practice-song.dto';
import type { PracticeSessionSong } from '../entities/practice-session.entity';

@Injectable()
export class PracticeSessionSongsRepository {
  constructor(private readonly supabaseAdmin: SupabaseAdminClient) {}

  async add(
    sessionId: string,
    dto: AddPracticeSongDto,
  ): Promise<PracticeSessionSong> {
    const { song_id, technique_ids, ...details } = dto;
    const { data, error } = await this.supabaseAdmin
      .getClient()
      .from('practice_session_songs')
      .insert({ practice_session_id: sessionId, song_id, ...details })
      .select('*')
      .single();
    if (error) throwMappedDatabaseError(error);
    await this.replaceTechniques(data.id, technique_ids ?? []);
    return data;
  }

  async update(
    sessionId: string,
    songId: string,
    dto: UpdatePracticeSongDto,
  ): Promise<PracticeSessionSong> {
    const { technique_ids, ...details } = dto;
    const { data, error } = await this.supabaseAdmin
      .getClient()
      .from('practice_session_songs')
      .update(details)
      .eq('practice_session_id', sessionId)
      .eq('song_id', songId)
      .select('*')
      .single();
    if (error) throwMappedDatabaseError(error);
    if (technique_ids) await this.replaceTechniques(data.id, technique_ids);
    return data;
  }

  async remove(sessionId: string, songId: string): Promise<void> {
    const { error } = await this.supabaseAdmin
      .getClient()
      .from('practice_session_songs')
      .delete()
      .eq('practice_session_id', sessionId)
      .eq('song_id', songId);
    if (error) throwMappedDatabaseError(error);
  }

  private async replaceTechniques(
    practiceSessionSongId: string,
    techniqueIds: readonly string[],
  ): Promise<void> {
    const client = this.supabaseAdmin.getClient();
    const { error: deleteError } = await client
      .from('practice_session_techniques')
      .delete()
      .eq('practice_session_song_id', practiceSessionSongId);
    if (deleteError) throwMappedDatabaseError(deleteError);

    if (techniqueIds.length === 0) return;
    const { error: insertError } = await client
      .from('practice_session_techniques')
      .insert(
        techniqueIds.map((techniqueId) => ({
          practice_session_song_id: practiceSessionSongId,
          technique_id: techniqueId,
        })),
      );
    if (insertError) throwMappedDatabaseError(insertError);
  }
}
