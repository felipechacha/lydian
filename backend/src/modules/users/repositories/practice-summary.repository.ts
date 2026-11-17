import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SupabaseAdminClient } from '../../../infra/supabase/supabase-admin.client';
import { throwMappedDatabaseError } from '../../../common/database/database-error.mapper';
import type { PracticeSummaryResponseDto } from '../dto/practice-summary-response.dto';

@Injectable()
export class PracticeSummaryRepository {
  constructor(private readonly supabaseAdmin: SupabaseAdminClient) {}

  async getSummary(userId: string): Promise<PracticeSummaryResponseDto> {
    const { data, error } = await this.supabaseAdmin
      .getClient()
      .rpc('get_practice_summary', { p_user_id: userId });
    if (error) throwMappedDatabaseError(error);
    if (!data)
      throw new InternalServerErrorException('Unable to read practice summary');
    return data as unknown as PracticeSummaryResponseDto;
  }
}
