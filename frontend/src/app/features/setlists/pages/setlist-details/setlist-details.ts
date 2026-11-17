import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { ApiRequestError } from '../../../../core/http/api-request.error';
import { SeoService } from '../../../../core/seo/seo.service';
import { ToastrNotificationService } from '../../../../core/notifications/toastr-notification.service';
import { ContentSkeletonLoading } from '../../../../shared/ui/content-skeleton-loading/content-skeleton-loading';
import { ConfirmationModal } from '../../../../shared/ui/confirmation-modal/confirmation-modal';
import { DashboardShell } from '../../../../shared/ui/dashboard-shell/dashboard-shell';
import {
  ContentViewMode,
  ViewModeToggle,
} from '../../../../shared/ui/view-mode-toggle/view-mode-toggle';
import { MusicLibraryCard } from '../../../library/components/music-library-card/music-library-card';
import { LibraryService } from '../../../library/data-access/library.service';
import { ApiSongDifficulty, SongResponse } from '../../../library/models/add-music.models';
import { LibraryMusic, MusicDifficulty } from '../../../library/models/musics.models';
import { SetlistDetailsHero } from '../../components/setlist-details-hero/setlist-details-hero';
import { EditSetlistPanel } from '../../components/edit-setlist-panel/edit-setlist-panel';
import { SetlistMusicPicker } from '../../components/setlist-music-picker/setlist-music-picker';
import { SetlistTrackControls } from '../../components/setlist-track-controls/setlist-track-controls';
import { SetlistService } from '../../data-access/setlist.service';
import {
  SetlistDetailsData,
  SetlistEditValue,
  SetlistTrackItem,
} from '../../models/setlist-details.models';
import { SetlistDetailResponse, SetlistSongApiResponse } from '../../models/setlist.models';

