import { NotFoundException } from '@nestjs/common';
import { PracticeSummaryRepository } from './practice-summary.repository';
import { SupabaseAdminClient } from '../../../infra/supabase/supabase-admin.client';

describe('PracticeSummaryRepository', () => {
  const rpc = jest.fn();
  const repository = new PracticeSummaryRepository({
    getClient: () => ({ rpc }),
  } as unknown as SupabaseAdminClient);
  it('passes authenticated ownership to one database aggregate', async () => {
    rpc.mockResolvedValue({
      data: { timezone: 'UTC', totals: { session_count: 1200 } },
      error: null,
    });
    expect(await repository.getSummary('user-one')).toEqual({
      timezone: 'UTC',
      totals: { session_count: 1200 },
    });
    expect(rpc).toHaveBeenCalledWith('get_practice_summary', {
      p_user_id: 'user-one',
    });
  });
  it('maps missing profiles to a safe 404', async () => {
    rpc.mockResolvedValue({
      data: null,
      error: { code: 'P0002', message: 'private' },
    });
    await expect(repository.getSummary('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
