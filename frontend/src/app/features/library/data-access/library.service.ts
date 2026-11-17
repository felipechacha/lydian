import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateSongRequest,
  DeletedSongDataResponse,
  ListSongsQuery,
  SongDataResponse,
  SongsListResponse,
  UpdateSongRequest,
  UpdateSongTechniquesRequest,
} from '../models/add-music.models';

@Injectable({
  providedIn: 'root',
})
export class LibraryService {
  private readonly _httpClient = inject(HttpClient);
  private readonly _songsApiUrl = `${environment.apiUrl}/songs`;

  public getMusicLibrary(query: ListSongsQuery = {}): Observable<SongsListResponse> {
    const search = query.search?.trim();

    return this._httpClient.get<SongsListResponse>(this._songsApiUrl, {
      params: {
        ...(query.page !== undefined ? { page: query.page } : {}),
        ...(query.limit !== undefined ? { limit: query.limit } : {}),
        ...(query.sort_by ? { sort_by: query.sort_by } : {}),
        ...(query.sort_order ? { sort_order: query.sort_order } : {}),
        ...(search ? { search } : {}),
      },
    });
  }

  public getMusicDetails(musicId: string): Observable<SongDataResponse> {
    return this._httpClient.get<SongDataResponse>(`${this._songsApiUrl}/${musicId}`);
  }

  public createMusic(payload: CreateSongRequest): Observable<SongDataResponse> {
    return this._httpClient.post<SongDataResponse>(this._songsApiUrl, payload);
  }

  public updateMusic(musicId: string, payload: UpdateSongRequest): Observable<SongDataResponse> {
    return this._httpClient.patch<SongDataResponse>(`${this._songsApiUrl}/${musicId}`, payload);
  }

  public updateMusicTechniques(
    musicId: string,
    payload: UpdateSongTechniquesRequest,
  ): Observable<SongDataResponse> {
    return this._httpClient.patch<SongDataResponse>(
      `${this._songsApiUrl}/${musicId}/techniques`,
      payload,
    );
  }

  public deleteMusic(musicId: string): Observable<DeletedSongDataResponse> {
    return this._httpClient.delete<DeletedSongDataResponse>(`${this._songsApiUrl}/${musicId}`);
  }
}
