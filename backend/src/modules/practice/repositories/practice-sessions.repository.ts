import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseAdminClient } from '../../../infra/supabase/supabase-admin.client';
import { throwMappedDatabaseError } from '../../../common/database/database-error.mapper';
import type { PaginatedResponse } from '../../../common/dto/pagination-query.dto';
import type { CreatePracticeSessionDto } from '../dto/create-practice-session.dto';
import type { ListPracticeSessionsQueryDto } from '../dto/list-practice-sessions-query.dto';
import type { ListPracticeHistoryQueryDto } from '../dto/list-practice-history-query.dto';
import type { FinishPracticeSessionDto } from '../dto/finish-practice-session.dto';
import type { StartPracticeSessionDto } from '../dto/start-practice-session.dto';
import type { UpdatePracticeSessionDto } from '../dto/update-practice-session.dto';
import type { PracticeSession } from '../entities/practice-session.entity';

@Injectable()
export class PracticeSessionsRepository {
  constructor(private readonly supabaseAdmin: SupabaseAdminClient) {}

  async findAll(
    userId: string,
    query: ListPracticeSessionsQueryDto,
  ): Promise<PaginatedResponse<PracticeSession>> {
    const from = (query.page - 1) * query.limit;
    let request = this.supabaseAdmin
      .getClient()
      .from('practice_sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .is('deleted_at', null);
    if (query.search?.trim()) {
      const search = query.search
        .trim()
        .replace(/[,%()]/g, '')
        .slice(0, 100);
      request = request.or(
        `title.ilike.%${search}%,focus_area.ilike.%${search}%`,
      );
    }
    const { data, count, error } = await request
      .order(query.sort_by, { ascending: query.sort_order === 'asc' })
      .range(from, from + query.limit - 1);
    if (error) throwMappedDatabaseError(error);
    return {
      data: data ?? [],
      meta: { page: query.page, limit: query.limit, total: count ?? 0 },
    };
  }

  async findById(id: string, userId: string): Promise<PracticeSession | null> {
    const { data, error } = await this.supabaseAdmin
      .getClient()
      .from('practice_sessions')
      .select(
        '*,practice_session_songs(*,songs(*,song_techniques(*,techniques(*))),practice_session_techniques(*,techniques(*)))',
      )
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) throwMappedDatabaseError(error);
    return data;
  }

  async findHistory(
    userId: string,
    query: ListPracticeHistoryQueryDto,
  ): Promise<PaginatedResponse<PracticeSession>> {
    const from = (query.page - 1) * query.limit;
    let request = this.supabaseAdmin
      .getClient()
      .from('practice_sessions')
      .select(
        '*,practice_session_songs!inner(*,songs(*,song_techniques(*,techniques(*))),practice_session_techniques(*,techniques(*)))',
        { count: 'exact' },
      )
      .eq('user_id', userId)
      .is('deleted_at', null)
      .not('ended_at', 'is', null);

    if (query.song_id) {
      request = request.eq('practice_session_songs.song_id', query.song_id);
    }
    if (query.from) request = request.gte('started_at', query.from);
    if (query.to) request = request.lte('started_at', query.to);
    if (query.search?.trim()) {
      const search = sanitizeSearch(query.search);
      request = request.or(
        `title.ilike.%${search}%,focus_area.ilike.%${search}%`,
      );
    }

    const { data, count, error } = await request
      .order(query.sort_by, { ascending: query.sort_order === 'asc' })
      .range(from, from + query.limit - 1);
    if (error) throwMappedDatabaseError(error);
    return {
      data: (data ?? []) as unknown as PracticeSession[],
      meta: { page: query.page, limit: query.limit, total: count ?? 0 },
    };
  }

  async start(
    userId: string,
    dto: StartPracticeSessionDto,
  ): Promise<PracticeSession> {
    const { data: sessionId, error } = await this.supabaseAdmin
      .getClient()
      .rpc('start_practice_session', {
        p_user_id: userId,
        p_song_id: dto.song_id,
        p_title: dto.title,
        p_started_at: dto.started_at,
        p_notes: dto.notes,
        p_mood: dto.mood,
        p_focus_area: dto.focus_area,
        p_practiced_bpm: dto.practiced_bpm,
        p_technique_ids: dto.technique_ids ?? [],
      });
    if (error) throwMappedDatabaseError(error);
    const session = await this.findById(sessionId, userId);
    if (!session) {
      throw new InternalServerErrorException(
        'Created practice session was not found',
      );
    }
    return session;
  }

  async finish(
    userId: string,
    sessionId: string,
    dto: FinishPracticeSessionDto & {
      ended_at: string;
      duration_seconds: number;
    },
  ): Promise<PracticeSession> {
    const { error } = await this.supabaseAdmin
      .getClient()
      .rpc('finish_practice_session', {
        p_user_id: userId,
        p_session_id: sessionId,
        p_song_id: dto.song.song_id,
        p_ended_at: dto.ended_at,
        p_duration_seconds: dto.duration_seconds,
        p_paused_seconds: dto.paused_seconds ?? 0,
        p_notes: dto.notes,
        p_mood: dto.mood,
        p_focus_area: dto.focus_area,
        p_song_notes: dto.song.notes,
        p_seconds_practiced: dto.song.seconds_practiced,
        p_practiced_bpm: dto.song.practiced_bpm,
        p_progress_rating: dto.song.progress_rating,
        p_repetitions: dto.song.repetitions,
        p_quality_rating: dto.song.quality_rating,
        p_technique_ids: dto.song.technique_ids,
      });
    if (error) throwMappedDatabaseError(error);
    const session = await this.findById(sessionId, userId);
    if (!session) {
      throw new InternalServerErrorException(
        'Finished practice session was not found',
      );
    }
    return session;
  }

  async create(
    userId: string,
    dto: CreatePracticeSessionDto,
  ): Promise<PracticeSession> {
    const { data, error } = await this.supabaseAdmin
      .getClient()
      .from('practice_sessions')
      .insert({ ...dto, user_id: userId })
      .select('*')
      .single();
    if (error) throwMappedDatabaseError(error);
    return data;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdatePracticeSessionDto,
  ): Promise<PracticeSession> {
    const { data, error } = await this.supabaseAdmin
      .getClient()
      .from('practice_sessions')
      .update(dto)
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .select('*')
      .single();
    if (error) throwMappedDatabaseError(error);
    return data;
  }

  async softDelete(id: string, userId: string): Promise<void> {
    const { error } = await this.supabaseAdmin
      .getClient()
      .from('practice_sessions')
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
