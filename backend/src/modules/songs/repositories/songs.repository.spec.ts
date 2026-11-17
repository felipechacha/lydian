import { SupabaseAdminClient } from '../../../infra/supabase/supabase-admin.client';
import { SongsRepository } from './songs.repository';

describe('SongsRepository', () => {
  const maybeSingle = jest.fn();
  const isDeleted = jest.fn(() => ({ maybeSingle }));
  const eqUser = jest.fn(() => ({ is: isDeleted }));
  const eqId = jest.fn(() => ({ eq: eqUser }));
  const select = jest.fn(() => ({ eq: eqId }));
  const from = jest.fn(() => ({ select }));
  const supabase = {
    getClient: () => ({ from }),
  } as unknown as SupabaseAdminClient;
  const repository = new SongsRepository(supabase);

  beforeEach(() => {
    jest.clearAllMocks();
    maybeSingle.mockResolvedValue({ data: null, error: null });
  });

  it('filters a song by both resource id and user id', async () => {
    await repository.findById('song-1', 'user-1');
    expect(from).toHaveBeenCalledWith('songs');
    expect(eqId).toHaveBeenCalledWith('id', 'song-1');
    expect(eqUser).toHaveBeenCalledWith('user_id', 'user-1');
    expect(isDeleted).toHaveBeenCalledWith('deleted_at', null);
  });
});
