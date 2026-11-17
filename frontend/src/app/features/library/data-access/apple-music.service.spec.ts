import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { AppleMusicPreviewProgress, AppleMusicSearchResult } from '../models/add-music.models';
import { AppleMusicService } from './apple-music.service';

describe('AppleMusicService', () => {
  let service: AppleMusicService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AppleMusicService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    service.stopPreview();
    httpTestingController.verify();
    vi.unstubAllGlobals();
  });

  it('should search the Brazilian Apple catalog and map song previews', () => {
    let receivedMusics: readonly AppleMusicSearchResult[] = [];

    service.searchSongs('Metallica').subscribe({
      next: (musics) => {
        receivedMusics = musics;
      },
      error: () => undefined,
      complete: () => undefined,
    });

    const request = httpTestingController.expectOne(
      (httpRequest) => httpRequest.url === 'https://itunes.apple.com/search',
    );
    expect(request.request.withCredentials).toBe(false);
    expect(request.request.params.get('term')).toBe('Metallica');
    expect(request.request.params.get('country')).toBe('br');
    expect(request.request.params.get('entity')).toBe('song');

    request.flush({
      resultCount: 1,
      results: [
        {
          kind: 'song',
          trackId: 1571968519,
          trackName: 'Enter Sandman',
          artistName: 'Metallica',
          collectionName: 'Metallica (Remastered)',
          primaryGenreName: 'Metal',
          artworkUrl100: 'http://images.example.com/100x100bb.jpg',
          previewUrl: 'http://audio.example.com/preview.m4a',
          trackViewUrl: 'http://music.apple.com/br/song/enter-sandman',
          trackTimeMillis: 331200,
        },
      ],
    });

    expect(receivedMusics).toEqual([
      {
        id: 1571968519,
        title: 'Enter Sandman',
        artist: 'Metallica',
        album: 'Metallica (Remastered)',
        genre: 'Metal',
        artworkUrl: 'https://images.example.com/300x300bb.jpg',
        previewUrl: 'https://audio.example.com/preview.m4a',
        appleMusicUrl: 'https://music.apple.com/br/song/enter-sandman',
        durationSeconds: 331,
      },
    ]);
  });

  it('should not call the catalog for a search shorter than two characters', () => {
    service.searchSongs('M').subscribe({
      next: (musics) => expect(musics).toEqual([]),
      error: () => undefined,
      complete: () => undefined,
    });

    httpTestingController.expectNone('https://itunes.apple.com/search');
  });

  it('should toggle a playable preview', async () => {
    const play = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const pause = vi.fn<() => void>();
    let createdAudio: FakeAudio | undefined;

    class FakeAudio {
      preload = '';
      currentTime = 0;
      duration = 30;
      onended: (() => void) | null = null;
      onerror: (() => void) | null = null;
      ontimeupdate: (() => void) | null = null;

      constructor(readonly src: string) {
        createdAudio = this;
      }

      play = play;
      pause = pause;
      removeAttribute(): void {}
    }

    vi.stubGlobal('Audio', FakeAudio);
    const music: AppleMusicSearchResult = {
      id: 1,
      title: 'Enter Sandman',
      artist: 'Metallica',
      album: 'Metallica',
      artworkUrl: 'https://images.example.com/cover.jpg',
      previewUrl: 'https://audio.example.com/preview.m4a',
      appleMusicUrl: 'https://music.apple.com/br/song/enter-sandman',
    };
    let previewProgress: AppleMusicPreviewProgress | undefined;
    const progressSubscription = service.previewProgress$.subscribe({
      next: (progress) => {
        previewProgress = progress;
      },
      error: () => undefined,
      complete: () => undefined,
    });

    await expect(service.togglePreview(music)).resolves.toBe(true);
    expect(createdAudio).toBeDefined();
    createdAudio!.currentTime = 12;
    createdAudio!.ontimeupdate?.();

    expect(previewProgress).toEqual({
      musicId: music.id,
      progressPercentage: 40,
      remainingSeconds: 18,
    });

    await expect(service.togglePreview(music)).resolves.toBe(false);

    expect(play).toHaveBeenCalledOnce();
    expect(pause).toHaveBeenCalled();
    expect(previewProgress).toEqual({
      musicId: null,
      progressPercentage: 0,
      remainingSeconds: 0,
    });
    progressSubscription.unsubscribe();
  });
});
