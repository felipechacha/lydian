import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';
import { vi } from 'vitest';

import { ApiRequestError } from '../../../../core/http/api-request.error';
import { LibraryService } from '../../../library/data-access/library.service';
import { SongResponse, SongsListResponse } from '../../../library/models/add-music.models';
import { SetlistService } from '../../data-access/setlist.service';
import {
  SetlistDetailDataResponse,
  SetlistDetailResponse,
  SetlistDataResponse,
  DeletedSetlistDataResponse,
  SetlistSongDataResponse,
  SetlistSongDeletedDataResponse,
} from '../../models/setlist.models';
import { SetlistDetails } from './setlist-details';

describe('SetlistDetails', () => {
  let component: SetlistDetails;
  let fixture: ComponentFixture<SetlistDetails>;
  let setlistRequest$: Subject<SetlistDetailDataResponse>;
  let libraryRequest$: Subject<SongsListResponse>;
  let addSongRequest$: Subject<SetlistSongDataResponse>;
  let removeSongRequest$: Subject<SetlistSongDeletedDataResponse>;
  let deleteSetlistRequest$: Subject<DeletedSetlistDataResponse>;
  let updateSetlistRequest$: Subject<SetlistDataResponse>;
  const getSetlistDetails = vi.fn();
  const getMusicLibrary = vi.fn();
  const addSong = vi.fn();
  const removeSong = vi.fn();
  const deleteSetlist = vi.fn();
  const updateSetlist = vi.fn();
  const updateSong = vi.fn();
  const reorderSongs = vi.fn();
  const setlistId = '6dd1df66-a088-4a5e-9411-b1e881359311';
  const songId = '8ed56b8d-8ef9-4441-830a-9a3b4354e8c7';
  const apiSong: SongResponse = {
    id: songId,
    user_id: 'b06dce0f-3074-4db3-86c2-dd7365237313',
    title: 'Enter Sandman',
    artist: 'Metallica',
    album: 'Metallica (Remastered)',
    genre: 'Metal',
    musical_key: 'Mi menor',
    capo: null,
    tuning: 'E Standard',
    bpm: 123,
    difficulty: 'intermediate',
    spotify_track_id: null,
    spotify_preview_url: null,
    spotify_external_url: null,
    cover_image_url: 'https://images.example.com/enter-sandman.jpg',
    notes: 'Técnicas em foco: Down picking',
    duration_seconds: 300,
    created_at: '2026-08-20T18:00:00.000Z',
    updated_at: '2026-08-20T18:00:00.000Z',
    deleted_at: null,
  };
  const apiSetlist: SetlistDetailResponse = {
    id: setlistId,
    user_id: 'b06dce0f-3074-4db3-86c2-dd7365237313',
    name: 'QA — Ensaio agosto',
    description: 'Setlist criado durante o fluxo automatizado.',
    visibility: 'private',
    created_at: '2026-08-20T18:00:00.000Z',
    updated_at: '2026-08-20T18:00:00.000Z',
    setlist_songs: [],
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    setlistRequest$ = new Subject<SetlistDetailDataResponse>();
    libraryRequest$ = new Subject<SongsListResponse>();
    addSongRequest$ = new Subject<SetlistSongDataResponse>();
    removeSongRequest$ = new Subject<SetlistSongDeletedDataResponse>();
    deleteSetlistRequest$ = new Subject<DeletedSetlistDataResponse>();
    updateSetlistRequest$ = new Subject<SetlistDataResponse>();
    getSetlistDetails.mockReturnValue(setlistRequest$.asObservable());
    getMusicLibrary.mockReturnValue(libraryRequest$.asObservable());
    addSong.mockReturnValue(addSongRequest$.asObservable());
    removeSong.mockReturnValue(removeSongRequest$.asObservable());
    deleteSetlist.mockReturnValue(deleteSetlistRequest$.asObservable());
    updateSetlist.mockReturnValue(updateSetlistRequest$.asObservable());
    reorderSongs.mockReturnValue(of({ data: { id: setlistId } }));
    updateSong.mockImplementation(
      (
        _setlistId: string,
        requestedSongId: string,
        payload: { position?: number; notes?: string },
      ) =>
        of({
          data: {
            id: `relation-${requestedSongId}`,
            setlist_id: setlistId,
            song_id: requestedSongId,
            position: payload.position ?? 0,
            notes: payload.notes ?? null,
            created_at: '2026-08-20T18:10:00.000Z',
          },
        }),
    );

    await TestBed.configureTestingModule({
      imports: [SetlistDetails],
      providers: [
        provideRouter([]),
        {
          provide: SetlistService,
          useValue: {
            getSetlistDetails,
            addSong,
            removeSong,
            deleteSetlist,
            updateSetlist,
            updateSong,
            reorderSongs,
          },
        },
        { provide: LibraryService, useValue: { getMusicLibrary } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: setlistId }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SetlistDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load the setlist and library using the route UUID', () => {
    expect(component).toBeTruthy();
    expect(component.isLoading).toBe(true);
    expect(getSetlistDetails).toHaveBeenCalledWith(setlistId);
    expect(getMusicLibrary).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.querySelector('app-content-skeleton-loading')).toBeTruthy();

    completeInitialRequests();
    fixture.detectChanges();

    expect(component.setlist?.title).toBe(apiSetlist.name);
    expect(component.availableMusics[0]).toMatchObject({
      id: songId,
      title: apiSong.title,
      composer: apiSong.artist,
      difficulty: 'Médio',
    });
    expect(fixture.nativeElement.querySelector('#setlist-details-title')?.textContent).toContain(
      apiSetlist.name,
    );
  });

  it('should add a library song through the API and show it in the setlist', () => {
    completeInitialRequests();
    fixture.detectChanges();

    component.openMusicPicker();
    component.addMusic(songId);

    expect(component.isAddingMusic).toBe(true);
    expect(addSong).toHaveBeenCalledWith(setlistId, { song_id: songId });

    addSongRequest$.next({
      data: {
        id: 'e176b4c7-a7d8-4c76-a2da-709b1c493052',
        setlist_id: setlistId,
        song_id: songId,
        position: 1,
        notes: null,
        created_at: '2026-08-20T18:10:00.000Z',
      },
    });
    addSongRequest$.complete();
    fixture.detectChanges();

    expect(component.selectedMusics).toHaveLength(1);
    expect(component.selectedMusics[0].id).toBe(songId);
    expect(component.availableMusics).toHaveLength(0);
    expect(component.isMusicPickerOpen).toBe(false);
  });

  it('should keep every rendered page section on the Bootstrap page grid', () => {
    completeInitialRequests();
    component.openMusicPicker();
    fixture.detectChanges();

    const sections = fixture.nativeElement.querySelectorAll('#setlist-details-page > section');
    expect(sections.length).toBeGreaterThan(0);
    sections.forEach((section: HTMLElement) => {
      expect(section.querySelector('.container > .row > [class*="col-12"]')).toBeTruthy();
    });
    expect(fixture.nativeElement.querySelector('#setlist-details-page section section')).toBeNull();
  });

  it('should remove a song association and update count and estimated duration', () => {
    completeInitialRequests({ songs: [apiSong] });
    fixture.detectChanges();
    expect(component.estimatedDuration).toBe('5 min');

    const removalTrigger: HTMLButtonElement = fixture.nativeElement.querySelector(
      '.track-removal-trigger-custom',
    );
    removalTrigger.click();
    fixture.detectChanges();

    const removalModal = fixture.nativeElement.querySelector('app-confirmation-modal');
    expect(removalModal).toBeTruthy();
    expect(removalModal.textContent).toContain('Enter Sandman');
    expect(removalModal.textContent).toContain('Remover música');

    component.removeMusic(songId);
    expect(removeSong).toHaveBeenCalledWith(setlistId, songId);
    expect(component.isRemovingMusic(songId)).toBe(true);

    removeSongRequest$.next({ data: { setlist_id: setlistId, song_id: songId } });
    removeSongRequest$.complete();
    fixture.detectChanges();

    expect(component.selectedMusics).toHaveLength(0);
    expect(component.estimatedDuration).toBe('0 min');
    expect(component.musicPendingRemovalId).toBeNull();
  });

  it('should update setlist metadata through the API', () => {
    completeInitialRequests();
    component.updateSetlist({
      name: 'Show atualizado',
      description: 'Nova descrição',
      visibility: 'public',
    });

    expect(updateSetlist).toHaveBeenCalledWith(setlistId, {
      name: 'Show atualizado',
      description: 'Nova descrição',
      visibility: 'public',
    });
    updateSetlistRequest$.next({
      data: {
        ...apiSetlist,
        name: 'Show atualizado',
        description: 'Nova descrição',
        visibility: 'public',
      },
    });
    updateSetlistRequest$.complete();

    expect(component.setlist).toMatchObject({
      title: 'Show atualizado',
      description: 'Nova descrição',
      visibility: 'public',
    });
  });

  it('should reorder tracks through a single atomic update', () => {
    const secondSong = { ...apiSong, id: 'second-song-id', title: 'Sad but True' };
    completeInitialRequests({ songs: [apiSong, secondSong] });

    component.moveTrack(apiSong.id, 1);

    expect(reorderSongs).toHaveBeenCalledOnce();
    expect(reorderSongs).toHaveBeenCalledWith(setlistId, [secondSong.id, apiSong.id]);
    expect(updateSong).not.toHaveBeenCalled();
    expect(component.tracks.map((track) => track.song.id)).toEqual([secondSong.id, apiSong.id]);
  });

  it('should confirm the setlist deletion and return to the collection', () => {
    completeInitialRequests();
    fixture.detectChanges();
    const router = TestBed.inject(Router);
    const navigationSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const deleteButton = fixture.nativeElement.querySelector(
      '.delete-setlist-custom',
    ) as HTMLButtonElement;
    deleteButton.click();
    fixture.detectChanges();
    expect(component.isDeleteSetlistConfirmationOpen).toBe(true);
    const deleteModal = fixture.nativeElement.querySelector('app-confirmation-modal');
    expect(deleteModal).toBeTruthy();
    expect(deleteModal.querySelector('dialog[role="alertdialog"]')).toBeTruthy();
    expect(deleteModal.textContent).toContain('Excluir setlist');
    expect(fixture.nativeElement.querySelector('#delete-setlist-section')).toBeNull();

    component.deleteSetlist();
    expect(deleteSetlist).toHaveBeenCalledWith(setlistId);
    deleteSetlistRequest$.next({ data: { id: setlistId } });
    deleteSetlistRequest$.complete();

    expect(navigationSpy).toHaveBeenCalledWith(['/setlist']);
  });

  it('should show a contextual message when the setlist does not exist', () => {
    setlistRequest$.error(new ApiRequestError('Setlist not found', 404));
    fixture.detectChanges();

    expect(component.isLoading).toBe(false);
    expect(component.errorMessage).toBe('O setlist solicitado não foi encontrado.');
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      component.errorMessage,
    );
  });

  it('should navigate to Stage Mode for the current UUID', () => {
    const router = TestBed.inject(Router);
    const navigationSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.openStageMode();

    expect(navigationSpy).toHaveBeenCalledWith(['/stage-mode', setlistId]);
  });

  it('should alternate the music cards between grid and list views', () => {
    completeInitialRequests({ songs: [apiSong] });
    fixture.detectChanges();

    const listButton = fixture.nativeElement.querySelector(
      'button[aria-label="Visualizar em lista"]',
    ) as HTMLButtonElement;
    listButton.click();
    fixture.detectChanges();

    const musicColumn = fixture.nativeElement.querySelector('.tracks-grid-custom > div');
    const musicCard = fixture.nativeElement.querySelector('app-music-library-card article');
    expect(component.viewMode).toBe('list');
    expect(musicColumn.classList).not.toContain('col-md-6');
    expect(musicCard.classList).toContain('music-library-card-custom--list');
  });

  function completeInitialRequests(options: { songs?: readonly SongResponse[] } = {}): void {
    const setlistSongs = (options.songs ?? []).map((song, index) => ({
      id: `setlist-song-${index}`,
      setlist_id: setlistId,
      song_id: song.id,
      position: index + 1,
      notes: null,
      created_at: '2026-08-20T18:00:00.000Z',
      songs: song,
    }));
    setlistRequest$.next({ data: { ...apiSetlist, setlist_songs: setlistSongs } });
    setlistRequest$.complete();
    libraryRequest$.next({ data: [apiSong], meta: { page: 1, limit: 20, total: 1 } });
    libraryRequest$.complete();
  }
});
