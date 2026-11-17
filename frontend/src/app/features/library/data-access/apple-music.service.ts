import { isPlatformBrowser } from '@angular/common';
import { HttpBackend, HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
import { AppleMusicPreviewProgress, AppleMusicSearchResult } from '../models/add-music.models';

interface AppleMusicSearchResponse {
  readonly resultCount: number;
  readonly results: readonly AppleMusicTrackResponse[];
}

interface AppleMusicTrackResponse {
  readonly kind?: string;
  readonly trackId?: number;
  readonly trackName?: string;
  readonly artistName?: string;
  readonly collectionName?: string;
  readonly primaryGenreName?: string;
  readonly artworkUrl100?: string;
  readonly previewUrl?: string;
  readonly trackViewUrl?: string;
  readonly trackTimeMillis?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AppleMusicService {
  private static readonly _searchApiUrl = 'https://itunes.apple.com/search';
  private static readonly _minimumSearchLength = 2;

  private readonly _platformId = inject(PLATFORM_ID);
  // The global auth interceptor enables credentials for the Lydian API. Apple exposes a
  // wildcard CORS policy, so this third-party client intentionally bypasses that interceptor.
  private readonly _httpClient = new HttpClient(inject(HttpBackend));
  private readonly _activePreviewMusicIdSubject = new BehaviorSubject<number | null>(null);
  private readonly _previewProgressSubject = new BehaviorSubject<AppleMusicPreviewProgress>({
    musicId: null,
    progressPercentage: 0,
    remainingSeconds: 0,
  });
  private _previewAudio?: HTMLAudioElement;
  private _playbackVersion = 0;

  readonly activePreviewMusicId$: Observable<number | null> =
    this._activePreviewMusicIdSubject.asObservable();
  readonly previewProgress$: Observable<AppleMusicPreviewProgress> =
    this._previewProgressSubject.asObservable();

  public searchSongs(searchTerm: string): Observable<readonly AppleMusicSearchResult[]> {
    const normalizedSearchTerm = searchTerm.trim();

    if (normalizedSearchTerm.length < AppleMusicService._minimumSearchLength) {
      return of([]);
    }

    const params = new HttpParams()
      .set('term', normalizedSearchTerm)
      .set('country', 'br')
      .set('media', 'music')
      .set('entity', 'song')
      .set('limit', 20);

    return this._httpClient
      .get<AppleMusicSearchResponse>(AppleMusicService._searchApiUrl, { params })
      .pipe(map((response) => this._mapSearchResults(response.results)));
  }

  public async togglePreview(music: AppleMusicSearchResult): Promise<boolean> {
    if (!isPlatformBrowser(this._platformId) || !music.previewUrl) {
      return false;
    }

    if (this._activePreviewMusicIdSubject.value === music.id && this._previewAudio) {
      this.stopPreview();
      return false;
    }

    this.stopPreview();
    const playbackVersion = this._playbackVersion;
    const previewAudio = new Audio(music.previewUrl);
    previewAudio.preload = 'none';
    this._previewAudio = previewAudio;

    previewAudio.onended = () => this._finishPreview(previewAudio);
    previewAudio.onerror = () => this._finishPreview(previewAudio);
    previewAudio.ontimeupdate = () => this._updatePreviewProgress(music.id, previewAudio);

    try {
      await previewAudio.play();
    } catch {
      this._finishPreview(previewAudio);
      return false;
    }

    if (playbackVersion !== this._playbackVersion || this._previewAudio !== previewAudio) {
      this._releaseAudio(previewAudio);
      return false;
    }

    this._activePreviewMusicIdSubject.next(music.id);
    this._updatePreviewProgress(music.id, previewAudio);
    return true;
  }

  public stopPreview(): void {
    this._playbackVersion += 1;
    const previewAudio = this._previewAudio;
    this._previewAudio = undefined;

    if (previewAudio) {
      this._releaseAudio(previewAudio);
    }

    if (this._activePreviewMusicIdSubject.value !== null) {
      this._activePreviewMusicIdSubject.next(null);
    }

    this._resetPreviewProgress();
  }

  private _mapSearchResults(
    tracks: readonly AppleMusicTrackResponse[],
  ): readonly AppleMusicSearchResult[] {
    return tracks.reduce<AppleMusicSearchResult[]>((results, track) => {
      if (
        track.kind !== 'song' ||
        track.trackId === undefined ||
        !track.trackName ||
        !track.artistName ||
        !track.artworkUrl100 ||
        !track.trackViewUrl
      ) {
        return results;
      }

      const durationSeconds = this._resolveDurationSeconds(track.trackTimeMillis);

      results.push({
        id: track.trackId,
        title: track.trackName,
        artist: track.artistName,
        album: track.collectionName ?? 'Single',
        genre: track.primaryGenreName?.trim() || undefined,
        artworkUrl: this._secureUrl(track.artworkUrl100).replace('100x100bb', '300x300bb'),
        previewUrl: track.previewUrl ? this._secureUrl(track.previewUrl) : null,
        appleMusicUrl: this._secureUrl(track.trackViewUrl),
        ...(durationSeconds !== undefined ? { durationSeconds } : {}),
      });

      return results;
    }, []);
  }

  private _secureUrl(url: string): string {
    return url.replace(/^http:\/\//, 'https://');
  }

  private _resolveDurationSeconds(trackTimeMillis?: number): number | undefined {
    if (!Number.isFinite(trackTimeMillis) || !trackTimeMillis || trackTimeMillis < 0) {
      return undefined;
    }

    return Math.round(trackTimeMillis / 1000);
  }

  private _finishPreview(previewAudio: HTMLAudioElement): void {
    if (this._previewAudio !== previewAudio) {
      return;
    }

    this._previewAudio = undefined;
    this._releaseAudio(previewAudio);
    this._activePreviewMusicIdSubject.next(null);
    this._resetPreviewProgress();
  }

  private _releaseAudio(previewAudio: HTMLAudioElement): void {
    previewAudio.onended = null;
    previewAudio.onerror = null;
    previewAudio.ontimeupdate = null;
    previewAudio.pause();
    previewAudio.removeAttribute('src');
  }

  private _updatePreviewProgress(musicId: number, previewAudio: HTMLAudioElement): void {
    if (this._previewAudio !== previewAudio) {
      return;
    }

    const durationSeconds =
      Number.isFinite(previewAudio.duration) && previewAudio.duration > 0
        ? previewAudio.duration
        : 0;
    const elapsedSeconds = Number.isFinite(previewAudio.currentTime)
      ? Math.max(0, previewAudio.currentTime)
      : 0;
    const progressPercentage =
      durationSeconds > 0 ? Math.min(100, (elapsedSeconds / durationSeconds) * 100) : 0;
    const remainingSeconds =
      durationSeconds > 0 ? Math.max(0, Math.ceil(durationSeconds - elapsedSeconds)) : 0;

    this._previewProgressSubject.next({
      musicId,
      progressPercentage,
      remainingSeconds,
    });
  }

  private _resetPreviewProgress(): void {
    this._previewProgressSubject.next({
      musicId: null,
      progressPercentage: 0,
      remainingSeconds: 0,
    });
  }
}
