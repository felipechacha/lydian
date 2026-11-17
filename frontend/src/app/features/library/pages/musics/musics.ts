import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { SeoService } from '../../../../core/seo/seo.service';
import { ToastrNotificationService } from '../../../../core/notifications/toastr-notification.service';
import { ContentSkeletonLoading } from '../../../../shared/ui/content-skeleton-loading/content-skeleton-loading';
import { DashboardShell } from '../../../../shared/ui/dashboard-shell/dashboard-shell';
import { Pagination } from '../../../../shared/ui/pagination/pagination';
import { ContentViewMode } from '../../../../shared/ui/view-mode-toggle/view-mode-toggle';
import { MusicLibraryCard } from '../../components/music-library-card/music-library-card';
import { MusicsHero } from '../../components/musics-hero/musics-hero';
import { MusicsToolbar } from '../../components/musics-toolbar/musics-toolbar';
import { LibraryService } from '../../data-access/library.service';
import {
  ApiSongDifficulty,
  SongResponse,
  SongsPaginationMeta,
} from '../../models/add-music.models';
import { LibraryMusic, MusicDifficulty, MusicFilter } from '../../models/musics.models';

@Component({
  selector: 'app-musics',
  imports: [
    DashboardShell,
    ContentSkeletonLoading,
    MusicsHero,
    MusicsToolbar,
    MusicLibraryCard,
    Pagination,
  ],
  templateUrl: './musics.html',
  styleUrl: './musics.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Musics implements OnInit, OnDestroy {
  private readonly _artworkFallbackUrl = '/images/music-cover-placeholder.svg';
  private readonly _seoService = inject(SeoService);
  private readonly _libraryService = inject(LibraryService);
  private readonly _toastrNotificationService = inject(ToastrNotificationService);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);
  private readonly _destroySubject = new Subject<void>();
  private _activeFilter: MusicFilter = 'all';
  private _viewMode: ContentViewMode = 'grid';
  private _musicList: LibraryMusic<string>[] = [];
  private _isLoading = false;
  private _paginationMeta: SongsPaginationMeta = { page: 1, limit: 12, total: 0 };

  ngOnInit(): void {
    this._seoService.updateSeo({
      title: 'Músicas',
      description: 'Organize e acompanhe o domínio do seu repertório musical no Lydian.',
      keywords: ['músicas', 'biblioteca musical', 'repertório', 'prática', 'Lydian'],
    });
    this._loadMusics();
  }

  ngOnDestroy(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  get activeFilter(): MusicFilter {
    return this._activeFilter;
  }

  get viewMode(): ContentViewMode {
    return this._viewMode;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get musicCount(): number {
    return this._paginationMeta.total;
  }

  get currentPage(): number {
    return this._paginationMeta.page;
  }

  get pageSize(): number {
    return this._paginationMeta.limit;
  }

  get totalItems(): number {
    return this._paginationMeta.total;
  }

  get visibleMusics(): readonly LibraryMusic<string>[] {
    if (this._activeFilter === 'all') {
      return this._musicList;
    }

    return this._musicList.filter((music) => music.status === this._activeFilter);
  }

  public selectFilter(filter: MusicFilter): void {
    this._activeFilter = filter;
  }

  public selectViewMode(viewMode: ContentViewMode): void {
    this._viewMode = viewMode;
  }

  public applyMusicColumnClass(): string {
    const gridClasses = this._viewMode === 'grid' ? ' col-md-6 col-xl-3' : '';
    return `col-12 d-flex${gridClasses}`;
  }

  public selectPage(page: number): void {
    this._loadMusics(page);
  }

  private _loadMusics(page = 1): void {
    this._isLoading = true;

    this._libraryService
      .getMusicLibrary({ page, limit: 12, sort_by: 'updated_at', sort_order: 'desc' })
      .pipe(takeUntil(this._destroySubject))
      .subscribe({
        next: (response) => {
          this._musicList = response.data.map((music) => this._createLibraryMusic(music));
          this._paginationMeta = response.meta;
        },
        error: () => {
          this._isLoading = false;
          this._toastrNotificationService.error(
            'Não foi possível carregar sua biblioteca.',
            'Falha na biblioteca',
          );
          this._changeDetectorRef.markForCheck();
        },
        complete: () => {
          this._isLoading = false;
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  private _createLibraryMusic(music: SongResponse): LibraryMusic<string> {
    return {
      id: music.id,
      title: music.title,
      composer: music.artist,
      artworkUrl: this._resolveArtworkUrl(music.cover_image_url),
      bpm: music.bpm ?? 0,
      targetBpm: music.target_bpm ?? null,
      durationSeconds: music.duration_seconds ?? null,
      difficulty: this._mapDifficulty(music.difficulty),
      status: music.learning_status ?? 'new',
      priority: music.priority ?? 0,
      lastPracticedAt: music.last_practiced_at ?? null,
      technicalFocus: music.notes ?? undefined,
    };
  }

  private _mapDifficulty(difficulty: ApiSongDifficulty | null): MusicDifficulty {
    const difficultyByApiValue: Record<ApiSongDifficulty, MusicDifficulty> = {
      beginner: 'Fácil',
      intermediate: 'Médio',
      advanced: 'Difícil',
    };

    return difficulty ? difficultyByApiValue[difficulty] : 'Médio';
  }

  private _resolveArtworkUrl(artworkUrl: string | null): string {
    const normalizedArtworkUrl = artworkUrl?.trim();

    if (!normalizedArtworkUrl) {
      return this._artworkFallbackUrl;
    }

    return normalizedArtworkUrl.replace(/^http:\/\//i, 'https://');
  }
}
