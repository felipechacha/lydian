import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { vi } from 'vitest';

import { MetronomeAudioService } from '../../../../core/audio/metronome-audio.service';
import { ApiRequestError } from '../../../../core/http/api-request.error';
import { PracticeSessionService } from '../../../practice/data-access/practice-session.service';
import {
  PracticeSessionDataResponse,
  PracticeSessionHistoryItem,
} from '../../../practice/models/practice-session.models';
import { TechniquesService } from '../../../techniques/data-access/techniques.service';
import { LibraryService } from '../../data-access/library.service';
import {
  DeletedSongDataResponse,
  SongDataResponse,
  SongResponse,
} from '../../models/add-music.models';
import { MusicDetails } from './music-details';

describe('MusicDetails', () => {
  let component: MusicDetails;
  let fixture: ComponentFixture<MusicDetails>;
  const startMetronome = vi.fn<(tempo: number) => Promise<boolean>>();
  const stopMetronome = vi.fn<() => void>();
  const updateMetronomeTempo = vi.fn<(tempo: number) => void>();
  const getMusicDetails = vi.fn();
  const deleteMusic = vi.fn();
  const startPracticeSession = vi.fn();
  const getRecentSessionsForSong = vi.fn();
  const musicId = '6dd1df66-a088-4a5e-9411-b1e881359311';
  const apiMusic: SongResponse = {
    id: musicId,
    user_id: 'b06dce0f-3074-4db3-86c2-dd7365237313',
    title: 'Enter Sandman',
    artist: 'Metallica',
    album: 'Metallica (Remastered)',
    genre: 'Metal',
    musical_key: 'Ré Bemol Maior',
    capo: 0,
    tuning: 'E Standard',
    bpm: 72,
    difficulty: 'beginner',
    spotify_track_id: null,
    spotify_preview_url: null,
    spotify_external_url: null,
    cover_image_url: 'https://images.example.com/enter-sandman.jpg',
    notes: 'Técnicas em foco: Down picking, Palm mute',
    learning_status: 'learning',
    target_bpm: 120,
    priority: 2,
    duration_seconds: 331,
    song_techniques: [
      {
        techniques: {
          id: '11111111-1111-4111-8111-111111111111',
          key: 'down-picking',
          name: 'Down picking',
          category: 'right_hand',
        },
      },
      {
        techniques: {
          id: '22222222-2222-4222-8222-222222222222',
          key: 'palm-mute',
          name: 'Palm mute',
          category: 'right_hand',
        },
      },
    ],
    created_at: '2026-08-20T18:02:45.458393+00:00',
    updated_at: '2026-08-20T18:02:45.458393+00:00',
    deleted_at: null,
  };
  let musicDetailsRequest$: Subject<SongDataResponse>;
  let deleteMusicRequest$: Subject<DeletedSongDataResponse>;
  let startPracticeSessionRequest$: Subject<PracticeSessionDataResponse>;
  let recentPracticeSessionsRequest$: Subject<readonly PracticeSessionHistoryItem[]>;
  let router: Router;

  beforeEach(async () => {
    vi.clearAllMocks();
    startMetronome.mockResolvedValue(true);
    musicDetailsRequest$ = new Subject<SongDataResponse>();
    deleteMusicRequest$ = new Subject<DeletedSongDataResponse>();
    startPracticeSessionRequest$ = new Subject<PracticeSessionDataResponse>();
    recentPracticeSessionsRequest$ = new Subject<readonly PracticeSessionHistoryItem[]>();
    getMusicDetails.mockReturnValue(musicDetailsRequest$.asObservable());
    deleteMusic.mockReturnValue(deleteMusicRequest$.asObservable());
    startPracticeSession.mockReturnValue(startPracticeSessionRequest$.asObservable());
    getRecentSessionsForSong.mockReturnValue(recentPracticeSessionsRequest$.asObservable());

    await TestBed.configureTestingModule({
      imports: [MusicDetails],
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
          provide: LibraryService,
          useValue: { getMusicDetails, deleteMusic },
        },
        {
          provide: PracticeSessionService,
          useValue: {
            startPracticeSession,
            getRecentSessionsForSong,
          },
        },
        {
          provide: TechniquesService,
          useValue: {
            getTechniques: () =>
              of({ data: apiMusic.song_techniques?.map(({ techniques }) => techniques) ?? [] }),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: musicId }) },
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    fixture = TestBed.createComponent(MusicDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.isLoading).toBe(true);
    expect(getMusicDetails).toHaveBeenCalledWith(musicId);
  });

  it('should control metronome playback and update its tempo', async () => {
    completeMusicRequest();

    await component.toggleMetronome();

    expect(startMetronome).toHaveBeenCalledWith(apiMusic.bpm);
    expect(component.isMetronomeRunning).toBe(true);

    component.changeTempo(180);
    expect(updateMetronomeTempo).toHaveBeenCalledWith(180);

    await component.toggleMetronome();
    expect(stopMetronome).toHaveBeenCalled();
    expect(component.isMetronomeRunning).toBe(false);
  });

  it('should populate the integrated music data and preserve the static insight components', () => {
    completeMusicRequest();
    fixture.detectChanges();

    expect(component.music).toMatchObject({
      id: apiMusic.id,
      title: apiMusic.title,
      composer: apiMusic.artist,
      artworkUrl: apiMusic.cover_image_url,
      bpm: apiMusic.bpm,
      difficulty: 'Fácil',
      techniques: ['Down picking', 'Palm mute'],
    });
    expect(component.tempo).toBe(apiMusic.bpm);
    expect(fixture.nativeElement.querySelector('#music-details-title')?.textContent).toContain(
      apiMusic.title,
    );
    expect(fixture.nativeElement.querySelector('app-progress-monitor')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-music-rating')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-practice-diary')).toBeTruthy();
  });

  it('should open the practice setup modal from the hero CTA', () => {
    completeMusicRequest();
    fixture.detectChanges();

    const practiceButton: HTMLButtonElement =
      fixture.nativeElement.querySelector('.start-practice-custom');
    practiceButton.click();
    fixture.detectChanges();

    expect(component.isPracticeSetupOpen).toBe(true);
    expect(fixture.nativeElement.querySelector('app-practice-session-setup-modal')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeTruthy();
  });

  it('should show the details loading skeleton while the API request is pending', () => {
    expect(fixture.nativeElement.querySelector('app-content-skeleton-loading')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-music-details-hero')).toBeNull();
  });

  it('should populate the practice diary with completed sessions associated with the song', () => {
    const sessionId = 'f51ae683-6a75-4505-b27e-90982c9ac145';
    completeMusicRequest();
    recentPracticeSessionsRequest$.next([
      {
        sequence: 7,
        session: {
          id: sessionId,
          user_id: 'user-id',
          title: 'Prática de Enter Sandman',
          started_at: '2026-08-21T18:00:00.000Z',
          ended_at: '2026-08-21T18:12:00.000Z',
          duration_minutes: 12,
          notes: 'Boa consistência.',
          mood: 'satisfied',
          focus_area: 'Palm mute',
          created_at: '2026-08-21T18:00:00.000Z',
          updated_at: '2026-08-21T18:12:00.000Z',
          practice_session_songs: [
            {
              id: 'association-id',
              practice_session_id: sessionId,
              song_id: musicId,
              minutes_practiced: 12,
              notes: 'Revisar o refrão.',
              progress_rating: 4,
              created_at: '2026-08-21T18:00:00.000Z',
              songs: { ...apiMusic },
            },
          ],
        },
      },
    ]);
    recentPracticeSessionsRequest$.complete();
    fixture.detectChanges();

    expect(getRecentSessionsForSong).toHaveBeenCalledWith(musicId);
    expect(component.diaryEntries).toEqual([
      expect.objectContaining({
        session: 7,
        duration: '12 min',
        progress: 80,
        tempo: 72,
        sessionNotes: 'Boa consistência.',
        songNotes: 'Revisar o refrão.',
      }),
    ]);
    expect(fixture.nativeElement.querySelector('.diary-entry-custom')).toBeTruthy();

    fixture.nativeElement.querySelector('.diary-entry-custom > button').click();
    fixture.detectChanges();

    expect(component.selectedDiaryEntry?.sessionId).toBe(sessionId);
    expect(
      fixture.nativeElement.querySelector('app-practice-diary-detail-modal')?.textContent,
    ).toContain('Boa consistência.');
  });

  it('should show a contextual message when the song does not exist', () => {
    musicDetailsRequest$.error(new ApiRequestError('Song not found', 404));
    fixture.detectChanges();

    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe(
      'A música solicitada não foi encontrada na sua biblioteca.',
    );
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      component.errorMessage,
    );
  });

  it('should require confirmation before deleting the selected song', () => {
    completeMusicRequest();
    fixture.detectChanges();

    const deleteTrigger: HTMLButtonElement =
      fixture.nativeElement.querySelector('.delete-music-custom');
    deleteTrigger.click();
    fixture.detectChanges();

    expect(component.isDeleteMusicConfirmationOpen).toBe(true);
    expect(deleteMusic).not.toHaveBeenCalled();
    const deleteModal = fixture.nativeElement.querySelector('app-confirmation-modal');
    expect(deleteModal).toBeTruthy();
    expect(deleteModal.querySelector('dialog[role="alertdialog"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#delete-music-section')).toBeNull();
  });

  it('should delete the selected song and return to the library', () => {
    completeMusicRequest();
    component.requestMusicDeletion();
    component.deleteMusic();

    expect(deleteMusic).toHaveBeenCalledWith(musicId);
    expect(component.isDeletingMusic).toBe(true);

    deleteMusicRequest$.next({ data: { id: musicId } });
    deleteMusicRequest$.complete();

    expect(router.navigate).toHaveBeenCalledWith(['/musics']);
    expect(component.isDeletingMusic).toBe(false);
  });

  it('should keep the confirmation open and show a contextual deletion error', () => {
    completeMusicRequest();
    component.requestMusicDeletion();
    component.deleteMusic();

    deleteMusicRequest$.error(new ApiRequestError('Song not found', 404));
    fixture.detectChanges();

    expect(component.isDeleteMusicConfirmationOpen).toBe(true);
    expect(component.isDeletingMusic).toBe(false);
    expect(component.deleteMusicErrorMessage).toBe(
      'A música solicitada não foi encontrada na sua biblioteca.',
    );
    expect(
      fixture.nativeElement.querySelector('.confirmation-modal-error-custom')?.textContent,
    ).toContain(component.deleteMusicErrorMessage);
  });

  it('should start an atomic session and navigate to practice', () => {
    const sessionId = 'f51ae683-6a75-4505-b27e-90982c9ac145';
    completeMusicRequest();
    component.openPracticeSetup();
    component.createPracticeSession({
      title: 'Prática de Enter Sandman',
      focusArea: 'Palm mute',
      mood: 'focused',
      notes: 'Trabalhar precisão.',
    });

    expect(startPracticeSession).toHaveBeenCalledWith(
      expect.objectContaining({
        song_id: musicId,
        title: 'Prática de Enter Sandman',
        focus_area: 'Palm mute',
        mood: 'focused',
        notes: 'Trabalhar precisão.',
      }),
    );

    startPracticeSessionRequest$.next({
      data: {
        id: sessionId,
        user_id: 'user-id',
        title: 'Prática de Enter Sandman',
        started_at: '2026-08-21T18:00:00.000Z',
        ended_at: null,
        duration_minutes: null,
        notes: 'Trabalhar precisão.',
        mood: 'focused',
        focus_area: 'Palm mute',
        created_at: '2026-08-21T18:00:00.000Z',
        updated_at: '2026-08-21T18:00:00.000Z',
        practice_session_songs: [],
      },
    });
    startPracticeSessionRequest$.complete();

    expect(router.navigate).toHaveBeenCalledWith(['/practice-session', sessionId], {
      state: { practiceSessionFresh: true },
    });
  });

  function completeMusicRequest(): void {
    musicDetailsRequest$.next({ data: apiMusic });
    musicDetailsRequest$.complete();
  }
});
