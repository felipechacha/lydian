import { NotFoundException } from '@nestjs/common';
import { SongsService } from './songs.service';
import { SongsRepository } from './repositories/songs.repository';
import { TechniquesService } from '../techniques/techniques.service';

describe('SongsService', () => {
  const findById = jest.fn();
  const softDelete = jest.fn();
  const repository = {
    findById,
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    softDelete,
  } as unknown as SongsRepository;
  const techniques = {
    assertActiveIds: jest.fn(),
  } as unknown as TechniquesService;
  const service = new SongsService(repository, techniques);

  beforeEach(() => jest.clearAllMocks());

  it('returns not found when the owned song does not exist', async () => {
    findById.mockResolvedValue(null);
    await expect(service.findOne('user-1', 'song-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(findById).toHaveBeenCalledWith('song-1', 'user-1');
  });

  it('checks ownership before soft deleting', async () => {
    findById.mockResolvedValue({ id: 'song-1' });
    softDelete.mockResolvedValue(undefined);
    await service.remove('user-1', 'song-1');
    expect(softDelete).toHaveBeenCalledWith('song-1', 'user-1');
  });
});
