import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateSetlistRequest,
  AddSongToSetlistRequest,
  DeletedSetlistDataResponse,
  SetlistDataResponse,
  SetlistDetailDataResponse,
  SetlistSongDeletedDataResponse,
  SetlistSongDataResponse,
  SetlistsListResponse,
  ListSetlistsQuery,
  UpdateSetlistRequest,
  UpdateSetlistSongRequest,
} from '../models/setlist.models';

@Injectable({
  providedIn: 'root',
})
export class SetlistService {
  private readonly _httpClient = inject(HttpClient);
  private readonly _setlistsApiUrl = `${environment.apiUrl}/setlists`;

  public getSetlists(query: ListSetlistsQuery = {}): Observable<SetlistsListResponse> {
    const search = query.search?.trim();

    return this._httpClient.get<SetlistsListResponse>(this._setlistsApiUrl, {
      params: {
        ...(query.page !== undefined ? { page: query.page } : {}),
        ...(query.limit !== undefined ? { limit: query.limit } : {}),
        ...(query.sort_by ? { sort_by: query.sort_by } : {}),
        ...(query.sort_order ? { sort_order: query.sort_order } : {}),
        ...(search ? { search } : {}),
      },
    });
  }

  public reorderSongs(
    setlistId: string,
    songIds: readonly string[],
  ): Observable<DeletedSetlistDataResponse> {
    return this._httpClient.patch<DeletedSetlistDataResponse>(
      `${this._setlistsApiUrl}/${setlistId}/songs/order`,
      { song_ids: songIds },
    );
  }

  public createSetlist(payload: CreateSetlistRequest): Observable<SetlistDataResponse> {
    return this._httpClient.post<SetlistDataResponse>(this._setlistsApiUrl, payload);
  }

  public updateSetlist(
    setlistId: string,
    payload: UpdateSetlistRequest,
  ): Observable<SetlistDataResponse> {
    return this._httpClient.patch<SetlistDataResponse>(
      `${this._setlistsApiUrl}/${setlistId}`,
      payload,
    );
  }

  public getSetlistDetails(setlistId: string): Observable<SetlistDetailDataResponse> {
    return this._httpClient.get<SetlistDetailDataResponse>(`${this._setlistsApiUrl}/${setlistId}`);
  }

  public addSong(
    setlistId: string,
    payload: AddSongToSetlistRequest,
  ): Observable<SetlistSongDataResponse> {
    return this._httpClient.post<SetlistSongDataResponse>(
      `${this._setlistsApiUrl}/${setlistId}/songs`,
      payload,
    );
  }

  public removeSong(setlistId: string, songId: string): Observable<SetlistSongDeletedDataResponse> {
    return this._httpClient.delete<SetlistSongDeletedDataResponse>(
      `${this._setlistsApiUrl}/${setlistId}/songs/${songId}`,
    );
  }

  public updateSong(
    setlistId: string,
    songId: string,
    payload: UpdateSetlistSongRequest,
  ): Observable<SetlistSongDataResponse> {
    return this._httpClient.patch<SetlistSongDataResponse>(
      `${this._setlistsApiUrl}/${setlistId}/songs/${songId}`,
      payload,
    );
  }

  public deleteSetlist(setlistId: string): Observable<DeletedSetlistDataResponse> {
    return this._httpClient.delete<DeletedSetlistDataResponse>(
      `${this._setlistsApiUrl}/${setlistId}`,
    );
  }
}
