import { Injectable } from '@nestjs/common';
import { SupabaseAdminClient } from '../../../infra/supabase/supabase-admin.client';
import { throwMappedDatabaseError } from '../../../common/database/database-error.mapper';
import type { UpdateSetlistSongDto } from '../dto/update-setlist-song.dto';
import type { SetlistSong } from '../entities/setlist.entity';

@Injectable()
export class SetlistSongsRepository {
  constructor(private readonly supabaseAdmin: SupabaseAdminClient) {}

  async reorder(
    userId: string,
    setlistId: string,
    songIds: string[],
  ): Promise<void> {
    const { error } = await this.supabaseAdmin
      .getClient()
      .rpc('reorder_setlist_songs', {
        p_user_id: userId,
        p_setlist_id: setlistId,
        p_song_ids: songIds,
      });
    if (error) throwMappedDatabaseError(error);
  }

  async nextPosition(setlistId: string): Promise<number> {
    const { data, error } = await this.supabaseAdmin
      .getClient()
      .from('setlist_songs')
      .select('position')
      .eq('setlist_id', setlistId)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throwMappedDatabaseError(error);
    return data ? Number(data.position) + 1 : 0;
  }

  async add(
    setlistId: string,
    songId: string,
    position: number,
    notes?: string,
  ): Promise<SetlistSong> {
    const { data, error } = await this.supabaseAdmin
      .getClient()
      .from('setlist_songs')
      .insert({ setlist_id: setlistId, song_id: songId, position, notes })
      .select('*')
      .single();
    if (error) throwMappedDatabaseError(error);
    return data;
  }

  async update(
    setlistId: string,
    songId: string,
    dto: UpdateSetlistSongDto,
  ): Promise<SetlistSong> {
    const { data, error } = await this.supabaseAdmin
      .getClient()
      .from('setlist_songs')
      .update(dto)
      .eq('setlist_id', setlistId)
      .eq('song_id', songId)
      .select('*')
      .single();
    if (error) throwMappedDatabaseError(error);
    return data;
  }

  async remove(setlistId: string, songId: string): Promise<void> {
    const { error } = await this.supabaseAdmin
      .getClient()
      .from('setlist_songs')
      .delete()
      .eq('setlist_id', setlistId)
      .eq('song_id', songId);
    if (error) throwMappedDatabaseError(error);
  }
}
