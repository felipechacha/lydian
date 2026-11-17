import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SongsRepository } from '../songs/repositories/songs.repository';
import type { AddPracticeSongDto } from './dto/add-practice-song.dto';
import type { CreatePracticeSessionDto } from './dto/create-practice-session.dto';
import type { ListPracticeSessionsQueryDto } from './dto/list-practice-sessions-query.dto';
import type { ListPracticeHistoryQueryDto } from './dto/list-practice-history-query.dto';
import type { FinishPracticeSessionDto } from './dto/finish-practice-session.dto';
import type { StartPracticeSessionDto } from './dto/start-practice-session.dto';
import type { UpdatePracticeSessionDto } from './dto/update-practice-session.dto';
import type { UpdatePracticeSongDto } from './dto/update-practice-song.dto';
import { PracticeSessionSongsRepository } from './repositories/practice-session-songs.repository';
import { PracticeSessionsRepository } from './repositories/practice-sessions.repository';
import { TechniquesService } from '../techniques/techniques.service';

@Injectable()
export class PracticeService {
  constructor(
    private readonly sessionsRepository: PracticeSessionsRepository,
    private readonly sessionSongsRepository: PracticeSessionSongsRepository,
    private readonly songsRepository: SongsRepository,
    private readonly techniquesService: TechniquesService,
  ) {}

  findAll(userId: string, query: ListPracticeSessionsQueryDto) {
    return this.sessionsRepository.findAll(userId, query);
  }

  findHistory(userId: string, query: ListPracticeHistoryQueryDto) {
    if (query.from && query.to && new Date(query.from) > new Date(query.to)) {
      throw new BadRequestException('from must be before to');
    }
    return this.sessionsRepository.findHistory(userId, query);
  }

  async findOne(userId: string, id: string) {
    const session = await this.sessionsRepository.findById(id, userId);
    if (!session) throw new NotFoundException('Practice session not found');
    return session;
  }

  create(userId: string, dto: CreatePracticeSessionDto) {
    const normalized = normalizeDuration(dto);
    return this.sessionsRepository.create(userId, normalized);
  }

  async start(userId: string, dto: StartPracticeSessionDto) {
    const song = await this.songsRepository.findById(dto.song_id, userId);
    if (!song) throw new NotFoundException('Song not found');
    await this.techniquesService.assertActiveIds(dto.technique_ids ?? []);
    return this.sessionsRepository.start(userId, dto);
  }

  async finish(
    userId: string,
    sessionId: string,
    dto: FinishPracticeSessionDto,
  ) {
    const current = await this.findOne(userId, sessionId);
    const song = await this.songsRepository.findById(dto.song.song_id, userId);
    if (!song) throw new NotFoundException('Song not found');
    await this.techniquesService.assertActiveIds(dto.song.technique_ids ?? []);
    const normalized = normalizeFinishDuration(current, dto);
    return this.sessionsRepository.finish(userId, sessionId, normalized);
  }

  async update(userId: string, id: string, dto: UpdatePracticeSessionDto) {
    const current = await this.findOne(userId, id);
    const normalized = normalizeUpdateDuration(current, dto);
    return this.sessionsRepository.update(id, userId, normalized);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.sessionsRepository.softDelete(id, userId);
    return { id };
  }

  async addSong(userId: string, sessionId: string, dto: AddPracticeSongDto) {
    await this.findOne(userId, sessionId);
    const song = await this.songsRepository.findById(dto.song_id, userId);
    if (!song) throw new NotFoundException('Song not found');
    await this.techniquesService.assertActiveIds(dto.technique_ids ?? []);
    return this.sessionSongsRepository.add(sessionId, dto);
  }

  async updateSong(
    userId: string,
    sessionId: string,
    songId: string,
    dto: UpdatePracticeSongDto,
  ) {
    await this.assertOwnedResources(userId, sessionId, songId);
    if (dto.technique_ids) {
      await this.techniquesService.assertActiveIds(dto.technique_ids);
    }
    return this.sessionSongsRepository.update(sessionId, songId, dto);
  }

