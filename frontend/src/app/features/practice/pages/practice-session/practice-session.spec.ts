import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { vi } from 'vitest';

import { MetronomeAudioService } from '../../../../core/audio/metronome-audio.service';
import { ApiRequestError } from '../../../../core/http/api-request.error';
import { PracticeSessionService } from '../../data-access/practice-session.service';
import {
  PracticeSessionDataResponse,
  PracticeSessionDetailResponse,
} from '../../models/practice-session.models';
import { PracticeSession } from './practice-session';

describe('PracticeSession', () => {
  let component: PracticeSession;
  let fixture: ComponentFixture<PracticeSession>;
  const startMetronome = vi.fn<(tempo: number) => Promise<boolean>>();
  const stopMetronome = vi.fn<() => void>();
  const updateMetronomeTempo = vi.fn<(tempo: number) => void>();
  const getPracticeSession = vi.fn();
  const finishPracticeSession = vi.fn();
  const sessionId = '6dd1df66-a088-4a5e-9411-b1e881359311';
  const apiPracticeSession: PracticeSessionDetailResponse = {
    id: sessionId,
    user_id: 'b06dce0f-3074-4db3-86c2-dd7365237313',
    title: 'Treino de riffs',
    started_at: '2026-08-20T18:00:00.000Z',
    ended_at: '2026-08-20T18:42:00.000Z',
    duration_minutes: 42,
    notes: 'Manter a dinâmica.',
    mood: 'focused',
    focus_area: 'palm mute',
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
          album: 'Metallica (Remastered)',
          genre: 'Metal',
          musical_key: 'Mi menor',
          capo: 0,
          tuning: 'E Standard',
          bpm: 123,
          difficulty: 'intermediate',
          spotify_track_id: null,
          spotify_preview_url: null,
          spotify_external_url: null,
          cover_image_url: 'https://images.example.com/enter-sandman.jpg',
          notes: 'Técnicas em foco: Palm Mute, Down Picking',
          song_techniques: [
            {
              techniques: {
                id: '11111111-1111-4111-8111-111111111111',
                key: 'palm-mute',
                name: 'Palm Mute',
                category: 'right_hand',
              },
            },
            {
              techniques: {
                id: '22222222-2222-4222-8222-222222222222',
                key: 'down-picking',
                name: 'Down Picking',
                category: 'right_hand',
              },
            },
          ],
          created_at: '2026-08-20T17:00:00.000Z',
          updated_at: '2026-08-20T17:00:00.000Z',
          deleted_at: null,
        },
      },
    ],
  };
  let practiceSessionRequest$: Subject<PracticeSessionDataResponse>;
  let finishPracticeSessionRequest$: Subject<PracticeSessionDataResponse>;
  let router: Router;

  beforeEach(async () => {
    vi.clearAllMocks();
    startMetronome.mockResolvedValue(true);
    practiceSessionRequest$ = new Subject<PracticeSessionDataResponse>();
    finishPracticeSessionRequest$ = new Subject<PracticeSessionDataResponse>();
    getPracticeSession.mockReturnValue(practiceSessionRequest$.asObservable());
    finishPracticeSession.mockReturnValue(finishPracticeSessionRequest$.asObservable());

    await TestBed.configureTestingModule({
      imports: [PracticeSession],
      providers: [
        provideRouter([]),
        {
          provide: MetronomeAudioService,
          useValue: {
            start: startMetronome,
            stop: stopMetronome,
            updateTempo: updateMetronomeTempo,
          },
        },
        {
          provide: PracticeSessionService,
          useValue: { getPracticeSession, finishPracticeSession },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: sessionId }) },
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(PracticeSession);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load the practice session identified by the route', () => {
    expect(component).toBeTruthy();
    expect(component.isLoading).toBe(true);
    expect(getPracticeSession).toHaveBeenCalledWith(sessionId);
    expect(fixture.nativeElement.querySelector('app-content-skeleton-loading')).toBeTruthy();
  });

  it('should populate available API data and preserve unsupported widgets', () => {
    completePracticeSessionRequest();
    fixture.detectChanges();

    expect(component.sessionArtist).toBe('Metallica');
    expect(component.sessionMusicTitle).toBe('Enter Sandman');
    expect(component.sessionDescription).toContain('Afinação E Standard.');
    expect(component.sessionDescription).toContain('Foco em palm mute.');
    expect(component.elapsedTime).toBe('00:42:00');
    expect(component.tempo).toBe(123);
    expect(component.techniques.map((technique) => technique.label)).toEqual([
      'Palm Mute',
      'Down Picking',
    ]);
    expect(fixture.nativeElement.querySelector('#practice-session-title')?.textContent).toContain(
      'Enter Sandman',
    );
    expect(fixture.nativeElement.querySelector('app-sheet-music-panel')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-session-tool-dock')).toBeTruthy();
  });

  it('should control metronome playback with the song BPM', async () => {
    completePracticeSessionRequest();

    await component.toggleMetronome();

    expect(startMetronome).toHaveBeenCalledWith(123);
    expect(component.isMetronomeRunning).toBe(true);

    component.changeTempo(156);
    expect(updateMetronomeTempo).toHaveBeenCalledWith(156);

    await component.toggleMetronome();
    expect(stopMetronome).toHaveBeenCalled();
    expect(component.isMetronomeRunning).toBe(false);
  });

  it('should show a contextual message when the practice session does not exist', () => {
    practiceSessionRequest$.error(new ApiRequestError('Practice session not found', 404));
    fixture.detectChanges();

    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('A sessão de prática solicitada não foi encontrada.');
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      component.errorMessage,
    );
  });

  it('should save exact practice metrics before leaving the session', () => {
    completePracticeSessionRequest();
    component.requestSessionCompletion();
    component.completeSession({
      sessionNotes: 'Boa consistência.',
      songNotes: 'Revisar o refrão.',
      progressRating: 4,
      qualityRating: 5,
      repetitions: 8,
      mood: 'satisfied',
    });

    expect(finishPracticeSession).toHaveBeenCalledWith(
      sessionId,
      expect.objectContaining({
        duration_seconds: 2520,
        notes: 'Boa consistência.',
        mood: 'satisfied',
        song: expect.objectContaining({
          practiced_bpm: 123,
          progress_rating: 4,
          quality_rating: 5,
          repetitions: 8,
          notes: 'Revisar o refrão.',
        }),
      }),
    );

    finishPracticeSessionRequest$.next({ data: apiPracticeSession });
    finishPracticeSessionRequest$.complete();

    expect(router.navigate).toHaveBeenCalledWith([
      '/music-details',
      apiPracticeSession.practice_session_songs[0].songs.id,
    ]);
  });

  function completePracticeSessionRequest(): void {
    practiceSessionRequest$.next({ data: apiPracticeSession });
    practiceSessionRequest$.complete();
  }
});

