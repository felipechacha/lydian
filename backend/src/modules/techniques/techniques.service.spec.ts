import { BadRequestException } from '@nestjs/common';
import { TechniquesRepository } from './repositories/techniques.repository';
import { TechniquesService } from './techniques.service';

describe('TechniquesService', () => {
  const countActiveByIds = jest.fn();
  const repository = {
    countActiveByIds,
  } as unknown as TechniquesRepository;
  const service = new TechniquesService(repository);

  beforeEach(() => jest.clearAllMocks());

  it('accepts an empty technique selection', async () => {
    await expect(service.assertActiveIds([])).resolves.toBeUndefined();
    expect(countActiveByIds).not.toHaveBeenCalled();
  });

  it('rejects unknown or inactive techniques', async () => {
    countActiveByIds.mockResolvedValue(1);

    await expect(
      service.assertActiveIds(['technique-1', 'technique-2']),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
