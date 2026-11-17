import { SetlistsRepository } from './setlists.repository';
import { SupabaseAdminClient } from '../../../infra/supabase/supabase-admin.client';
import { ListSetlistsQueryDto } from '../dto/list-setlists-query.dto';

describe('Setlist summaries', () => {
  it('keeps API totals, pagination, search and sort in a single database request', async () => {
    const response = { data: [], meta: { page: 2, limit: 6, total: 7 } };
    const rpc = jest.fn().mockResolvedValue({ data: response, error: null });
    const repository = new SetlistsRepository({
      getClient: () => ({ rpc }),
    } as unknown as SupabaseAdminClient);
    const query = Object.assign(new ListSetlistsQueryDto(), {
      page: 2,
      limit: 6,
      search: ' %Jazz_ ',
      sort_by: 'name',
      sort_order: 'asc',
    });
    expect(await repository.findAll('user-one', query)).toEqual(response);
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith('list_setlist_summaries', {
      p_user_id: 'user-one',
      p_page: 2,
      p_limit: 6,
      p_search: 'Jazz',
      p_sort_by: 'name',
      p_sort_order: 'asc',
    });
  });
});
