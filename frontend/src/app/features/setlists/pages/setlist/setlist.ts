import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ApiRequestError } from '../../../../core/http/api-request.error';
import { ToastrNotificationService } from '../../../../core/notifications/toastr-notification.service';
import { SeoService } from '../../../../core/seo/seo.service';
import { ContentSkeletonLoading } from '../../../../shared/ui/content-skeleton-loading/content-skeleton-loading';
import { DashboardShell } from '../../../../shared/ui/dashboard-shell/dashboard-shell';
import { Pagination } from '../../../../shared/ui/pagination/pagination';
import {
  ContentViewMode,
  ViewModeToggle,
} from '../../../../shared/ui/view-mode-toggle/view-mode-toggle';
import { CreateSetlistPanel } from '../../components/create-setlist-panel/create-setlist-panel';
import { SetlistCard } from '../../components/setlist-card/setlist-card';
import { SetlistHero } from '../../components/setlist-hero/setlist-hero';
import { SetlistService } from '../../data-access/setlist.service';
import {
  CreateSetlistRequest,
  SetlistContext,
  SetlistListItemResponse,
  SetlistDraft,
  SetlistSummary,
  SetlistsPaginationMeta,
} from '../../models/setlist.models';

@Component({
  selector: 'app-setlist',
  imports: [
    DashboardShell,
    ContentSkeletonLoading,
    SetlistHero,
    CreateSetlistPanel,
    SetlistCard,
    ViewModeToggle,
    Pagination,
  ],
  templateUrl: './setlist.html',
  styleUrl: './setlist.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Setlist implements OnInit, OnDestroy {
  private readonly _seoService = inject(SeoService);
  private readonly _setlistService = inject(SetlistService);
  private readonly _toastrNotificationService = inject(ToastrNotificationService);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);
  private readonly _destroySubject = new Subject<void>();
  private _isCreatePanelOpen = false;
  private _isLoading = false;
  private _isCreating = false;
  private _loadErrorMessage = '';
  private _createErrorMessage = '';
  private _viewMode: ContentViewMode = 'grid';
  private _setlists: readonly SetlistSummary<string>[] = [];
  private _paginationMeta: SetlistsPaginationMeta = { page: 1, limit: 6, total: 0 };

  ngOnInit(): void {
    this._seoService.updateSeo({
      title: 'Setlists',
      description: 'Crie e organize repertórios para shows, ensaios e gigs no Lydian.',
      keywords: ['setlist', 'show', 'ensaio', 'gig', 'repertório', 'Lydian'],
    });

    this._loadSetlists();
  }

  ngOnDestroy(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  get isCreatePanelOpen(): boolean {
    return this._isCreatePanelOpen;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get isCreating(): boolean {
    return this._isCreating;
  }

  get loadErrorMessage(): string {
    return this._loadErrorMessage;
  }

  get createErrorMessage(): string {
    return this._createErrorMessage;
  }

  get setlists(): readonly SetlistSummary<string>[] {
    return this._setlists;
  }

  get totalSetlists(): number {
    return this._paginationMeta.total;
  }

  get currentPage(): number {
    return this._paginationMeta.page;
  }

  get pageSize(): number {
    return this._paginationMeta.limit;
  }

  get totalSongs(): number | null {
    if (
      this._paginationMeta.total > this._setlists.length ||
      this._setlists.some((setlist) => setlist.songCount === null)
    ) {
      return null;
    }

    return this._setlists.reduce((total, setlist) => total + (setlist.songCount ?? 0), 0);
  }

  get viewMode(): ContentViewMode {
    return this._viewMode;
  }

  public openCreatePanel(): void {
    this._createErrorMessage = '';
    this._isCreatePanelOpen = true;
  }

  public closeCreatePanel(): void {
    if (this._isCreating) {
      return;
    }

    this._isCreatePanelOpen = false;
    this._createErrorMessage = '';
  }

  public selectViewMode(viewMode: ContentViewMode): void {
    this._viewMode = viewMode;
  }

  public applySetlistColumnClass(): string {
    const gridClasses = this._viewMode === 'grid' ? ' col-md-6 col-xl-4' : '';
    return `col-12 d-flex${gridClasses}`;
  }

  public selectPage(page: number): void {
    this._loadSetlists(page);
  }

  public createSetlist(draft: SetlistDraft): void {
    if (this._isCreating) {
      return;
    }

    this._isCreating = true;
    this._createErrorMessage = '';
    const payload = this._createSetlistPayload(draft);

    this._setlistService
      .createSetlist(payload)
      .pipe(takeUntil(this._destroySubject))
      .subscribe({
        next: () => {
          this._isCreatePanelOpen = false;
          this._toastrNotificationService.success(
            'Seu repertório está pronto para receber músicas.',
            'Setlist criado',
          );
          this._loadSetlists(1);
        },
        error: (error: unknown) => {
          this._isCreating = false;
          this._createErrorMessage = this._getCreateSetlistErrorMessage(error);
          this._toastrNotificationService.error(this._createErrorMessage, 'Falha ao criar setlist');
          this._changeDetectorRef.markForCheck();
        },
        complete: () => {
          this._isCreating = false;
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  private _loadSetlists(page = 1): void {
    this._isLoading = true;
    this._loadErrorMessage = '';

    this._setlistService
      .getSetlists({ page, limit: 6, sort_by: 'updated_at', sort_order: 'desc' })
      .pipe(takeUntil(this._destroySubject))
      .subscribe({
        next: (response) => {
          this._setlists = response.data.map((setlist) => this._createSetlistSummary(setlist));
          this._paginationMeta = response.meta;
        },
        error: (error: unknown) => {
          this._isLoading = false;
          this._loadErrorMessage = this._getLoadSetlistsErrorMessage(error);
          this._toastrNotificationService.error(
            this._loadErrorMessage,
            'Falha ao carregar setlists',
          );
          this._changeDetectorRef.markForCheck();
        },
        complete: () => {
          this._isLoading = false;
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  private _createSetlistPayload(draft: SetlistDraft): CreateSetlistRequest {
    return {
      name: draft.title.trim(),
      description: draft.description.trim(),
      visibility: 'private',
    };
  }

  private _createSetlistSummary(
    setlist: SetlistListItemResponse,
    context: SetlistContext = 'Repertório',
  ): SetlistSummary<string> {
    const songCount = setlist.song_count;
    const artworkFallbackUrl = '/images/music-cover-placeholder.svg';
    const artworkUrls = setlist.cover_image_urls
      .slice(0, 4)
      .map((url) => this._resolveArtworkUrl(url));

    while (artworkUrls.length < 4) {
      artworkUrls.push(artworkFallbackUrl);
    }

    return {
      id: setlist.id,
      title: setlist.name,
      context,
      description: setlist.description?.trim() || 'Setlist sem descrição.',
      songCount,
      duration:
        this._formatEstimatedDuration(setlist.duration_seconds, songCount) +
        (setlist.missing_duration_count > 0 && setlist.duration_seconds > 0 ? ' (parcial)' : ''),
      updatedAt: this._formatUpdatedAt(setlist.updated_at),
      artworkUrls,
      eventDate: 'Data a definir',
      venue: 'Local a definir',
    };
  }

  private _resolveArtworkUrl(artworkUrl: string | null): string {
    const normalizedArtworkUrl = artworkUrl?.trim();
    return normalizedArtworkUrl
      ? normalizedArtworkUrl.replace(/^http:\/\//i, 'https://')
      : '/images/music-cover-placeholder.svg';
  }

  private _formatEstimatedDuration(totalSeconds: number, songCount: number): string {
    if (songCount === 0) {
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

  private _formatUpdatedAt(updatedAt: string): string {
    const parsedDate = new Date(updatedAt);

    if (!Number.isFinite(parsedDate.getTime())) {
      return 'Atualização recente';
    }

    return `Atualizado em ${new Intl.DateTimeFormat('pt-BR').format(parsedDate)}`;
  }

  private _getLoadSetlistsErrorMessage(error: unknown): string {
    if (!(error instanceof ApiRequestError)) {
      return 'Não foi possível carregar seus setlists.';
    }

    if (error.statusCode === 401) {
      return 'Sua sessão expirou. Entre novamente para consultar seus setlists.';
    }

    if (error.statusCode === 403) {
      return 'Você não possui permissão para consultar estes setlists.';
    }

    if (error.statusCode === 500) {
      return 'A API encontrou um erro ao carregar os setlists. Tente novamente em instantes.';
    }

    return error.message || 'Não foi possível carregar seus setlists.';
  }

  private _getCreateSetlistErrorMessage(error: unknown): string {
    if (!(error instanceof ApiRequestError)) {
      return 'Não foi possível criar o setlist.';
    }

    if (error.statusCode === 400) {
      return 'Revise os dados do setlist e tente novamente.';
    }

    if (error.statusCode === 401) {
      return 'Sua sessão expirou. Entre novamente para criar o setlist.';
    }

    if (error.statusCode === 403) {
      return 'Você não possui permissão para criar este setlist.';
    }

    if (error.statusCode === 409) {
      return 'Já existe um setlist com estes dados.';
    }

    if (error.statusCode === 500) {
      return 'A API encontrou um erro ao criar o setlist. Tente novamente em instantes.';
    }

    return error.message || 'Não foi possível criar o setlist.';
  }
}