  async removeSong(userId: string, sessionId: string, songId: string) {
    await this.assertOwnedResources(userId, sessionId, songId);
    await this.sessionSongsRepository.remove(sessionId, songId);
    return { practice_session_id: sessionId, song_id: songId };
  }

  private async assertOwnedResources(
    userId: string,
    sessionId: string,
    songId: string,
  ) {
    await this.findOne(userId, sessionId);
    const song = await this.songsRepository.findById(songId, userId);
    if (!song) throw new NotFoundException('Song not found');
  }
}

function normalizeUpdateDuration(
  current: {
    started_at: string;
    ended_at: string | null;
    duration_seconds?: number | null;
  },
  dto: UpdatePracticeSessionDto,
): UpdatePracticeSessionDto {
  const startedAt = dto.started_at ?? current.started_at;
  const endedAt = dto.ended_at ?? current.ended_at;
  if (!endedAt) return normalizeExplicitDuration(dto);
  const startTime = new Date(startedAt).getTime();
  const endTime = new Date(endedAt).getTime();
  if (endTime < startTime) {
    throw new BadRequestException('ended_at must be after started_at');
  }
  const durationSeconds =
    dto.duration_seconds ?? Math.floor((endTime - startTime) / 1000);
  return {
    ...dto,
    duration_seconds: durationSeconds,
    duration_minutes: dto.duration_minutes ?? Math.floor(durationSeconds / 60),
  };
}

function normalizeDuration<T extends CreatePracticeSessionDto>(dto: T): T {
  if (!dto.started_at || !dto.ended_at) return normalizeExplicitDuration(dto);
  const startedAt = new Date(dto.started_at).getTime();
  const endedAt = new Date(dto.ended_at).getTime();
  if (endedAt < startedAt) {
    throw new BadRequestException('ended_at must be after started_at');
  }
  const durationSeconds =
    dto.duration_seconds ?? Math.floor((endedAt - startedAt) / 1000);
  return {
    ...dto,
    duration_seconds: durationSeconds,
    duration_minutes: dto.duration_minutes ?? Math.floor(durationSeconds / 60),
  };
}

function normalizeExplicitDuration<T extends CreatePracticeSessionDto>(
  dto: T,
): T {
  if (dto.duration_seconds !== undefined) {
    return {
      ...dto,
      duration_minutes: Math.floor(dto.duration_seconds / 60),
    };
  }
  if (dto.duration_minutes !== undefined) {
    return {
      ...dto,
      duration_seconds: dto.duration_minutes * 60,
    };
  }
  return dto;
}

function normalizeFinishDuration(
  current: { started_at: string },
  dto: FinishPracticeSessionDto,
): FinishPracticeSessionDto & { ended_at: string; duration_seconds: number } {
  const endedAt = dto.ended_at ?? new Date().toISOString();
  const startTime = new Date(current.started_at).getTime();
  const endTime = new Date(endedAt).getTime();
  if (endTime < startTime) {
    throw new BadRequestException('ended_at must be after started_at');
  }
  const elapsedSeconds = Math.floor((endTime - startTime) / 1000);
  const pausedSeconds = dto.paused_seconds ?? 0;
  if (pausedSeconds > elapsedSeconds) {
    throw new BadRequestException('paused_seconds cannot exceed elapsed time');
  }
  if (
    dto.duration_seconds !== undefined &&
    dto.duration_seconds > elapsedSeconds - pausedSeconds
  ) {
    throw new BadRequestException(
      'duration_seconds cannot exceed active elapsed time',
    );
  }
  if (
    dto.song.seconds_practiced !== undefined &&
    dto.song.seconds_practiced >
      (dto.duration_seconds ?? elapsedSeconds - pausedSeconds)
  ) {
    throw new BadRequestException(
      'song.seconds_practiced cannot exceed session duration',
    );
  }
  return {
    ...dto,
    ended_at: endedAt,
    duration_seconds: dto.duration_seconds ?? elapsedSeconds - pausedSeconds,
  };
}
