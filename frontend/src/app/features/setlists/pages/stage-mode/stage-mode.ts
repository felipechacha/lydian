import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { gsap } from 'gsap';
import { ApiRequestError } from '../../../../core/http/api-request.error';
import { ToastrNotificationService } from '../../../../core/notifications/toastr-notification.service';
import { SeoService } from '../../../../core/seo/seo.service';
import { ContentSkeletonLoading } from '../../../../shared/ui/content-skeleton-loading/content-skeleton-loading';
import { StageSetlistPaper } from '../../components/stage-setlist-paper/stage-setlist-paper';
import { SetlistService } from '../../data-access/setlist.service';
import { StageModeSetlist, StageModeTrack } from '../../models/stage-mode.models';
import { SetlistDetailResponse } from '../../models/setlist.models';

/**
 * Referências visuais e de estrutura usadas na concepção do Stage Mode:
 * https://aftertheshowmusic.com/the-art-of-the-set-list/
 * https://www.musicnsw.com/resources/setlist-template
 * https://recordmecca.com/news/virtual-museum-set-lists-by-the-rolling-stones-bruce-springsteen-neil-young-joni-mitchell-and-the-clash/
 */
@Component({
  selector: 'app-stage-mode',
  imports: [ContentSkeletonLoading, StageSetlistPaper],
  templateUrl: './stage-mode.html',
  styleUrl: './stage-mode.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StageMode implements OnInit, AfterViewInit, OnDestroy {
  private readonly _seoService = inject(SeoService);
  private readonly _setlistService = inject(SetlistService);
  private readonly _toastrNotificationService = inject(ToastrNotificationService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _platformId = inject(PLATFORM_ID);
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);
  private readonly _destroySubject = new Subject<void>();
  private readonly _setlistId = this._activatedRoute.snapshot.paramMap.get('id') ?? '';
  private _stageSetlist: StageModeSetlist | null = null;
  private _currentTrackIndex = 0;
  private _playedMusicIds: ReadonlySet<string> = new Set<string>();
  private _isLoading = false;
  private _errorMessage = '';
  private _viewReady = false;
  private _gsapContext?: gsap.Context;
  private _animationTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this._seoService.updateSeo({
      title: 'Stage Mode',
      description: 'Visualização de palco do setlist no Lydian.',
      keywords: ['stage mode', 'setlist', 'palco', 'ordem das músicas', 'Lydian'],
    });
    this._loadSetlist();
  }

  ngAfterViewInit(): void {
    this._viewReady = true;
    if (this._stageSetlist) {
      this._scheduleAnimations();
    }
  }

  ngOnDestroy(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
    if (this._animationTimer) {
      clearTimeout(this._animationTimer);
    }
    this._gsapContext?.revert();
  }

  get stageSetlist(): StageModeSetlist | null {
    return this._stageSetlist;
  }

  get currentTrackIndex(): number {
    return this._currentTrackIndex;
  }

  get playedMusicIds(): ReadonlySet<string> {
    return this._playedMusicIds;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get errorMessage(): string {
    return this._errorMessage;
  }

  get currentTrackTitle(): string {
    return this._stageSetlist?.tracks[this._currentTrackIndex]?.title ?? 'Set vazio';
  }

  get progressLabel(): string {
    const trackCount = this._stageSetlist?.tracks.length ?? 0;
    const currentPosition = trackCount > 0 ? this._currentTrackIndex + 1 : 0;
    return `${String(currentPosition).padStart(2, '0')} / ${String(trackCount).padStart(2, '0')}`;
  }

  get hasPreviousTrack(): boolean {
    return this._currentTrackIndex > 0;
  }

  get hasNextTrack(): boolean {
    return this._currentTrackIndex < (this._stageSetlist?.tracks.length ?? 0) - 1;
  }

  get isCurrentTrackPlayed(): boolean {
    const currentTrack = this._stageSetlist?.tracks[this._currentTrackIndex];
    return currentTrack ? this._playedMusicIds.has(currentTrack.musicId) : false;
  }

  public retryLoad(): void {
    this._loadSetlist();
  }

  public selectTrack(trackIndex: number): void {
    if (trackIndex < 0 || trackIndex >= (this._stageSetlist?.tracks.length ?? 0)) {
      return;
    }
    this._currentTrackIndex = trackIndex;
    this._animateCurrentTrack();
  }

  public selectPreviousTrack(): void {
    if (this.hasPreviousTrack) {
      this.selectTrack(this._currentTrackIndex - 1);
    }
  }

  public selectNextTrack(): void {
    if (this.hasNextTrack) {
      this.selectTrack(this._currentTrackIndex + 1);
    }
  }

  public togglePlayed(musicId: string): void {
    const playedMusicIds = new Set(this._playedMusicIds);
    playedMusicIds.has(musicId) ? playedMusicIds.delete(musicId) : playedMusicIds.add(musicId);
    this._playedMusicIds = playedMusicIds;
  }

  public toggleCurrentTrackPlayed(): void {
    const currentTrack = this._stageSetlist?.tracks[this._currentTrackIndex];
    if (currentTrack) {
      this.togglePlayed(currentTrack.musicId);
    }
  }

  public exitStageMode(): Promise<boolean> {
    return this._router.navigate(['/setlist-details', this._setlistId]);
  }

  @HostListener('document:keydown', ['$event'])
  public handleKeyboardNavigation(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      this.selectNextTrack();
      return;
    }
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      this.selectPreviousTrack();
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      void this.exitStageMode();
    }
  }

  private _loadSetlist(): void {
    if (!this._setlistId) {
      this._errorMessage = 'Não foi possível identificar o setlist solicitado.';
      return;
    }
    this._isLoading = true;
    this._errorMessage = '';
    this._setlistService
      .getSetlistDetails(this._setlistId)
      .pipe(takeUntil(this._destroySubject))
      .subscribe({
        next: (response) => {
          this._stageSetlist = this._createStageSetlist(response.data);
          this._currentTrackIndex = 0;
          this._playedMusicIds = new Set<string>();
          this._seoService.updateSeo({
            title: `Stage Mode — ${response.data.name}`,
            description: `Visualização de palco do setlist ${response.data.name} no Lydian.`,
            keywords: ['stage mode', 'setlist', 'palco', 'ordem das músicas', 'Lydian'],
          });
        },
        error: (error: unknown) => {
          this._isLoading = false;
          this._errorMessage = this._getLoadErrorMessage(error);
          this._toastrNotificationService.error(this._errorMessage, 'Falha no Stage Mode');
          this._changeDetectorRef.markForCheck();
        },
        complete: () => {
          this._isLoading = false;
          this._changeDetectorRef.markForCheck();
          if (this._viewReady) {
            this._scheduleAnimations();
          }
        },
      });
  }

  private _createStageSetlist(setlist: SetlistDetailResponse): StageModeSetlist {
    const orderedSongs = [...setlist.setlist_songs].sort((a, b) => a.position - b.position);
    const tracks: readonly StageModeTrack[] = orderedSongs.map((setlistSong, index) => ({
      musicId: setlistSong.song_id,
      orderLabel: String(index + 1).padStart(2, '0'),
      title: setlistSong.songs.title,
      composer: setlistSong.songs.artist,
      bpm: setlistSong.songs.bpm,
      cue: setlistSong.notes?.trim() || 'Sem observações',
    }));
    const totalSeconds = orderedSongs.reduce(
      (total, setlistSong) => total + (setlistSong.songs.duration_seconds ?? 0),
      0,
    );

    return {
      id: setlist.id,
      title: setlist.name,
      context: setlist.visibility === 'public' ? 'Setlist público' : 'Setlist privado',
      venue: 'Lydian Stage Mode',
      eventDate: new Intl.DateTimeFormat('pt-BR').format(new Date(setlist.updated_at)),
      duration: this._formatDuration(totalSeconds),
      tracks,
    };
  }

  private _formatDuration(totalSeconds: number): string {
    if (totalSeconds <= 0) {
      return 'Duração não informada';
    }
    const totalMinutes = Math.ceil(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h${minutes ? ` ${minutes}min` : ''}` : `${totalMinutes} min`;
  }

  private _scheduleAnimations(): void {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }
    if (this._animationTimer) {
      clearTimeout(this._animationTimer);
    }
    this._gsapContext?.revert();
    this._animationTimer = setTimeout(() => {
      this._gsapContext = gsap.context(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          return;
        }
        const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
        timeline
          .fromTo(
            '.stage-mode-toolbar-custom',
            { y: -20, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.55, clearProps: 'transform,opacity,visibility' },
          )
          .fromTo(
            '.stage-paper-shell-custom',
            { y: 72, rotationX: 7, rotationZ: -1.2, scale: 0.96, autoAlpha: 0 },
            {
              y: 0,
              rotationX: 0,
              rotationZ: 0,
              scale: 1,
              autoAlpha: 1,
              duration: 1.05,
              transformPerspective: 1200,
              transformOrigin: '50% 15%',
              clearProps: 'transform,opacity,visibility',
            },
            '-=0.28',
          )
          .fromTo(
            '.stage-track-custom',
            { y: 18, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 0.48,
              stagger: 0.07,
              clearProps: 'transform,opacity,visibility',
            },
            '-=0.62',
          );
        gsap.to('.stage-light-custom', {
          scale: 1.08,
          opacity: 0.82,
          duration: 3.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      }, this._elementRef.nativeElement);
    }, 0);
  }

  private _animateCurrentTrack(): void {
    if (!isPlatformBrowser(this._platformId)) {
      return;
    }
    const currentTrack = this._elementRef.nativeElement.querySelector(
      `.stage-track-custom[data-track-index="${this._currentTrackIndex}"]`,
    );
    if (!currentTrack || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    gsap.fromTo(
      currentTrack,
      { x: -7, scale: 0.99 },
      { x: 0, scale: 1, duration: 0.38, ease: 'back.out(2)' },
    );
  }

  private _getLoadErrorMessage(error: unknown): string {
    if (!(error instanceof ApiRequestError)) {
      return 'Não foi possível carregar este setlist no Stage Mode.';
    }
    if (error.statusCode === 404) {
      return 'O setlist solicitado não foi encontrado.';
    }
    if (error.statusCode === 401) {
      return 'Sua sessão expirou. Entre novamente para abrir o Stage Mode.';
    }
    return error.message || 'Não foi possível carregar este setlist no Stage Mode.';
  }
}
