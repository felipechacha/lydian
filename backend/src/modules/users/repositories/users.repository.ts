import { Injectable } from '@nestjs/common';
import { SupabaseAdminClient } from '../../../infra/supabase/supabase-admin.client';
import { throwMappedDatabaseError } from '../../../common/database/database-error.mapper';
import type { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import type { UpdatePracticeGoalDto } from '../dto/update-practice-goal.dto';
import type { UserProfile } from '../entities/user.entity';

export interface PracticeGoal {
  user_id: string;
  daily_target_seconds: number;
  weekly_target_days: number;
  timezone: string;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class UsersRepository {
  constructor(private readonly supabaseAdmin: SupabaseAdminClient) {}

  async findById(id: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabaseAdmin
      .getClient()
      .from('users')
      .select(
        'id,email,display_name,avatar_url,main_instrument,experience_level,created_at,updated_at',
      )
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) throwMappedDatabaseError(error);
    return data;
  }

  async update(id: string, dto: UpdateUserProfileDto): Promise<UserProfile> {
    const { data, error } = await this.supabaseAdmin
      .getClient()
      .from('users')
      .update(dto)
      .eq('id', id)
      .is('deleted_at', null)
      .select(
        'id,email,display_name,avatar_url,main_instrument,experience_level,created_at,updated_at',
      )
      .single();
    if (error) throwMappedDatabaseError(error);
    return data;
  }

  async findPracticeGoal(userId: string): Promise<PracticeGoal | null> {
    const { data, error } = await this.supabaseAdmin
      .getClient()
      .from('user_practice_goals')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throwMappedDatabaseError(error);
    return data;
  }

  async upsertPracticeGoal(
    userId: string,
    dto: UpdatePracticeGoalDto,
  ): Promise<PracticeGoal> {
    const { data, error } = await this.supabaseAdmin
      .getClient()
      .from('user_practice_goals')
      .upsert({ user_id: userId, ...dto }, { onConflict: 'user_id' })
      .select('*')
      .single();
    if (error) throwMappedDatabaseError(error);
    return data;
  }
}
