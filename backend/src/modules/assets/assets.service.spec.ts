import { ForbiddenException } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsRepository } from './repositories/assets.repository';

describe('AssetsService', () => {
  const createReadUrl = jest.fn();
  const repository = { createReadUrl } as unknown as AssetsRepository;
  const service = new AssetsService(repository);

  beforeEach(() => jest.clearAllMocks());

  it('rejects signed read URLs for another user path', () => {
    expect(() =>
      service.createReadUrl('user-1', 'user-2/avatar/file.png'),
    ).toThrow(ForbiddenException);
  });

  it('allows signed read URLs only inside the user folder', async () => {
    createReadUrl.mockResolvedValue({ signedUrl: 'https://signed.example' });
    await service.createReadUrl('user-1', 'user-1/avatar/file.png');
    expect(createReadUrl).toHaveBeenCalledWith('user-1/avatar/file.png');
  });
});
