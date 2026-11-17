import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateSongDto } from './dto/create-song.dto';
import type { ListSongsQueryDto } from './dto/list-songs-query.dto';
import type { UpdateSongDto } from './dto/update-song.dto';
import type { UpdateSongTechniquesDto } from './dto/update-song-techniques.dto';
import { SongsRepository } from './repositories/songs.repository';
import { TechniquesService } from '../techniques/techniques.service';

@Injectable()
export class SongsService {
  constructor(
    private readonly songsRepository: SongsRepository,
    private readonly techniquesService: TechniquesService,
  ) {}

  findAll(userId: string, query: ListSongsQueryDto) {
    return this.songsRepository.findAll(userId, query);
  }

  async findOne(userId: string, id: string) {
    const song = await this.songsRepository.findById(id, userId);
    if (!song) throw new NotFoundException('Song not found');
    return song;
  }

  create(userId: string, dto: CreateSongDto) {
    return this.songsRepository.create(userId, dto);
  }

  async update(userId: string, id: string, dto: UpdateSongDto) {
    await this.findOne(userId, id);
    return this.songsRepository.update(id, userId, dto);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.songsRepository.softDelete(id, userId);
    return { id };
  }

  async updateTechniques(
    userId: string,
    id: string,
    dto: UpdateSongTechniquesDto,
  ) {
    await this.findOne(userId, id);
    await this.techniquesService.assertActiveIds(dto.technique_ids);
    await this.songsRepository.replaceTechniques(id, dto.technique_ids);
    return this.findOne(userId, id);
  }
}
