import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { vi } from 'vitest';

import { LibraryService } from '../../data-access/library.service';
import { SongResponse, SongsListResponse } from '../../models/add-music.models';
import { Musics } from './musics';

describe('Musics', () => {
  let component: Musics;
  let fixture: ComponentFixture<Musics>;
  let musicLibraryRequest$: Subject<SongsListResponse>;
  const getMusicLibrary = vi.fn();
  const apiMusic: SongResponse = {
    id: 'a2577370-af8e-4fd9-a4a8-930a0c9a5d62',
    user_id: '74c4b0fc-5e3b-48e5-8a5c-91f73b3af7bd',
    title: 'Enter Sandman',
    artist: 'Metallica',
    album: 'Metallica (Remastered)',
    genre: null,
    musical_key: 'Mi menor',
    capo: null,
    tuning: null,
    bpm: 124,
    difficulty: 'advanced',
    spotify_track_id: null,
    spotify_preview_url: null,
    spotify_external_url: null,
    cover_image_url: 'https://images.example.com/enter-sandman.jpg',
    notes: 'Técnicas em foco: Palm Mute, Alternate Picking',
    duration_seconds: 331,
    provider: 'apple_music',
    provider_track_id: '1571968519',
    preview_url: 'https://audio.example.com/enter-sandman.m4a',
    external_url: 'https://music.apple.com/br/song/enter-sandman',
    learning_status: 'learning',
    target_bpm: 132,
    priority: 4,
    last_practiced_at: '2026-09-29T12:00:00.000Z',
    created_at: '2026-08-20T17:00:00.000Z',
    updated_at: '2026-08-20T17:00:00.000Z',
    deleted_at: null,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    musicLibraryRequest$ = new Subject<SongsListResponse>();
    getMusicLibrary.mockReturnValue(musicLibraryRequest$.asObservable());

    await TestBed.configureTestingModule({
      imports: [Musics],
      providers: [
        {
          provide: LibraryService,
          useValue: {
            getMusicLibrary,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Musics);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the skeleton while the music request is pending', () => {
    const sections = fixture.nativeElement.querySelectorAll('#musics-page > section');

    expect(component.isLoading).toBe(true);
    expect(sections.length).toBe(1);
    expect(fixture.nativeElement.querySelector('app-content-skeleton-loading')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#musics-library-section')).toBeNull();
    expect(sections[0].querySelector('.container > .row > [class*="col-12"]')).toBeTruthy();
    expect(getMusicLibrary).toHaveBeenCalledWith({
      page: 1,
      limit: 12,
      sort_by: 'updated_at',
      sort_order: 'desc',
    });
  });

  it('should keep every page section on the Bootstrap page grid', () => {
    completeMusicRequest();

    const sections = fixture.nativeElement.querySelectorAll('#musics-page > section');

    expect(sections.length).toBe(3);
    sections.forEach((section: HTMLElement) => {
      expect(section.querySelector('.container > .row > [class*="col-12"]')).toBeTruthy();
    });
    expect(fixture.nativeElement.querySelector('#musics-page section section')).toBeNull();
  });

  it('should classify API songs without progress as learning', () => {
    completeMusicRequest();
    component.selectFilter('learning');

    expect(component.visibleMusics).toHaveLength(1);
    expect(component.visibleMusics[0].status).toBe('learning');
  });

  it('should adapt the API response to every field consumed by the library card', () => {
    completeMusicRequest();

    expect(component.visibleMusics[0]).toEqual({
      id: apiMusic.id,
      title: 'Enter Sandman',
      composer: 'Metallica',
      artworkUrl: 'https://images.example.com/enter-sandman.jpg',
      bpm: 124,
      targetBpm: 132,
      durationSeconds: 331,
      difficulty: 'Difícil',
      status: 'learning',
      priority: 4,
      lastPracticedAt: '2026-09-29T12:00:00.000Z',
      technicalFocus: 'Técnicas em foco: Palm Mute, Alternate Picking',
    });

    const card: HTMLElement = fixture.nativeElement.querySelector('app-music-library-card');

    expect(card.querySelector('h2')?.textContent).toContain('Enter Sandman');
    expect(card.querySelector('.music-card-heading-custom p')?.textContent).toContain('Metallica');
    expect(card.textContent).toContain('124 BPM');
    expect(card.textContent).toContain('Difícil');
    expect(card.textContent).toContain('Aprendendo');
    expect(card.textContent).toContain('132 BPM alvo');
  });

  it('should map every API difficulty to the existing Design System labels', () => {
    completeMusicRequest([
      { ...apiMusic, id: 'beginner-id', difficulty: 'beginner' },
      { ...apiMusic, id: 'intermediate-id', difficulty: 'intermediate' },
      { ...apiMusic, id: 'advanced-id', difficulty: 'advanced' },
    ]);

    expect(component.visibleMusics.map((music) => music.difficulty)).toEqual([
      'Fácil',
      'Médio',
      'Difícil',
    ]);
  });

  it('should keep the card usable when optional API metadata is absent', () => {
    completeMusicRequest([
      {
        ...apiMusic,
        bpm: null,
        difficulty: null,
        cover_image_url: null,
        notes: null,
      },
    ]);

    expect(component.visibleMusics[0]).toMatchObject({
      artworkUrl: '/images/music-cover-placeholder.svg',
      bpm: 0,
      difficulty: 'Médio',
      technicalFocus: undefined,
    });
    expect(fixture.nativeElement.textContent).toContain('— BPM');
  });

  it('should normalize an insecure API cover URL before rendering the card', () => {
    completeMusicRequest([
      {
        ...apiMusic,
        cover_image_url: '  http://images.example.com/enter-sandman.jpg  ',
      },
    ]);

    expect(component.visibleMusics[0].artworkUrl).toBe(
      'https://images.example.com/enter-sandman.jpg',
    );
  });

  it('should use the API metadata to paginate the full library', () => {
    completeMusicRequest([apiMusic], { page: 1, limit: 12, total: 25 });

    expect(component.musicCount).toBe(25);
    expect(component.currentPage).toBe(1);
    expect(fixture.nativeElement.querySelector('app-pagination')).toBeTruthy();

    musicLibraryRequest$ = new Subject<SongsListResponse>();
    getMusicLibrary.mockReturnValue(musicLibraryRequest$.asObservable());
    component.selectPage(2);

    expect(getMusicLibrary).toHaveBeenLastCalledWith({
      page: 2,
      limit: 12,
      sort_by: 'updated_at',
      sort_order: 'desc',
    });
    expect(component.isLoading).toBe(true);
  });

  function completeMusicRequest(
    musics: readonly SongResponse[] = [apiMusic],
    meta = { page: 1, limit: 12, total: musics.length },
  ): void {
    musicLibraryRequest$.next({
      data: musics,
      meta,
    });
    musicLibraryRequest$.complete();
    fixture.detectChanges();
  }
});
