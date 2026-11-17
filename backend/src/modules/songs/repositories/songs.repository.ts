import { Injectable } from '@nestjs/common';
import { SupabaseAdminClient } from '../../../infra/supabase/supabase-admin.client';
import { throwMappedDatabaseError } from '../../../common/database/database-error.mapper';
import type { PaginatedResponse } from '../../../common/dto/pagination-query.dto';
import type { CreateSongDto } from '../dto/create-song.dto';
import type { ListSongsQueryDto } from '../dto/list-songs-query.dto';
import type { UpdateSongDto } from '../dto/update-song.dto';
import type { Song } from '../entities/song.entity';

@Injectable()
export class SongsRepository {
  constructor(private readonly supabaseAdmin: SupabaseAdminClient) {}

  async findAll(
    userId: string,
    query: ListSongsQueryDto,
  ): Promise<PaginatedResponse<Song>> {
    const from = (query.page - 1) * query.limit;
    const to = from + query.limit - 1;
    let request = this.supabaseAdmin
      .getClient()
      .from('songs')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (query.search?.trim()) {
      const search = sanitizeSearch(query.search);
      request = request.or(`title.ilike.%${search}%,artist.ilike.%${search}%`);
    }

    const { data, count, error } = await request
      .order(query.sort_by, { ascending: query.sort_order === 'asc' })
      .range(from, to);
    if (error) throwMappedDatabaseError(error);
    return {
      data: (data ?? []) as Song[],
      meta: { page: query.page, limit: query.limit, total: count ?? 0 },
    };
  }

  async findById(id: string, userId: string): Promise<Song | null> {
    const { data, error } = await this.supabaseAdmin
      .getClient()
      .from('songs')
      .select('*,song_techniques(*,techniques(*))')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) throwMappedDatabaseError(error);
    return data as Song | null;
  }

  async replaceTechniques(
    songId: string,
    techniqueIds: readonly string[],
  ): Promise<void> {
    const client = this.supabaseAdmin.getClient();
    const { error: deleteError } = await client
      .from('song_techniques')
      .delete()
      .eq('song_id', songId);
    if (deleteError) throwMappedDatabaseError(deleteError);

    if (techniqueIds.length === 0) return;
    const { error: insertError } = await client.from('song_techniques').insert(
      techniqueIds.map((techniqueId) => ({
        song_id: songId,
        technique_id: techniqueId,
      })),
    );
    if (insertError) throwMappedDatabaseError(insertError);
  }

  async create(userId: string, dto: CreateSongDto): Promise<Song> {
    const { data, error } = await this.supabaseAdmin
      .getClient()
      .from('songs')
      .insert({ ...dto, user_id: userId })
      .select('*')
      .single();
    if (error) throwMappedDatabaseError(error);
    return data as Song;
  }

  async update(id: string, userId: string, dto: UpdateSongDto): Promise<Song> {
    const { data, error } = await this.supabaseAdmin
      .getClient()
      .from('songs')
      .update(dto)
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .select('*')
      .single();
    if (error) throwMappedDatabaseError(error);
    return data as Song;
  }

  async softDelete(id: string, userId: string): Promise<void> {
    const { error } = await this.supabaseAdmin
      .getClient()
      .from('songs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null);
    if (error) throwMappedDatabaseError(error);
  }
}

function sanitizeSearch(value: string): string {
  return value
    .trim()
    .replace(/[,%()]/g, '')
    .slice(0, 100);
}
