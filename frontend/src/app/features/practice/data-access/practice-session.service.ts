import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AddPracticeSessionSongRequest,
  CreatePracticeSessionRequest,
  DeletedPracticeSessionDataResponse,
  FinishPracticeSessionRequest,
  ListPracticeHistoryQuery,
  ListPracticeSessionsQuery,
  PracticeHistoryDataResponse,
  PracticeSessionDataResponse,
  PracticeSessionHistoryItem,
  PracticeSessionMutationDataResponse,
  PracticeSessionsDataResponse,
  PracticeSessionSongDataResponse,
  StartPracticeSessionRequest,
  UpdatePracticeSessionRequest,
  UpdatePracticeSessionSongRequest,
} from '../models/practice-session.models';

@Injectable({
  providedIn: 'root',
})
export class PracticeSessionService {
  private readonly _httpClient = inject(HttpClient);
  private readonly _practiceSessionsApiUrl = `${environment.apiUrl}/practice-sessions`;

  public listPracticeSessions(
    query: ListPracticeSessionsQuery = {},
  ): Observable<PracticeSessionsDataResponse> {
    return this._httpClient.get<PracticeSessionsDataResponse>(this._practiceSessionsApiUrl, {
      params: {
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        sort_by: query.sort_by ?? 'started_at',
        sort_order: query.sort_order ?? 'desc',
        ...(query.search?.trim() ? { search: query.search.trim() } : {}),
      },
    });
  }

  public getPracticeSession(sessionId: string): Observable<PracticeSessionDataResponse> {
    return this._httpClient.get<PracticeSessionDataResponse>(
      `${this._practiceSessionsApiUrl}/${sessionId}`,
    );
  }

  public getPracticeHistory(
    query: ListPracticeHistoryQuery = {},
  ): Observable<PracticeHistoryDataResponse> {
    return this._httpClient.get<PracticeHistoryDataResponse>(
      `${this._practiceSessionsApiUrl}/history`,
      {
        params: {
          page: query.page ?? 1,
          limit: query.limit ?? 20,
          sort_by: query.sort_by ?? 'started_at',
          sort_order: query.sort_order ?? 'desc',
          ...(query.search?.trim() ? { search: query.search.trim() } : {}),
          ...(query.song_id ? { song_id: query.song_id } : {}),
          ...(query.from ? { from: query.from } : {}),
          ...(query.to ? { to: query.to } : {}),
        },
      },
    );
  }

  public getRecentSessionsForSong(
    songId: string,
    limit = 20,
  ): Observable<readonly PracticeSessionHistoryItem[]> {
    return this.getPracticeHistory({
      page: 1,
      limit,
      song_id: songId,
      sort_by: 'started_at',
      sort_order: 'desc',
    }).pipe(map((response) => this._createHistoryItems(response)));
  }

  public getRecentPracticeSessions(limit = 20): Observable<readonly PracticeSessionHistoryItem[]> {
    return this.getPracticeHistory({
      page: 1,
      limit,
      sort_by: 'started_at',
      sort_order: 'desc',
    }).pipe(map((response) => this._createHistoryItems(response)));
  }

  public createPracticeSession(
    payload: CreatePracticeSessionRequest,
  ): Observable<PracticeSessionMutationDataResponse> {
    return this._httpClient.post<PracticeSessionMutationDataResponse>(
      this._practiceSessionsApiUrl,
      payload,
    );
  }

  public startPracticeSession(
    payload: StartPracticeSessionRequest,
  ): Observable<PracticeSessionDataResponse> {
    return this._httpClient.post<PracticeSessionDataResponse>(
      `${this._practiceSessionsApiUrl}/start`,
      payload,
    );
  }

  public finishPracticeSession(
    sessionId: string,
    payload: FinishPracticeSessionRequest,
  ): Observable<PracticeSessionDataResponse> {
    return this._httpClient.post<PracticeSessionDataResponse>(
      `${this._practiceSessionsApiUrl}/${sessionId}/finish`,
      payload,
    );
  }

  public addSong(
    sessionId: string,
    payload: AddPracticeSessionSongRequest,
  ): Observable<PracticeSessionSongDataResponse> {
    return this._httpClient.post<PracticeSessionSongDataResponse>(
      `${this._practiceSessionsApiUrl}/${sessionId}/songs`,
      payload,
    );
  }

  public updatePracticeSession(
    sessionId: string,
    payload: UpdatePracticeSessionRequest,
  ): Observable<PracticeSessionMutationDataResponse> {
    return this._httpClient.patch<PracticeSessionMutationDataResponse>(
      `${this._practiceSessionsApiUrl}/${sessionId}`,
      payload,
    );
  }

  public updateSong(
    sessionId: string,
    songId: string,
    payload: UpdatePracticeSessionSongRequest,
  ): Observable<PracticeSessionSongDataResponse> {
    return this._httpClient.patch<PracticeSessionSongDataResponse>(
      `${this._practiceSessionsApiUrl}/${sessionId}/songs/${songId}`,
      payload,
    );
  }

  public deletePracticeSession(sessionId: string): Observable<DeletedPracticeSessionDataResponse> {
    return this._httpClient.delete<DeletedPracticeSessionDataResponse>(
      `${this._practiceSessionsApiUrl}/${sessionId}`,
    );
  }

  private _createHistoryItems(
    response: PracticeHistoryDataResponse,
  ): readonly PracticeSessionHistoryItem[] {
    return response.data
      .filter((session) => session.ended_at !== null)
      .map((session, index) => ({
        session,
        sequence: Math.max(
          1,
          response.meta.total - (response.meta.page - 1) * response.meta.limit - index,
        ),
      }));
  }
}
