import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { it, vi, describe, beforeEach, afterEach, expect } from 'vitest';
import { ApiRequestError } from '../../../../core/http/api-request.error';
import { AppleMusicService } from '../../data-access/apple-music.service';
import { LibraryService } from '../../data-access/library.service';
import { TechniquesService } from '../../../techniques/data-access/techniques.service';
import { AppleMusicPreviewProgress, AppleMusicSearchResult } from '../../models/add-music.models';
import { AddMusic } from './add-music';

describe('AddMusic', () => {
  let component: AddMusic;
  let fixture: ComponentFixture<AddMusic>;
  const activePreviewMusicIdSubject = new BehaviorSubject<number | null>(null);
  const previewProgressSubject = new BehaviorSubject<AppleMusicPreviewProgress>({
    musicId: null,
    progressPercentage: 0,
    remainingSeconds: 0,
  });
  const searchSongs = vi.fn();
  const togglePreview = vi.fn<(music: AppleMusicSearchResult) => Promise<boolean>>();
  const stopPreview = vi.fn<() => void>();
  const createMusic = vi.fn();
  const updateMusicTechniques = vi.fn();
  const getTechniques = vi.fn();
  const clearCatalogCache = vi.fn();
  const navigate = vi.fn<Router['navigate']>();
  const appleMusicResult: AppleMusicSearchResult = {
    id: 1571968519,
    title: 'Enter Sandman',
    artist: 'Metallica',
    album: 'Metallica (Remastered)',
    genre: 'Metal',
    artworkUrl: 'https://images.example.com/enter-sandman.jpg',
    previewUrl: 'https://audio.example.com/enter-sandman.m4a',
    appleMusicUrl: 'https://music.apple.com/br/song/enter-sandman',
    durationSeconds: 331,
  };
  const palmMuteTechniqueId = 'ff373eed-d5ff-49f0-a0e3-243783494f87';
  const alternatePickingTechniqueId = 'f0b1b71b-a0ef-4210-bfe5-b7ef6e2a9af2';
  const techniqueCatalog = [
    {
      id: palmMuteTechniqueId,
      key: 'palm-mute',
      name: 'Palm Mute',
      category: 'articulation',
    },
    {
      id: alternatePickingTechniqueId,
      key: 'alternate-picking',
      name: 'Alternate Picking',
      category: 'picking',
    },
  ];

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    activePreviewMusicIdSubject.next(null);
    previewProgressSubject.next({
      musicId: null,
      progressPercentage: 0,
      remainingSeconds: 0,
    });
    searchSongs.mockReturnValue(of([appleMusicResult]));
    togglePreview.mockResolvedValue(true);
    createMusic.mockReturnValue(of({ data: { id: 'song-id' } }));
    updateMusicTechniques.mockReturnValue(of({ data: { id: 'song-id' } }));
    getTechniques.mockReturnValue(of({ data: techniqueCatalog }));
    navigate.mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [AddMusic],
      providers: [
        provideRouter([]),
        {
          provide: AppleMusicService,
          useValue: {
            activePreviewMusicId$: activePreviewMusicIdSubject.asObservable(),
            previewProgress$: previewProgressSubject.asObservable(),
            searchSongs,
            togglePreview,
            stopPreview,
          },
        },
        {
          provide: LibraryService,
          useValue: { createMusic, updateMusicTechniques },
        },
        {
          provide: TechniquesService,
          useValue: { getTechniques, clearCatalogCache },
        },
      ],
    }).compileComponents();

    vi.spyOn(TestBed.inject(Router), 'navigate').mockImplementation(navigate);
    fixture = TestBed.createComponent(AddMusic);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show mocked music metadata before a catalog selection', () => {
    expect(component.selectedMusic).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Nenhuma música selecionada');
    expect(fixture.nativeElement.querySelector('app-selected-music-detail')).toBeNull();
  });

  it('should keep every page section on the Bootstrap page grid', () => {
    const sections = fixture.nativeElement.querySelectorAll('#add-music-page > section');

    expect(sections.length).toBe(2);
    sections.forEach((section: HTMLElement) => {
      expect(section.querySelector('.container > .row > [class*="col-12"]')).toBeTruthy();
    });
    expect(fixture.nativeElement.querySelector('#add-music-page section section')).toBeNull();
  });

  it('should search the Apple catalog after the input debounce', async () => {
    component.updateSearchQuery('Metallica');
    await vi.advanceTimersByTimeAsync(400);

    expect(searchSongs).toHaveBeenCalledWith('Metallica');
    expect(component.searchResults).toEqual([appleMusicResult]);
    expect(component.selectedMusic).toMatchObject({
      id: appleMusicResult.id,
      title: appleMusicResult.title,
      composer: appleMusicResult.artist,
      album: appleMusicResult.album,
      genre: appleMusicResult.genre,
      artworkUrl: appleMusicResult.artworkUrl,
      bpm: 72,
      key: 'Ré Bemol Maior',
      capo: 0,
      tuning: 'E Standard',
      difficulty: 'Intermediário',
      difficultyLevel: 2,
      techniques: [],
      techniqueIds: [],
      provider: 'apple_music',
      providerTrackId: String(appleMusicResult.id),
      previewUrl: appleMusicResult.previewUrl,
      externalUrl: appleMusicResult.appleMusicUrl,
      durationSeconds: appleMusicResult.durationSeconds,
    });
    expect(component.selectedMusicId).toBe(appleMusicResult.id);
    expect(component.hasSearched).toBe(true);
    expect(component.isSearching).toBe(false);
  });

  it('should toggle the selected Apple Music preview', async () => {
    await component.togglePreview(appleMusicResult);

    expect(togglePreview).toHaveBeenCalledWith(appleMusicResult);
    expect(component.selectedMusic?.title).toBe(appleMusicResult.title);
    expect(component.previewErrorMessage).toBe('');
  });

  it('should expose the active preview progress to the results component', () => {
    previewProgressSubject.next({
      musicId: appleMusicResult.id,
      progressPercentage: 45,
      remainingSeconds: 17,
    });

    expect(component.previewProgressPercentage).toBe(45);
    expect(component.previewRemainingSeconds).toBe(17);
  });

  it('should send the edited selected music metadata to the library API', () => {
    component.selectMusic(appleMusicResult);
    const editedMusic = {
      ...component.selectedMusic!,
      bpm: 124,
      key: 'Mi menor',
      difficulty: 'Difícil',
      difficultyLevel: 3,
      techniques: ['Palm Mute', 'Alternate Picking'],
      techniqueIds: [palmMuteTechniqueId, alternatePickingTechniqueId],
    };
    component.addSelectedMusic(editedMusic);

    expect(createMusic).toHaveBeenCalledWith({
      title: 'Enter Sandman',
      artist: 'Metallica',
      album: 'Metallica (Remastered)',
      genre: 'Metal',
      musical_key: 'Mi menor',
      capo: 0,
      tuning: 'E Standard',
      bpm: 124,
      difficulty: 'advanced',
      cover_image_url: 'https://images.example.com/enter-sandman.jpg',
      duration_seconds: 331,
      provider: 'apple_music',
      provider_track_id: '1571968519',
      preview_url: 'https://audio.example.com/enter-sandman.m4a',
      external_url: 'https://music.apple.com/br/song/enter-sandman',
      learning_status: 'new',
      target_bpm: 124,
      priority: 0,
    });
    expect(updateMusicTechniques).toHaveBeenCalledWith('song-id', {
      technique_ids: [palmMuteTechniqueId, alternatePickingTechniqueId],
    });
    expect(component.selectedMusic).toEqual(editedMusic);
    expect(component.isAdded).toBe(true);
    expect(navigate).toHaveBeenCalledWith(['/musics']);
  });

  it('should expose a conflict returned by the API without marking the music as added', () => {
    createMusic.mockReturnValueOnce(
      throwError(() => new ApiRequestError('Song already exists', 409)),
    );
    component.selectMusic(appleMusicResult);

    component.addSelectedMusic(component.selectedMusic!);
    fixture.detectChanges();

    expect(component.isAdded).toBe(false);
    expect(component.isAdding).toBe(false);
    expect(component.addMusicErrorMessage).toBe('Essa música já existe na sua biblioteca.');
    expect(navigate).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Essa música já existe na sua biblioteca.');
  });
});
