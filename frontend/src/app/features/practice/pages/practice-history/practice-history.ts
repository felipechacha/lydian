import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { ApiRequestError } from '../../../../core/http/api-request.error';
import { ToastrNotificationService } from '../../../../core/notifications/toastr-notification.service';
import { SeoService } from '../../../../core/seo/seo.service';
import { ContentSkeletonLoading } from '../../../../shared/ui/content-skeleton-loading/content-skeleton-loading';
import { DashboardShell } from '../../../../shared/ui/dashboard-shell/dashboard-shell';
import { LibraryService } from '../../../library/data-access/library.service';
import { PracticeHistoryCard } from '../../components/practice-history-card/practice-history-card';
import { PracticeHistoryFilters } from '../../components/practice-history-filters/practice-history-filters';
import { PracticeSessionService } from '../../data-access/practice-session.service';
import {
  ListPracticeHistoryQuery,
  PaginationMeta,
  PracticeHistoryFilterValue,
  PracticeHistoryMusicOption,
  PracticeSessionDetailResponse,
  PracticeSessionHistoryItem,
} from '../../models/practice-session.models';

@Component({
  selector: 'app-practice-history',
  imports: [DashboardShell, ContentSkeletonLoading, PracticeHistoryFilters, PracticeHistoryCard],
  templateUrl: './practice-history.html',
  styleUrl: './practice-history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PracticeHistory implements OnInit, OnDestroy {
  private readonly _seoService = inject(SeoService);
  private readonly _practiceSessionService = inject(PracticeSessionService);
  private readonly _libraryService = inject(LibraryService);
  private readonly _toastrNotificationService = inject(ToastrNotificationService);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);
  private readonly _router = inject(Router);
  private readonly _destroySubject = new Subject<void>();
  private readonly _pageSize = 10;
  private _items: readonly PracticeSessionHistoryItem[] = [];
  private _musicOptions: readonly PracticeHistoryMusicOption[] = [];
  private _meta: PaginationMeta = { page: 1, limit: this._pageSize, total: 0 };
  private _filters: PracticeHistoryFilterValue = {
    search: '',
    songId: '',
    from: '',
    to: '',
    sortBy: 'started_at',
    sortOrder: 'desc',
  };
  private _isLoading = false;
  private _errorMessage = '';

  ngOnInit(): void {
    this._seoService.updateSeo({
      title: 'Histórico de prática',
      description: 'Consulte e filtre todas as suas sessões de estudo no Lydian.',
      keywords: ['histórico de prática', 'sessões de estudo', 'progresso musical', 'Lydian'],
    });
    this._loadInitialData();
  }

  ngOnDestroy(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  get items(): readonly PracticeSessionHistoryItem[] {
    return this._items;
  }
  get musicOptions(): readonly PracticeHistoryMusicOption[] {
    return this._musicOptions;
  }
  get meta(): PaginationMeta {
    return this._meta;
  }
  get isLoading(): boolean {
    return this._isLoading;
  }
  get errorMessage(): string {
    return this._errorMessage;
  }
  get totalPages(): number {
    return Math.max(1, Math.ceil(this._meta.total / this._meta.limit));
  }
  get hasPreviousPage(): boolean {
    return this._meta.page > 1;
  }
  get hasNextPage(): boolean {
    return this._meta.page < this.totalPages;
  }

  public applyFilters(filters: PracticeHistoryFilterValue): void {
    this._filters = filters;
    this._loadHistory(1);
  }

  public changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this._meta.page) {
      return;
    }
    this._loadHistory(page);
  }

  public openSession(sessionId: string): void {
    void this._router.navigate(['/practice-history', sessionId]);
  }

  public retryLoad(): void {
    this._loadHistory(this._meta.page);
  }

  private _loadInitialData(): void {
    this._isLoading = true;
    this._errorMessage = '';
    forkJoin({
      history: this._practiceSessionService.getPracticeHistory(this._createQuery(1)),
      library: this._libraryService.getMusicLibrary({
        page: 1,
        limit: 100,
        sort_by: 'title',
        sort_order: 'asc',
      }),
    })
      .pipe(takeUntil(this._destroySubject))
      .subscribe({
        next: ({ history, library }) => {
          this._populateHistory(history.data, history.meta);
          this._musicOptions = library.data.map((song) => ({
            id: song.id,
            title: song.title,
            artist: song.artist,
          }));
        },
        error: (error: unknown) => this._handleLoadError(error),
        complete: () => this._finishLoading(),
      });
  }

  private _loadHistory(page: number): void {
    this._isLoading = true;
    this._errorMessage = '';
    this._practiceSessionService
      .getPracticeHistory(this._createQuery(page))
      .pipe(takeUntil(this._destroySubject))
      .subscribe({
        next: (response) => this._populateHistory(response.data, response.meta),
        error: (error: unknown) => this._handleLoadError(error),
        complete: () => this._finishLoading(),
      });
  }

  private _createQuery(page: number): ListPracticeHistoryQuery {
    return {
      page,
      limit: this._pageSize,
      search: this._filters.search,
      song_id: this._filters.songId || undefined,
      from: this._filters.from ? `${this._filters.from}T00:00:00.000Z` : undefined,
      to: this._filters.to ? `${this._filters.to}T23:59:59.999Z` : undefined,
      sort_by: this._filters.sortBy,
      sort_order: this._filters.sortOrder,
    };
  }

  private _populateHistory(
    sessions: readonly PracticeSessionDetailResponse[],
    meta: PaginationMeta,
  ): void {
    this._meta = meta;
    this._items = sessions.map((session, index) => ({
      session,
      sequence: Math.max(1, meta.total - (meta.page - 1) * meta.limit - index),
    }));
  }

  private _handleLoadError(error: unknown): void {
    this._isLoading = false;
    this._errorMessage = this._getErrorMessage(error);
    this._toastrNotificationService.error(this._errorMessage, 'Falha ao carregar histórico');
    this._changeDetectorRef.markForCheck();
  }

  private _finishLoading(): void {
    this._isLoading = false;
    this._changeDetectorRef.markForCheck();
  }

  private _getErrorMessage(error: unknown): string {
    if (!(error instanceof ApiRequestError))
      return 'Não foi possível carregar o histórico de prática.';
    if (error.statusCode === 401)
      return 'Sua sessão expirou. Entre novamente para consultar o histórico.';
    return error.message || 'Não foi possível carregar o histórico de prática.';
  }
}
