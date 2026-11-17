import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  switchMap,
  takeUntil,
} from 'rxjs';
import { SeoService } from '../../../../core/seo/seo.service';
import { ApiRequestError } from '../../../../core/http/api-request.error';
import { ToastrNotificationService } from '../../../../core/notifications/toastr-notification.service';
import { DashboardShell } from '../../../../shared/ui/dashboard-shell/dashboard-shell';
import { MusicSearchResults } from '../../components/music-search-results/music-search-results';
import { SelectedMusicDetail } from '../../components/selected-music-detail/selected-music-detail';
import { AppleMusicService } from '../../data-access/apple-music.service';
import {
  ApiSongDifficulty,
  AppleMusicSearchResult,
  CreateSongRequest,
  MusicSearchResult,
} from '../../models/add-music.models';
import { LibraryService } from '../../data-access/library.service';
import { TechniquesService } from '../../../techniques/data-access/techniques.service';
import { Technique } from '../../../techniques/models/technique.models';

type MusicCatalogSearchState =
  | { readonly status: 'idle' }
  | { readonly status: 'success'; readonly musics: readonly AppleMusicSearchResult[] }
  | { readonly status: 'error'; readonly message: string };

@Component({
  selector: 'app-add-music',
  imports: [DashboardShell, MusicSearchResults, SelectedMusicDetail],
  templateUrl: './add-music.html',
  styleUrl: './add-music.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddMusic implements OnInit, OnDestroy {
  private readonly _seoService = inject(SeoService);
  private readonly _libraryService = inject(LibraryService);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);
  private readonly _appleMusicService = inject(AppleMusicService);
  private readonly _router = inject(Router);
  private readonly _toastrNotificationService = inject(ToastrNotificationService);
  private readonly _techniquesService = inject(TechniquesService);
  private readonly _searchQuerySubject = new Subject<string>();
  private readonly _destroySubject = new Subject<void>();
  private _selectedMusic: MusicSearchResult | null = null;
  private _availableTechniques: readonly Technique[] = [];

  private _searchResults: readonly AppleMusicSearchResult[] = [];
  private _searchQuery = '';
  private _searchErrorMessage = '';
  private _previewErrorMessage = '';
  private _addMusicErrorMessage = '';
  private _techniqueErrorMessage = '';
  private _activePreviewMusicId: number | null = null;
  private _previewProgressPercentage = 0;
  private _previewRemainingSeconds = 0;
  private _isSearching = false;
  private _hasSearched = false;
  private _isPreviewStarting = false;
  private _isAdded = false;
  private _isAdding = false;
  private _isLoadingTechniques = false;
  private _isDestroyed = false;
  ngOnInit(): void {
    this._seoService.updateSeo({
      title: 'Adicionar música',
      description: 'Encontre uma nova música e adicione-a à sua biblioteca de prática no Lydian.',
      keywords: ['adicionar música', 'repertório', 'biblioteca musical', 'Lydian'],
    });
    this._observeSearchQueries();
    this._observePreviewState();
    this.loadTechniques();
  }

  ngOnDestroy(): void {
    this._isDestroyed = true;
    this._appleMusicService.stopPreview();
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  get searchResults(): readonly AppleMusicSearchResult[] {
    return this._searchResults;
  }

  get searchQuery(): string {
    return this._searchQuery;
  }

  get searchErrorMessage(): string {
    return this._searchErrorMessage;
  }

  get previewErrorMessage(): string {
    return this._previewErrorMessage;
  }

  get addMusicErrorMessage(): string {
    return this._addMusicErrorMessage;
  }

  get availableTechniques(): readonly Technique[] {
    return this._availableTechniques;
  }

  get techniqueErrorMessage(): string {
    return this._techniqueErrorMessage;
  }

  get isLoadingTechniques(): boolean {
    return this._isLoadingTechniques;
  }

  get activePreviewMusicId(): number | null {
    return this._activePreviewMusicId;
  }

  get previewProgressPercentage(): number {
    return this._previewProgressPercentage;
  }

  get previewRemainingSeconds(): number {
    return this._previewRemainingSeconds;
  }

  get isSearching(): boolean {
    return this._isSearching;
  }

  get hasSearched(): boolean {
    return this._hasSearched;
  }

  get selectedMusicId(): number | null {
    return this._selectedMusic?.id ?? null;
  }

  get selectedMusic(): MusicSearchResult | null {
    return this._selectedMusic;
  }

  get isAdded(): boolean {
    return this._isAdded;
  }

  get isAdding(): boolean {
    return this._isAdding;
  }

  public addSelectedMusic(music: MusicSearchResult): void {
    if (this._isAdding || this._isAdded) {
      return;
    }

    this._selectedMusic = music;
    this._isAdding = true;
    this._addMusicErrorMessage = '';
    const payload = this._createSongPayload(music);

    this._libraryService
      .createMusic(payload)
      .pipe(
        switchMap((response) =>
          this._libraryService
            .updateMusicTechniques(response.data.id, {
              technique_ids: music.techniqueIds ?? [],
            })
            .pipe(
              map(() => response),
              catchError(() => {
                this._toastrNotificationService.warning(
                  'A música foi salva, mas não foi possível associar as técnicas agora.',
                  'Técnicas pendentes',
                );
                return of(response);
              }),
            ),
        ),
        takeUntil(this._destroySubject),
      )
      .subscribe({
        next: () => {
          this._isAdded = true;
          this._toastrNotificationService.success(
            'A música foi adicionada à sua biblioteca.',
            'Música adicionada',
          );
          void this._router.navigate(['/musics']);
        },
        error: (error: unknown) => {
          this._isAdding = false;
          this._addMusicErrorMessage = this._getAddMusicErrorMessage(error);
          this._toastrNotificationService.error(
            this._addMusicErrorMessage,
            'Falha ao adicionar música',
          );
          this._changeDetectorRef.markForCheck();
        },
        complete: () => {
          this._isAdding = false;
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  public selectMusic(music: AppleMusicSearchResult): void {
    this._selectedMusic = {
      id: music.id,
      title: music.title,
      composer: music.artist,
      album: music.album,
      genre: music.genre,
      artworkUrl: music.artworkUrl,
      bpm: 72,
      key: 'Ré Bemol Maior',
      capo: 0,
      tuning: 'E Standard',
      difficulty: 'Intermediário',
      difficultyLevel: 2,
      techniques: [],
      techniqueIds: [],
      provider: 'apple_music',
      providerTrackId: String(music.id),
      ...(music.previewUrl ? { previewUrl: music.previewUrl } : {}),
      externalUrl: music.appleMusicUrl,
      ...(music.durationSeconds !== undefined ? { durationSeconds: music.durationSeconds } : {}),
    };
    this._isAdded = false;
    this._addMusicErrorMessage = '';
  }

  public updateSearchQuery(searchQuery: string): void {
    this._searchQuery = searchQuery;
    this._searchErrorMessage = '';
    this._previewErrorMessage = '';
    this._addMusicErrorMessage = '';
    this._isAdded = false;

    if (searchQuery.trim().length < 2) {
      this._clearSearchResults();
      this._appleMusicService.stopPreview();
    } else {
      this._isSearching = true;
      this._hasSearched = false;
    }

    this._searchQuerySubject.next(searchQuery);
  }

  public loadTechniques(): void {
    if (this._isLoadingTechniques) {
      return;
    }

    this._isLoadingTechniques = true;
    this._techniqueErrorMessage = '';
    this._techniquesService
      .getTechniques()
      .pipe(takeUntil(this._destroySubject))
      .subscribe({
        next: (response) => {
          this._availableTechniques = response.data;
        },
        error: () => {
          this._techniqueErrorMessage = 'Não foi possível carregar o catálogo de técnicas.';
          this._toastrNotificationService.error(this._techniqueErrorMessage, 'Falha nas técnicas');
          this._isLoadingTechniques = false;
          this._changeDetectorRef.markForCheck();
        },
        complete: () => {
          this._isLoadingTechniques = false;
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  public reloadTechniques(): void {
    this._techniquesService.clearCatalogCache();
    this.loadTechniques();
  }

  public async togglePreview(music: AppleMusicSearchResult): Promise<void> {
    if (this._isPreviewStarting) {
      return;
    }

    if (!music.previewUrl) {
      this._previewErrorMessage = `A prévia de “${music.title}” não está disponível.`;
      return;
    }

    this.selectMusic(music);
    const wasPlaying = this._activePreviewMusicId === music.id;
    this._isPreviewStarting = true;
    this._previewErrorMessage = '';
    const didStart = await this._appleMusicService.togglePreview(music);
    this._isPreviewStarting = false;

    if (this._isDestroyed) {
      return;
    }

    if (!didStart && !wasPlaying) {
      this._previewErrorMessage = 'Não foi possível reproduzir esta prévia. Tente outra música.';
    }

    this._changeDetectorRef.markForCheck();
  }

  private _observeSearchQueries(): void {
    this._searchQuerySubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((searchQuery) => {
          const normalizedSearchQuery = searchQuery.trim();

          if (normalizedSearchQuery.length < 2) {
            return of<MusicCatalogSearchState>({ status: 'idle' });
          }

          return this._appleMusicService.searchSongs(normalizedSearchQuery).pipe(
            map(
              (musics): MusicCatalogSearchState => ({
                status: 'success',
                musics,
              }),
            ),
            catchError((error: unknown) =>
              of<MusicCatalogSearchState>({
                status: 'error',
                message: this._getSearchErrorMessage(error),
              }),
            ),
          );
        }),
        takeUntil(this._destroySubject),
      )
      .subscribe({
        next: (searchState) => {
          this._applySearchState(searchState);
          this._changeDetectorRef.markForCheck();
        },
        error: () => {
          this._isSearching = false;
          this._searchErrorMessage = 'Não foi possível concluir a busca no catálogo.';
          this._changeDetectorRef.markForCheck();
        },
        complete: () => {
          this._isSearching = false;
        },
      });
  }

  private _observePreviewState(): void {
    this._appleMusicService.activePreviewMusicId$.pipe(takeUntil(this._destroySubject)).subscribe({
      next: (musicId) => {
        this._activePreviewMusicId = musicId;
        this._changeDetectorRef.markForCheck();
      },
      error: () => {
        this._activePreviewMusicId = null;
      },
      complete: () => {
        this._activePreviewMusicId = null;
      },
    });

    this._appleMusicService.previewProgress$.pipe(takeUntil(this._destroySubject)).subscribe({
      next: (previewProgress) => {
        this._previewProgressPercentage = previewProgress.progressPercentage;
        this._previewRemainingSeconds = previewProgress.remainingSeconds;
        this._changeDetectorRef.markForCheck();
      },
      error: () => {
        this._resetPreviewProgress();
      },
      complete: () => {
        this._resetPreviewProgress();
      },
    });
  }

  private _resetPreviewProgress(): void {
    this._previewProgressPercentage = 0;
    this._previewRemainingSeconds = 0;
  }

  private _applySearchState(searchState: MusicCatalogSearchState): void {
    this._isSearching = false;

    if (searchState.status === 'idle') {
      this._clearSearchResults();
      return;
    }

    this._hasSearched = true;

    if (searchState.status === 'error') {
      this._searchResults = [];
      this._searchErrorMessage = searchState.message;
      this._toastrNotificationService.error(searchState.message, 'Falha na busca');
      return;
    }

    this._searchResults = searchState.musics;
    this._searchErrorMessage = '';

    if (searchState.musics.length === 0) {
      this._selectedMusic = null;
      this._isAdded = false;
      return;
    }

    const selectedMusicIsVisible = searchState.musics.some(
      (music) => music.id === this._selectedMusic?.id,
    );

    if (!selectedMusicIsVisible) {
      this.selectMusic(searchState.musics[0]);
    }
  }

  private _clearSearchResults(): void {
    this._searchResults = [];
    this._searchErrorMessage = '';
    this._isSearching = false;
    this._hasSearched = false;
  }

  private _getSearchErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Não foi possível concluir a busca no catálogo.';
    }

    const messagesByStatus: Record<number, string> = {
      0: 'Não foi possível conectar ao catálogo da Apple Music.',
      403: 'A Apple Music recusou esta busca. Tente novamente mais tarde.',
      404: 'O catálogo da Apple Music não foi encontrado.',
      429: 'Muitas buscas em sequência. Aguarde um momento e tente novamente.',
      500: 'A Apple Music está temporariamente indisponível.',
    };

    return messagesByStatus[error.status] ?? 'Não foi possível concluir a busca no catálogo.';
  }

  private _createSongPayload(music: MusicSearchResult): CreateSongRequest {
    const album = music.album?.trim();
    const genre = music.genre?.trim();
    const musicalKey = music.key.trim();
    const tuning = music.tuning.trim();
    const coverImageUrl = music.artworkUrl.trim();
    const previewUrl = music.previewUrl?.trim();
    const externalUrl = music.externalUrl?.trim();
    const providerTrackId = music.providerTrackId?.trim();

    const payload: CreateSongRequest = {
      title: music.title.trim(),
      artist: music.composer.trim(),
      bpm: music.bpm,
      capo: music.capo,
      difficulty: this._mapDifficulty(music.difficultyLevel),
      learning_status: 'new',
      target_bpm: music.bpm,
      priority: 0,
      ...(album ? { album } : {}),
      ...(genre ? { genre } : {}),
      ...(musicalKey ? { musical_key: musicalKey } : {}),
      ...(tuning ? { tuning } : {}),
      ...(coverImageUrl ? { cover_image_url: coverImageUrl } : {}),
      ...(music.durationSeconds !== undefined ? { duration_seconds: music.durationSeconds } : {}),
      ...(music.provider ? { provider: music.provider } : {}),
      ...(providerTrackId ? { provider_track_id: providerTrackId } : {}),
      ...(previewUrl ? { preview_url: previewUrl } : {}),
      ...(externalUrl ? { external_url: externalUrl } : {}),
    };

    return payload;
  }

  private _mapDifficulty(difficultyLevel: number): ApiSongDifficulty {
    const difficultyByLevel: Record<number, ApiSongDifficulty> = {
      1: 'beginner',
      2: 'intermediate',
      3: 'advanced',
    };

    return difficultyByLevel[difficultyLevel] ?? 'intermediate';
  }

  private _getAddMusicErrorMessage(error: unknown): string {
    if (!(error instanceof ApiRequestError)) {
      return 'Não foi possível adicionar a música. Tente novamente.';
    }

    if (error.statusCode === 400) {
      return 'A API recusou algum metadado da música. Revise os campos e tente novamente.';
    }

    if (error.statusCode === 401) {
      return 'Sua sessão expirou. Entre novamente para adicionar a música.';
    }

    if (error.statusCode === 403) {
      return 'Sua sessão não possui permissão para adicionar músicas.';
    }

    if (error.statusCode === 409) {
      return 'Essa música já existe na sua biblioteca.';
    }

    if (error.statusCode === 500) {
      return 'A API encontrou um erro ao salvar a música. Tente novamente em instantes.';
    }

    return error.message || 'Não foi possível adicionar a música. Tente novamente.';
  }
}