describe('PracticeSession fresh flow', () => {
  let component: PracticeSession;
  let fixture: ComponentFixture<PracticeSession>;
  const getPracticeSession = vi.fn();
  const musicId = 'a2577370-af8e-4fd9-a4a8-930a0c9a5d62';
  const sessionId = '6dd1df66-a088-4a5e-9411-b1e881359311';
  const freshSessionResponse = {
    data: {
      id: sessionId,
      user_id: 'user-id',
      title: 'Prática de Enter Sandman',
      started_at: '2026-08-21T18:00:00.000Z',
      ended_at: null,
      duration_minutes: null,
      notes: null,
      mood: 'focused',
      focus_area: 'Palm mute',
      created_at: '2026-08-21T18:00:00.000Z',
      updated_at: '2026-08-21T18:00:00.000Z',
      practice_session_songs: [
        {
          id: 'association-id',
          practice_session_id: sessionId,
          song_id: musicId,
          minutes_practiced: null,
          notes: null,
          progress_rating: null,
          created_at: '2026-08-21T18:00:00.000Z',
          songs: {
            id: musicId,
            user_id: 'user-id',
            title: 'Enter Sandman',
            artist: 'Metallica',
            album: 'Metallica',
            genre: 'Metal',
            musical_key: 'Mi menor',
            capo: null,
            tuning: 'E Standard',
            bpm: 123,
            difficulty: 'intermediate',
            spotify_track_id: null,
            spotify_preview_url: null,
            spotify_external_url: null,
            cover_image_url: null,
            notes: 'Técnicas em foco: Palm Mute, Down Picking',
            created_at: '2026-08-21T17:00:00.000Z',
            updated_at: '2026-08-21T17:00:00.000Z',
            deleted_at: null,
          },
        },
      ],
    },
  } satisfies PracticeSessionDataResponse;

  beforeEach(async () => {
    vi.useFakeTimers();
    getPracticeSession.mockReset().mockReturnValue(of(freshSessionResponse));

    await TestBed.configureTestingModule({
      imports: [PracticeSession],
      providers: [
        {
          provide: MetronomeAudioService,
          useValue: {
            start: vi.fn().mockResolvedValue(true),
            stop: vi.fn(),
            updateTempo: vi.fn(),
          },
        },
        {
          provide: PracticeSessionService,
          useValue: {
            getPracticeSession,
            updateSong: vi.fn(),
            updatePracticeSession: vi.fn(),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {},
              paramMap: convertToParamMap({ id: sessionId }),
            },
          },
        },
        {
          provide: Location,
          useValue: { getState: () => ({ practiceSessionFresh: true }) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PracticeSession);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    vi.useRealTimers();
  });

  it('should load a newly created persisted session from zero', () => {
    expect(getPracticeSession).toHaveBeenCalledWith(sessionId);
    expect(component.canDisplaySession).toBe(true);
    expect(component.sessionArtist).toBe('Metallica');
    expect(component.sessionMusicTitle).toBe('Enter Sandman');
    expect(component.tempo).toBe(123);
    expect(component.elapsedTime).toBe('00:00:00');
    expect(component.sessionStatusLabel).toBe('Sessão pronta');
  });

  it('should start, pause and resume the persisted session timer', () => {
    component.toggleSessionTimer();
    expect(component.isTimerRunning).toBe(true);
    expect(component.sessionStatusLabel).toBe('Sessão em andamento');

    vi.advanceTimersByTime(2250);
    expect(component.elapsedTime).toBe('00:00:02');

    component.toggleSessionTimer();
    expect(component.isTimerRunning).toBe(false);
    expect(component.sessionStatusLabel).toBe('Sessão pausada');

    vi.advanceTimersByTime(2000);
    expect(component.elapsedTime).toBe('00:00:02');

    component.toggleSessionTimer();
    vi.advanceTimersByTime(1000);
    expect(component.elapsedTime).toBe('00:00:03');
  });
});
