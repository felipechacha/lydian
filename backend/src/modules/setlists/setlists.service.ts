import { Injectable, NotFoundException } from '@nestjs/common';
import type { AddSongToSetlistDto } from './dto/add-song-to-setlist.dto';
import type { CreateSetlistDto } from './dto/create-setlist.dto';
import type { ListSetlistsQueryDto } from './dto/list-setlists-query.dto';
import type { UpdateSetlistSongDto } from './dto/update-setlist-song.dto';
import type { UpdateSetlistDto } from './dto/update-setlist.dto';
import { SongsRepository } from '../songs/repositories/songs.repository';
import { SetlistSongsRepository } from './repositories/setlist-songs.repository';
import { SetlistsRepository } from './repositories/setlists.repository';

@Injectable()
export class SetlistsService {
  constructor(
    private readonly setlistsRepository: SetlistsRepository,
    private readonly setlistSongsRepository: SetlistSongsRepository,
    private readonly songsRepository: SongsRepository,
  ) {}

  findAll(userId: string, query: ListSetlistsQueryDto) {
    return this.setlistsRepository.findAll(userId, query);
  }

  async reorderSongs(userId: string, setlistId: string, songIds: string[]) {
    await this.setlistSongsRepository.reorder(userId, setlistId, songIds);
    return { id: setlistId };
  }

  async findOne(userId: string, id: string) {
    const setlist = await this.setlistsRepository.findById(id, userId);
    if (!setlist) throw new NotFoundException('Setlist not found');
    return setlist;
  }

  create(userId: string, dto: CreateSetlistDto) {
    return this.setlistsRepository.create(userId, dto);
  }

  async update(userId: string, id: string, dto: UpdateSetlistDto) {
    await this.findOne(userId, id);
    return this.setlistsRepository.update(id, userId, dto);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.setlistsRepository.softDelete(id, userId);
    return { id };
  }

  async addSong(userId: string, setlistId: string, dto: AddSongToSetlistDto) {
    await this.findOne(userId, setlistId);
    const song = await this.songsRepository.findById(dto.song_id, userId);
    if (!song) throw new NotFoundException('Song not found');
    const position =
      dto.position ??
      (await this.setlistSongsRepository.nextPosition(setlistId));
    return this.setlistSongsRepository.add(
      setlistId,
      dto.song_id,
      position,
      dto.notes,
    );
  }

  async updateSong(
    userId: string,
    setlistId: string,
    songId: string,
    dto: UpdateSetlistSongDto,
  ) {
    await this.findOne(userId, setlistId);
    const song = await this.songsRepository.findById(songId, userId);
    if (!song) throw new NotFoundException('Song not found');
    return this.setlistSongsRepository.update(setlistId, songId, dto);
  }

  async removeSong(userId: string, setlistId: string, songId: string) {
    await this.findOne(userId, setlistId);
    const song = await this.songsRepository.findById(songId, userId);
    if (!song) throw new NotFoundException('Song not found');
    await this.setlistSongsRepository.remove(setlistId, songId);
    return { setlist_id: setlistId, song_id: songId };
  }
}