@Component({
  selector: 'app-setlist-details',
  imports: [
    DashboardShell,
    ContentSkeletonLoading,
    SetlistDetailsHero,
    EditSetlistPanel,
    SetlistMusicPicker,
    SetlistTrackControls,
    MusicLibraryCard,
    ViewModeToggle,
    ConfirmationModal,
  ],
  templateUrl: './setlist-details.html',
  styleUrl: './setlist-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetlistDetails implements OnInit, OnDestroy {
  private readonly _seoService = inject(SeoService);
  private readonly _setlistService = inject(SetlistService);
  private readonly _libraryService = inject(LibraryService);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _toastrNotificationService = inject(ToastrNotificationService);
  private readonly _destroySubject = new Subject<void>();
  private readonly _setlistId = this._activatedRoute.snapshot.paramMap.get('id') ?? '';
  private _setlist: SetlistDetailsData | null = null;
  private _tracks: readonly SetlistTrackItem[] = [];
  private _libraryMusics: readonly LibraryMusic<string>[] = [];
  private _isMusicPickerOpen = false;
  private _isEditPanelOpen = false;
  private _isUpdatingSetlist = false;
  private _updateSetlistErrorMessage = '';
  private _savingTrackId: string | null = null;
  private _isLoading = false;
  private _isAddingMusic = false;
  private _isDeletingSetlist = false;
  private _isDeleteSetlistConfirmationOpen = false;
  private _musicPendingRemovalId: string | null = null;
  private _removingMusicId: string | null = null;
  private _errorMessage = '';
  private _addMusicErrorMessage = '';
  private _deleteSetlistErrorMessage = '';
  private _removeMusicErrorMessage = '';
  private _viewMode: ContentViewMode = 'grid';

  ngOnInit(): void {
    this._seoService.updateSeo({
      title: 'Detalhes do setlist',
      description: 'Músicas e organização do setlist no Lydian.',
      keywords: ['setlist', 'ordem das músicas', 'show', 'repertório', 'Lydian'],
    });
    this._loadSetlistDetails();
  }

  ngOnDestroy(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  get setlist(): SetlistDetailsData | null {
    return this._setlist;
  }

  get selectedMusics(): readonly LibraryMusic<string>[] {
    return this._tracks.map((track) => track.song);
  }

  get tracks(): readonly SetlistTrackItem[] {
    return this._tracks;
  }

  get availableMusics(): readonly LibraryMusic<string>[] {
    const selectedMusicIds = new Set(this._tracks.map((track) => track.song.id));
    return this._libraryMusics.filter((music) => !selectedMusicIds.has(music.id));
  }

  get isMusicPickerOpen(): boolean {
    return this._isMusicPickerOpen;
  }

  get isEditPanelOpen(): boolean {
    return this._isEditPanelOpen;
  }

  get isUpdatingSetlist(): boolean {
    return this._isUpdatingSetlist;
  }

  get updateSetlistErrorMessage(): string {
    return this._updateSetlistErrorMessage;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get isAddingMusic(): boolean {
    return this._isAddingMusic;
  }

  get errorMessage(): string {
    return this._errorMessage;
  }

  get addMusicErrorMessage(): string {
    return this._addMusicErrorMessage;
  }

  get isDeletingSetlist(): boolean {
    return this._isDeletingSetlist;
  }

  get isDeleteSetlistConfirmationOpen(): boolean {
    return this._isDeleteSetlistConfirmationOpen;
  }

  get musicPendingRemovalId(): string | null {
    return this._musicPendingRemovalId;
  }

  get musicPendingRemoval(): LibraryMusic<string> | null {
    if (!this._musicPendingRemovalId) {
      return null;
    }

    return (
      this._tracks.find((track) => track.song.id === this._musicPendingRemovalId)?.song ?? null
    );
  }

  get removeMusicErrorMessage(): string {
    return this._removeMusicErrorMessage;
  }

  get deleteSetlistErrorMessage(): string {
    return this._deleteSetlistErrorMessage;
  }

  get viewMode(): ContentViewMode {
    return this._viewMode;
  }

  get estimatedDuration(): string {
    const totalSeconds = this._tracks.reduce(
      (total, track) => total + (track.song.durationSeconds ?? 0),
      0,
    );
    if (this._tracks.length === 0) {
      return '0 min';
    }
    if (totalSeconds <= 0) {
      return 'Não informada';
    }
    const totalMinutes = Math.ceil(totalSeconds / 60);
    if (totalMinutes < 60) {
      return `${totalMinutes} min`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  }

  public openMusicPicker(): void {
    this._addMusicErrorMessage = '';
    this._isMusicPickerOpen = true;
  }

  public openEditPanel(): void {
    this._updateSetlistErrorMessage = '';
    this._isEditPanelOpen = true;
  }

  public closeEditPanel(): void {
    if (this._isUpdatingSetlist) {
      return;
    }
    this._isEditPanelOpen = false;
    this._updateSetlistErrorMessage = '';
  }

  public updateSetlist(value: SetlistEditValue): void {
    if (this._isUpdatingSetlist || !this._setlistId) {
      return;
    }
    this._isUpdatingSetlist = true;
    this._updateSetlistErrorMessage = '';
    this._setlistService
      .updateSetlist(this._setlistId, {
        name: value.name.trim(),
        description: value.description.trim(),
        visibility: value.visibility,
      })
      .pipe(takeUntil(this._destroySubject))
      .subscribe({
        next: (response) => {
          if (this._setlist) {
            this._setlist = {
              ...this._setlist,
              title: response.data.name,
              description: response.data.description?.trim() || 'Setlist sem descrição.',
              visibility: response.data.visibility,
            };
          }
          this._isEditPanelOpen = false;
          this._toastrNotificationService.success(
            'As informações foram atualizadas.',
            'Setlist salvo',
          );
        },
        error: (error: unknown) => {
          this._isUpdatingSetlist = false;
          this._updateSetlistErrorMessage = this._getUpdateErrorMessage(error);
          this._toastrNotificationService.error(
            this._updateSetlistErrorMessage,
            'Falha ao editar setlist',
          );
          this._changeDetectorRef.markForCheck();
        },
        complete: () => {
          this._isUpdatingSetlist = false;
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  public closeMusicPicker(): void {
    if (this._isAddingMusic) {
      return;
    }

    this._isMusicPickerOpen = false;
    this._addMusicErrorMessage = '';
  }

  public addMusic(musicId: string): void {
    if (this._isAddingMusic || this._savingTrackId || this._removingMusicId || !this._setlistId) {
      return;
    }

    const selectedMusic = this._libraryMusics.find((music) => music.id === musicId);
    if (!selectedMusic) {
      this._addMusicErrorMessage = 'A música selecionada não está mais disponível.';
      return;
    }

    this._isAddingMusic = true;
    this._addMusicErrorMessage = '';
    this._setlistService
      .addSong(this._setlistId, { song_id: musicId })
      .pipe(takeUntil(this._destroySubject))
      .subscribe({
        next: (response) => {
          this._tracks = [
            ...this._tracks,
            {
              song: selectedMusic,
              position: response.data.position,
              notes: response.data.notes ?? '',
            },
          ];
          this._isMusicPickerOpen = false;
          this._toastrNotificationService.success(
            `${selectedMusic.title} entrou no repertório.`,
            'Música adicionada',
          );
        },
        error: (error: unknown) => {
          this._isAddingMusic = false;
          this._addMusicErrorMessage = this._getAddMusicErrorMessage(error);
          this._toastrNotificationService.error(
            this._addMusicErrorMessage,
            'Falha ao adicionar música',
          );
          this._changeDetectorRef.markForCheck();
        },
        complete: () => {
          this._isAddingMusic = false;
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  public requestMusicRemoval(musicId: string): void {
    if (this._removingMusicId) {
      return;
    }

    this._removeMusicErrorMessage = '';
    this._musicPendingRemovalId = musicId;
  }

  public cancelMusicRemoval(): void {
    if (this._removingMusicId) {
      return;
    }

    this._musicPendingRemovalId = null;
    this._removeMusicErrorMessage = '';
  }

  public removeMusic(musicId: string): void {
    if (this._removingMusicId || this._savingTrackId || this._isAddingMusic || !this._setlistId) {
      return;
    }

    this._removingMusicId = musicId;
    this._removeMusicErrorMessage = '';
    this._setlistService
      .removeSong(this._setlistId, musicId)
      .pipe(takeUntil(this._destroySubject))
      .subscribe({
        next: () => {
          this._tracks = this._tracks.filter((track) => track.song.id !== musicId);
          this._musicPendingRemovalId = null;
          this._toastrNotificationService.success(
            'A música foi removida do repertório.',
            'Música removida',
          );
        },
        error: (error: unknown) => {
          this._removingMusicId = null;
          this._removeMusicErrorMessage = this._getRemoveMusicErrorMessage(error);
          this._toastrNotificationService.error(
            this._removeMusicErrorMessage,
            'Falha ao remover música',
          );
          this._changeDetectorRef.markForCheck();
        },
        complete: () => {
          this._removingMusicId = null;
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  public isRemovingMusic(musicId: string): boolean {
    return this._removingMusicId === musicId;
  }

  public isSavingTrack(musicId: string): boolean {
    return this._savingTrackId === musicId;
  }

  public moveTrack(musicId: string, direction: -1 | 1): void {
    if (this._savingTrackId || this._isAddingMusic || this._removingMusicId || !this._setlistId) {
      return;
    }
    const currentIndex = this._tracks.findIndex((track) => track.song.id === musicId);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= this._tracks.length) {
      return;
    }
    const currentTrack = this._tracks[currentIndex];
    const targetTrack = this._tracks[targetIndex];
    const reorderedTracks = [...this._tracks];
    reorderedTracks[currentIndex] = targetTrack;
    reorderedTracks[targetIndex] = currentTrack;
    this._savingTrackId = musicId;
    this._setlistService
      .reorderSongs(
        this._setlistId,
        reorderedTracks.map((track) => track.song.id),
      )
      .pipe(takeUntil(this._destroySubject))
      .subscribe({
        next: () => {
          this._tracks = reorderedTracks.map((track, position) => ({ ...track, position }));
          this._toastrNotificationService.success(
            'A ordem do palco foi atualizada.',
            'Setlist reordenado',
          );
        },
        error: () => {
          this._savingTrackId = null;
          this._toastrNotificationService.error(
            'A ordem não pôde ser atualizada. O setlist será recarregado.',
            'Falha ao reordenar',
          );
          this._loadSetlistDetails();
        },
        complete: () => {
          this._savingTrackId = null;
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  public saveTrackNotes(musicId: string, notes: string): void {
    if (this._savingTrackId || this._isAddingMusic || this._removingMusicId || !this._setlistId) {
      return;
    }
    this._savingTrackId = musicId;
    this._setlistService
      .updateSong(this._setlistId, musicId, { notes })
      .pipe(takeUntil(this._destroySubject))
      .subscribe({
        next: () => {
          this._tracks = this._tracks.map((track) =>
            track.song.id === musicId ? { ...track, notes } : track,
          );
          this._toastrNotificationService.success(
            'A nota ficará disponível no Stage Mode.',
            'Nota salva',
          );
        },
        error: () => {
          this._savingTrackId = null;
          this._toastrNotificationService.error(
            'Não foi possível salvar a nota desta música.',
            'Falha ao salvar nota',
          );
          this._changeDetectorRef.markForCheck();
        },
        complete: () => {
          this._savingTrackId = null;
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  public requestSetlistDeletion(): void {
    if (this._isDeletingSetlist) {
      return;
    }

    this._deleteSetlistErrorMessage = '';
    this._isDeleteSetlistConfirmationOpen = true;
  }

  public cancelSetlistDeletion(): void {
    if (this._isDeletingSetlist) {
      return;
    }

    this._isDeleteSetlistConfirmationOpen = false;
    this._deleteSetlistErrorMessage = '';
  }

  public deleteSetlist(): void {
    if (this._isDeletingSetlist || !this._setlistId) {
      return;
    }

    this._isDeletingSetlist = true;
    this._deleteSetlistErrorMessage = '';
    this._setlistService
      .deleteSetlist(this._setlistId)
      .pipe(takeUntil(this._destroySubject))
      .subscribe({
        next: () => {
          this._toastrNotificationService.success(
            'O setlist foi excluído permanentemente.',
            'Setlist excluído',
          );
          void this._router.navigate(['/setlist']);
        },
        error: (error: unknown) => {
          this._isDeletingSetlist = false;
          this._deleteSetlistErrorMessage = this._getDeleteSetlistErrorMessage(error);
          this._toastrNotificationService.error(
            this._deleteSetlistErrorMessage,
            'Falha ao excluir setlist',
          );
          this._changeDetectorRef.markForCheck();
        },
        complete: () => {
          this._isDeletingSetlist = false;
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  public formatTrackOrder(order: number): string {
    return String(order + 1).padStart(2, '0');
  }

  public selectViewMode(viewMode: ContentViewMode): void {
    this._viewMode = viewMode;
  }

  public applyMusicColumnClass(): string {
    const gridClasses = this._viewMode === 'grid' ? ' col-md-6 col-xl-3' : '';
    return `col-12 d-flex${gridClasses}`;
  }

  public applyTrackClass(): string {
    return `setlist-track-custom setlist-track-custom--${this._viewMode}`;
  }

  public openStageMode(): void {
    void this._router.navigate(['/stage-mode', this._setlistId]);
  }

  private _loadSetlistDetails(): void {
    if (!this._setlistId) {
      this._errorMessage = 'Não foi possível identificar o setlist solicitado.';
      return;
    }

    this._isLoading = true;
    this._errorMessage = '';
    forkJoin({
      setlistResponse: this._setlistService.getSetlistDetails(this._setlistId),
      libraryResponse: this._libraryService.getMusicLibrary(),
    })
      .pipe(takeUntil(this._destroySubject))
      .subscribe({
        next: ({ setlistResponse, libraryResponse }) => {
          this._populateSetlist(setlistResponse.data);
          this._libraryMusics = libraryResponse.data.map((music) =>
            this._createLibraryMusic(music),
          );
        },
        error: (error: unknown) => {
          this._isLoading = false;
          this._errorMessage = this._getLoadErrorMessage(error);
          this._toastrNotificationService.error(this._errorMessage, 'Falha ao carregar setlist');
          this._changeDetectorRef.markForCheck();
        },
        complete: () => {
          this._isLoading = false;
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  private _populateSetlist(setlist: SetlistDetailResponse): void {
    this._setlist = {
      title: setlist.name,
      context: 'Repertório',
      description: setlist.description?.trim() || 'Setlist sem descrição.',
      eventDate: 'Data a definir',
      venue: 'Local a definir',
      visibility: setlist.visibility,
    };
    this._tracks = [...setlist.setlist_songs]
      .filter(({ songs }) => songs && !songs.deleted_at && songs.user_id === setlist.user_id)
      .sort((a, b) => a.position - b.position)
      .map((setlistSong) => ({
        song: this._createLibraryMusic(setlistSong.songs),
        position: setlistSong.position,
        notes: setlistSong.notes ?? '',
      }));
    this._seoService.updateSeo({
      title: setlist.name,
      description: `Músicas e organização do setlist ${setlist.name} no Lydian.`,
      keywords: ['setlist', 'ordem das músicas', 'show', 'repertório', 'Lydian'],
    });
  }

  private _createLibraryMusic(music: SongResponse | SetlistSongApiResponse): LibraryMusic<string> {
    return {
      id: music.id,
      title: music.title,
      composer: music.artist,
      artworkUrl: this._resolveArtworkUrl(music.cover_image_url),
      bpm: music.bpm ?? 0,
      difficulty: this._mapDifficulty(music.difficulty),
      masteryPercentage: 0,
      status: 'learning',
      technicalFocus: music.notes ?? undefined,
      durationSeconds: music.duration_seconds,
    };
  }

  private _resolveArtworkUrl(artworkUrl: string | null): string {
    const normalizedArtworkUrl = artworkUrl?.trim();
    return normalizedArtworkUrl
      ? normalizedArtworkUrl.replace(/^http:\/\//i, 'https://')
      : '/images/music-cover-placeholder.svg';
  }

  private _mapDifficulty(difficulty: ApiSongDifficulty | null): MusicDifficulty {
    const difficultyByApiValue: Record<ApiSongDifficulty, MusicDifficulty> = {
      beginner: 'Fácil',
      intermediate: 'Médio',
      advanced: 'Difícil',
    };
    return difficulty ? difficultyByApiValue[difficulty] : 'Médio';
  }

  private _getLoadErrorMessage(error: unknown): string {
    if (!(error instanceof ApiRequestError)) {
      return 'Não foi possível carregar os detalhes do setlist.';
    }
    if (error.statusCode === 404) {
      return 'O setlist solicitado não foi encontrado.';
    }
    if (error.statusCode === 401) {
      return 'Sua sessão expirou. Entre novamente para consultar este setlist.';
    }
    if (error.statusCode === 500) {
      return 'A API encontrou um erro ao carregar o setlist. Tente novamente em instantes.';
    }
    return error.message || 'Não foi possível carregar os detalhes do setlist.';
  }

  private _getUpdateErrorMessage(error: unknown): string {
    if (!(error instanceof ApiRequestError)) {
      return 'Não foi possível atualizar o setlist.';
    }
    if (error.statusCode === 404) {
      return 'O setlist solicitado não foi encontrado.';
    }
    if (error.statusCode === 401) {
      return 'Sua sessão expirou. Entre novamente para editar o setlist.';
    }
    return error.message || 'Não foi possível atualizar o setlist.';
  }

  private _getAddMusicErrorMessage(error: unknown): string {
    if (!(error instanceof ApiRequestError)) {
      return 'Não foi possível adicionar a música ao setlist.';
    }
    if (error.statusCode === 409) {
      return 'Esta música já está no setlist.';
    }
    if (error.statusCode === 404) {
      return 'O setlist ou a música selecionada não foi encontrado.';
    }
    if (error.statusCode === 401) {
      return 'Sua sessão expirou. Entre novamente para adicionar a música.';
    }
    return error.message || 'Não foi possível adicionar a música ao setlist.';
  }

  private _getRemoveMusicErrorMessage(error: unknown): string {
    if (!(error instanceof ApiRequestError)) {
      return 'Não foi possível remover a música do setlist.';
    }
    if (error.statusCode === 404) {
      return 'A música ou o setlist não foi encontrado.';
    }
    if (error.statusCode === 401) {
      return 'Sua sessão expirou. Entre novamente para remover a música.';
    }
    if (error.statusCode === 403) {
      return 'Você não possui permissão para alterar este setlist.';
    }
    return error.message || 'Não foi possível remover a música do setlist.';
  }

  private _getDeleteSetlistErrorMessage(error: unknown): string {
    if (!(error instanceof ApiRequestError)) {
      return 'Não foi possível excluir o setlist.';
    }
    if (error.statusCode === 404) {
      return 'O setlist solicitado não foi encontrado.';
    }
    if (error.statusCode === 401) {
      return 'Sua sessão expirou. Entre novamente para excluir o setlist.';
    }
    if (error.statusCode === 403) {
      return 'Você não possui permissão para excluir este setlist.';
    }
    return error.message || 'Não foi possível excluir o setlist.';
  }
}
