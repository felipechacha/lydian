import { BadRequestException } from '@nestjs/common';
import { PracticeService } from './practice.service';
import { PracticeSessionsRepository } from './repositories/practice-sessions.repository';
import { PracticeSessionSongsRepository } from './repositories/practice-session-songs.repository';
import { SongsRepository } from '../songs/repositories/songs.repository';
import { TechniquesService } from '../techniques/techniques.service';

describe('PracticeService', () => {
  const create = jest.fn();
  const start = jest.fn();
  const finish = jest.fn();
  const findById = jest.fn();
  const sessions = {
    create,
    start,
    finish,
    findById,
  } as unknown as PracticeSessionsRepository;
  const sessionSongs = {} as PracticeSessionSongsRepository;
  const findSongById = jest.fn();
  const songs = {
    findById: findSongById,
  } as unknown as SongsRepository;
  const assertActiveIds = jest.fn();
  const techniques = {
    assertActiveIds,
  } as unknown as TechniquesService;
  const service = new PracticeService(
    sessions,
    sessionSongs,
    songs,
    techniques,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    assertActiveIds.mockResolvedValue(undefined);
  });

  it('calculates duration from start and end times', async () => {
    create.mockResolvedValue({ id: 'session-1' });
    await service.create('user-1', {
      started_at: '2026-07-28T10:00:00.000Z',
      ended_at: '2026-07-28T10:45:00.000Z',
    });
    expect(create).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        duration_minutes: 45,
        duration_seconds: 2700,
      }),
    );
  });

  it('rejects an end time before the start time', () => {
    expect(() =>
      service.create('user-1', {
        started_at: '2026-07-28T11:00:00.000Z',
        ended_at: '2026-07-28T10:00:00.000Z',
      }),
    ).toThrow(BadRequestException);
  });

  it('starts a session only after validating song ownership and techniques', async () => {
    const dto = {
      song_id: 'song-1',
      technique_ids: ['11111111-1111-4111-8111-111111111111'],
    };
    findSongById.mockResolvedValue({ id: 'song-1' });
    start.mockResolvedValue({ id: 'session-1' });

    await expect(service.start('user-1', dto)).resolves.toEqual({
      id: 'session-1',
    });
    expect(findSongById).toHaveBeenCalledWith('song-1', 'user-1');
    expect(assertActiveIds).toHaveBeenCalledWith(dto.technique_ids);
    expect(start).toHaveBeenCalledWith('user-1', dto);
  });

  it('normalizes a finished session to active elapsed seconds', async () => {
    findById.mockResolvedValue({
      id: 'session-1',
      started_at: '2026-09-24T10:00:00.000Z',
    });
    findSongById.mockResolvedValue({ id: 'song-1' });
    finish.mockResolvedValue({
      id: 'session-1',
      ended_at: '2026-09-24T10:30:00.000Z',
    });

    await service.finish('user-1', 'session-1', {
      ended_at: '2026-09-24T10:30:00.000Z',
      paused_seconds: 120,
      song: { song_id: 'song-1', seconds_practiced: 1680 },
    });

    expect(finish).toHaveBeenCalledWith(
      'user-1',
      'session-1',
      expect.objectContaining({
        duration_seconds: 1680,
        paused_seconds: 120,
      }),
    );
  });

  it('rejects practiced song time above the session duration', async () => {
    findById.mockResolvedValue({
      id: 'session-1',
      started_at: '2026-09-24T10:00:00.000Z',
    });
    findSongById.mockResolvedValue({ id: 'song-1' });

    await expect(
      service.finish('user-1', 'session-1', {
        ended_at: '2026-09-24T10:10:00.000Z',
        song: { song_id: 'song-1', seconds_practiced: 601 },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
