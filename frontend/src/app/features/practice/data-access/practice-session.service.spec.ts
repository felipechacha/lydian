import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { PracticeSessionService } from './practice-session.service';

describe('PracticeSessionService', () => {
  let service: PracticeSessionService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(PracticeSessionService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should retrieve one practice session by its UUID', () => {
    const sessionId = '6dd1df66-a088-4a5e-9411-b1e881359311';

    service.getPracticeSession(sessionId).subscribe((response) => {
      expect(response.data.id).toBe(sessionId);
      expect(response.data.practice_session_songs[0].songs.title).toBe('Enter Sandman');
    });

    const request = httpTestingController.expectOne(
      `${environment.apiUrl}/practice-sessions/${sessionId}`,
    );

    expect(request.request.method).toBe('GET');

    request.flush({
      data: {
        id: sessionId,
        user_id: 'b06dce0f-3074-4db3-86c2-dd7365237313',
        title: 'Treino de riffs',
        started_at: '2026-08-20T18:00:00.000Z',
        ended_at: null,
        duration_minutes: 42,
        notes: 'Manter a dinâmica.',
        mood: 'focused',
        focus_area: 'Palm mute',
        created_at: '2026-08-20T18:00:00.000Z',
        updated_at: '2026-08-20T18:42:00.000Z',
        practice_session_songs: [
          {
            id: '73996b9f-65e4-4d32-9231-34f322fbbdeb',
            practice_session_id: sessionId,
            song_id: 'a2577370-af8e-4fd9-a4a8-930a0c9a5d62',
            minutes_practiced: 42,
            notes: null,
            progress_rating: 4,
            created_at: '2026-08-20T18:00:00.000Z',
            songs: {
              id: 'a2577370-af8e-4fd9-a4a8-930a0c9a5d62',
              user_id: 'b06dce0f-3074-4db3-86c2-dd7365237313',
              title: 'Enter Sandman',
              artist: 'Metallica',
            },
          },
        ],
      },
    });
  });

  it('should list the most recent practice sessions with the supported query contract', () => {
    service
      .listPracticeSessions({
        page: 1,
        limit: 20,
        sort_by: 'started_at',
        sort_order: 'desc',
      })
      .subscribe();

    const request = httpTestingController.expectOne(
      (candidate) =>
        candidate.url === `${environment.apiUrl}/practice-sessions` &&
        candidate.params.get('page') === '1' &&
        candidate.params.get('limit') === '20' &&
        candidate.params.get('sort_by') === 'started_at' &&
        candidate.params.get('sort_order') === 'desc',
    );

    expect(request.request.method).toBe('GET');
    request.flush({ data: [], meta: { page: 1, limit: 20, total: 0 } });
  });

  it('should load completed sessions for a song from the enriched history', () => {
    const songId = 'a2577370-af8e-4fd9-a4a8-930a0c9a5d62';
    const sessionId = '6dd1df66-a088-4a5e-9411-b1e881359311';
    let receivedHistoryLength = 0;

    service.getRecentSessionsForSong(songId).subscribe({
      next: (history) => (receivedHistoryLength = history.length),
    });

    const historyRequest = httpTestingController.expectOne(
      (candidate) =>
        candidate.url === `${environment.apiUrl}/practice-sessions/history` &&
        candidate.params.get('song_id') === songId,
    );
    historyRequest.flush({
      data: [
        {
          id: sessionId,
          ended_at: '2026-08-21T18:12:00.000Z',
          practice_session_songs: [{ song_id: songId }],
        },
      ],
      meta: { page: 1, limit: 20, total: 1 },
    });

    expect(receivedHistoryLength).toBe(1);
  });

  it('should create a practice session with its setup metadata', () => {
    const payload = {
      title: 'Prática de Enter Sandman',
      started_at: '2026-08-21T18:00:00.000Z',
      mood: 'focused',
      focus_area: 'Palm mute',
    };

    service.createPracticeSession(payload).subscribe();

    const request = httpTestingController.expectOne(`${environment.apiUrl}/practice-sessions`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ data: { id: 'session-id' } });
  });

  it('should associate a library song with the session', () => {
    const sessionId = 'session-id';
    const payload = { song_id: 'song-id' };

    service.addSong(sessionId, payload).subscribe();

    const request = httpTestingController.expectOne(
      `${environment.apiUrl}/practice-sessions/${sessionId}/songs`,
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({ data: { id: 'association-id' } });
  });

  it('should persist song progress and finish the session', () => {
    const sessionId = 'session-id';
    const songId = 'song-id';
    const songPayload = {
      minutes_practiced: 12,
      notes: 'Revisar o refrão.',
      progress_rating: 4,
    };
    const sessionPayload = {
      ended_at: '2026-08-21T18:12:00.000Z',
      duration_minutes: 12,
      notes: 'Boa consistência.',
    };

    service.updateSong(sessionId, songId, songPayload).subscribe();
    service.updatePracticeSession(sessionId, sessionPayload).subscribe();

    const songRequest = httpTestingController.expectOne(
      `${environment.apiUrl}/practice-sessions/${sessionId}/songs/${songId}`,
    );
    const sessionRequest = httpTestingController.expectOne(
      `${environment.apiUrl}/practice-sessions/${sessionId}`,
    );
    expect(songRequest.request.method).toBe('PATCH');
    expect(songRequest.request.body).toEqual(songPayload);
    expect(sessionRequest.request.method).toBe('PATCH');
    expect(sessionRequest.request.body).toEqual(sessionPayload);
    songRequest.flush({ data: { id: 'association-id' } });
    sessionRequest.flush({ data: { id: sessionId } });
  });

  it('should request enriched practice history using song and period filters', () => {
    service
      .getPracticeHistory({
        page: 2,
        limit: 10,
        song_id: 'a2577370-af8e-4fd9-a4a8-930a0c9a5d62',
        from: '2026-09-01T00:00:00.000Z',
        to: '2026-09-30T23:59:59.999Z',
      })
      .subscribe();

    const request = httpTestingController.expectOne(
      (httpRequest) => httpRequest.url === `${environment.apiUrl}/practice-sessions/history`,
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('song_id')).toBe('a2577370-af8e-4fd9-a4a8-930a0c9a5d62');
    expect(request.request.params.get('from')).toBe('2026-09-01T00:00:00.000Z');
    request.flush({ data: [], meta: { page: 2, limit: 10, total: 0 } });
  });

  it('should expose the atomic start and finish contracts', () => {
    const sessionId = '6dd1df66-a088-4a5e-9411-b1e881359311';
    const songId = 'a2577370-af8e-4fd9-a4a8-930a0c9a5d62';
    const techniqueId = 'ff373eed-d5ff-49f0-a0e3-243783494f87';
    const startPayload = {
      song_id: songId,
      practiced_bpm: 96,
      technique_ids: [techniqueId],
    };
    const finishPayload = {
      duration_seconds: 1845,
      paused_seconds: 120,
      song: {
        song_id: songId,
        seconds_practiced: 1845,
        practiced_bpm: 118,
        repetitions: 8,
        quality_rating: 4,
        technique_ids: [techniqueId],
      },
    };

    service.startPracticeSession(startPayload).subscribe();
    service.finishPracticeSession(sessionId, finishPayload).subscribe();

    const startRequest = httpTestingController.expectOne(
      `${environment.apiUrl}/practice-sessions/start`,
    );
    const finishRequest = httpTestingController.expectOne(
      `${environment.apiUrl}/practice-sessions/${sessionId}/finish`,
    );
    expect(startRequest.request.method).toBe('POST');
    expect(startRequest.request.body).toEqual(startPayload);
    expect(finishRequest.request.method).toBe('POST');
    expect(finishRequest.request.body).toEqual(finishPayload);
    startRequest.flush({ data: { id: sessionId, practice_session_songs: [] } });
    finishRequest.flush({ data: { id: sessionId, practice_session_songs: [] } });
  });
});
