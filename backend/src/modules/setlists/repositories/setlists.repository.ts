import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseAdminClient } from '../../../infra/supabase/supabase-admin.client';
import { throwMappedDatabaseError } from '../../../common/database/database-error.mapper';
import type { PaginatedResponse } from '../../../common/dto/pagination-query.dto';
import type { CreateSetlistDto } from '../dto/create-setlist.dto';
import type { ListSetlistsQueryDto } from '../dto/list-setlists-query.dto';
import type { UpdateSetlistDto } from '../dto/update-setlist.dto';
import type { Setlist, SetlistSummary } from '../entities/setlist.entity';

@Injectable()
export class SetlistsRepository {
  constructor(private readonly supabaseAdmin: SupabaseAdminClient) {}

  async findAll(
    userId: string,
    query: ListSetlistsQueryDto,
  ): Promise<PaginatedResponse<SetlistSummary>> {
    const { data, error } = await this.supabaseAdmin
      .getClient()
      .rpc('list_setlist_summaries', {
        p_user_id: userId,
        p_page: query.page,
        p_limit: query.limit,
        p_search: query.search ? sanitizeSearch(query.search) : '',
        p_sort_by: query.sort_by,
        p_sort_order: query.sort_order,
      });
    if (error) throwMappedDatabaseError(error);
    if (!data)
      throw new InternalServerErrorException(
        'Unable to read setlist summaries',
      );
    return data as unknown as PaginatedResponse<SetlistSummary>;
  }

  async findById(id: string, userId: string): Promise<Setlist | null> {
    const { data, error } = await this.supabaseAdmin
      .getClient()
      .from('setlists')
      .select('*,setlist_songs(*,songs(*))')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('position', { referencedTable: 'setlist_songs', ascending: true })
      .maybeSingle();
    if (error) throwMappedDatabaseError(error);
    return data as Setlist | null;
  }

  async create(userId: string, dto: CreateSetlistDto): Promise<Setlist> {
    const { data, error } = await this.supabaseAdmin
      .getClient()
      .from('setlists')
      .insert({ ...dto, user_id: userId })
      .select('*')
      .single();
    if (error) throwMappedDatabaseError(error);
    return data as Setlist;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdateSetlistDto,
  ): Promise<Setlist> {
    const { data, error } = await this.supabaseAdmin
      .getClient()
      .from('setlists')
      .update(dto)
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .select('*')
      .single();
    if (error) throwMappedDatabaseError(error);
    return data as Setlist;
  }

  async softDelete(id: string, userId: string): Promise<void> {
    const { error } = await this.supabaseAdmin
      .getClient()
      .from('setlists')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null);
    if (error) throwMappedDatabaseError(error);
  }
}

function sanitizeSearch(value: string): string {
  return value.trim().replace(/[%_]/g, '').slice(0, 100);
}
