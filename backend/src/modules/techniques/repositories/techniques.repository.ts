import { Injectable } from '@nestjs/common';
import { throwMappedDatabaseError } from '../../../common/database/database-error.mapper';
import { SupabaseAdminClient } from '../../../infra/supabase/supabase-admin.client';
import type { ListTechniquesQueryDto } from '../dto/list-techniques-query.dto';
import type { Technique } from '../entities/technique.entity';

@Injectable()
export class TechniquesRepository {
  constructor(private readonly supabaseAdmin: SupabaseAdminClient) {}

  async findAll(query: ListTechniquesQueryDto): Promise<Technique[]> {
    let request = this.supabaseAdmin
      .getClient()
      .from('techniques')
      .select('*')
      .eq('active', true);

    if (query.category?.trim()) {
      request = request.eq('category', query.category.trim());
    }
    if (query.search?.trim()) {
      const search = sanitizeSearch(query.search);
      request = request.or(`name.ilike.%${search}%,key.ilike.%${search}%`);
    }

    const { data, error } = await request.order('name', { ascending: true });
    if (error) throwMappedDatabaseError(error);
    return data ?? [];
  }

  async countActiveByIds(ids: readonly string[]): Promise<number> {
    if (ids.length === 0) return 0;
    const { count, error } = await this.supabaseAdmin
      .getClient()
      .from('techniques')
      .select('id', { count: 'exact', head: true })
      .in('id', [...ids])
      .eq('active', true);
    if (error) throwMappedDatabaseError(error);
    return count ?? 0;
  }
}

function sanitizeSearch(value: string): string {
  return value
    .trim()
    .replace(/[,%()]/g, '')
    .slice(0, 100);
}
