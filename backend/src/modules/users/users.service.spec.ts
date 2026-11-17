import { BadRequestException } from '@nestjs/common';
import { UsersRepository } from './repositories/users.repository';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const findById = jest.fn();
  const findPracticeGoal = jest.fn();
  const upsertPracticeGoal = jest.fn();
  const repository = {
    findById,
    findPracticeGoal,
    upsertPracticeGoal,
  } as unknown as UsersRepository;
  const service = new UsersService(repository);

  beforeEach(() => {
    jest.clearAllMocks();
    findById.mockResolvedValue({ id: 'user-1' });
  });

  it('returns non-persisted defaults when the user has no practice goal', async () => {
    findPracticeGoal.mockResolvedValue(null);

    await expect(service.getPracticeGoal('user-1')).resolves.toEqual(
      expect.objectContaining({
        user_id: 'user-1',
        daily_target_seconds: 1800,
        weekly_target_days: 5,
        timezone: 'UTC',
      }),
    );
  });

  it('merges a partial practice goal without resetting other preferences', async () => {
    findPracticeGoal.mockResolvedValue({
      user_id: 'user-1',
      daily_target_seconds: 3600,
      weekly_target_days: 4,
      timezone: 'America/Sao_Paulo',
    });
    upsertPracticeGoal.mockResolvedValue({ user_id: 'user-1' });

    await service.updatePracticeGoal('user-1', { weekly_target_days: 6 });

    expect(upsertPracticeGoal).toHaveBeenCalledWith('user-1', {
      daily_target_seconds: 3600,
      weekly_target_days: 6,
      timezone: 'America/Sao_Paulo',
    });
  });

  it('rejects an invalid IANA timezone', async () => {
    findPracticeGoal.mockResolvedValue(null);

    await expect(
      service.updatePracticeGoal('user-1', { timezone: 'Mars/Olympus' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
