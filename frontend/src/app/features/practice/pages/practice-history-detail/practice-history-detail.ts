import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ApiRequestError } from '../../../../core/http/api-request.error';
import { ToastrNotificationService } from '../../../../core/notifications/toastr-notification.service';
import { SeoService } from '../../../../core/seo/seo.service';
import { ContentSkeletonLoading } from '../../../../shared/ui/content-skeleton-loading/content-skeleton-loading';
import { DashboardShell } from '../../../../shared/ui/dashboard-shell/dashboard-shell';
import { PracticeSessionService } from '../../data-access/practice-session.service';
import {
  PracticeSessionDetailResponse,
  PracticeSessionSongDetailResponse,
} from '../../models/practice-session.models';

@Component({
  selector: 'app-practice-history-detail',
  imports: [DashboardShell, ContentSkeletonLoading, RouterLink],
  templateUrl: './practice-history-detail.html',
  styleUrl: './practice-history-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PracticeHistoryDetail implements OnInit, OnDestroy {
  private readonly _seoService = inject(SeoService);
  private readonly _service = inject(PracticeSessionService);
  private readonly _route = inject(ActivatedRoute);
  private readonly _toastr = inject(ToastrNotificationService);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);
  private readonly _destroySubject = new Subject<void>();
  private readonly _sessionId = this._route.snapshot.paramMap.get('id') ?? '';
  private _session: PracticeSessionDetailResponse | null = null;
  private _isLoading = false;
  private _errorMessage = '';

  ngOnInit(): void {
    this._seoService.updateSeo({
      title: 'Detalhes da prática',
      description: 'Consulte métricas e anotações de uma sessão no Lydian.',
      keywords: ['sessão de prática', 'histórico', 'estudo musical', 'Lydian'],
    });
    this._loadSession();
  }
  ngOnDestroy(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  get session(): PracticeSessionDetailResponse | null {
    return this._session;
  }
  get isLoading(): boolean {
    return this._isLoading;
  }
  get errorMessage(): string {
    return this._errorMessage;
  }
  get primarySong(): PracticeSessionSongDetailResponse | null {
    return this._session?.practice_session_songs[0] ?? null;
  }
  get title(): string {
    return this._session?.title?.trim() || this.primarySong?.songs.title || 'Sessão de prática';
  }
  get artworkUrl(): string {
    const url = this.primarySong?.songs.cover_image_url?.trim();
    return url ? url.replace(/^http:\/\//i, 'https://') : '/images/music-cover-placeholder.svg';
  }
  get duration(): string {
    const seconds = this._session?.duration_seconds ?? (this._session?.duration_minutes ?? 0) * 60;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${String(seconds % 60).padStart(2, '0')}s`;
  }
  get pausedDuration(): string {
    const seconds = this._session?.paused_seconds ?? 0;
    return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, '0')}s`;
  }
  get practicedAt(): string {
    const value = this._session?.started_at;
    if (!value) return 'Data não informada';
    const date = new Date(value);
    return Number.isFinite(date.getTime())
      ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(date)
      : 'Data não informada';
  }
  get techniques(): readonly string[] {
    return this.primarySong?.practice_session_techniques?.map((item) => item.techniques.name) ?? [];
  }
  public retryLoad(): void {
    this._loadSession();
  }

  private _loadSession(): void {
    if (!this._sessionId) {
      this._errorMessage = 'Não foi possível identificar a sessão solicitada.';
      return;
    }
    this._isLoading = true;
    this._errorMessage = '';
    this._service
      .getPracticeSession(this._sessionId)
      .pipe(takeUntil(this._destroySubject))
      .subscribe({
        next: (response) => {
          this._session = response.data;
          this._seoService.updateSeo({
            title: this.title,
            description: `Detalhes da sessão ${this.title} no Lydian.`,
            keywords: ['sessão de prática', 'histórico', 'Lydian'],
          });
        },
        error: (error: unknown) => {
          this._isLoading = false;
          this._errorMessage = this._getErrorMessage(error);
          this._toastr.error(this._errorMessage, 'Falha ao carregar sessão');
          this._changeDetectorRef.markForCheck();
        },
        complete: () => {
          this._isLoading = false;
          this._changeDetectorRef.markForCheck();
        },
      });
  }
  private _getErrorMessage(error: unknown): string {
    if (!(error instanceof ApiRequestError))
      return 'Não foi possível carregar os detalhes da sessão.';
    if (error.statusCode === 404) return 'A sessão solicitada não foi encontrada.';
    if (error.statusCode === 401) return 'Sua sessão expirou. Entre novamente para continuar.';
    return error.message || 'Não foi possível carregar os detalhes da sessão.';
  }
}
