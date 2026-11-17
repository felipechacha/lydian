import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MetronomeAudioService } from '../../../../core/audio/metronome-audio.service';
import { ApiRequestError } from '../../../../core/http/api-request.error';
import { SeoService } from '../../../../core/seo/seo.service';
import { ToastrNotificationService } from '../../../../core/notifications/toastr-notification.service';
import { ContentSkeletonLoading } from '../../../../shared/ui/content-skeleton-loading/content-skeleton-loading';
import { PracticeSessionCompletionModal } from '../../components/practice-session-completion-modal/practice-session-completion-modal';
import { PracticeSessionHeader } from '../../components/practice-session-header/practice-session-header';
import { SessionMetronome } from '../../components/session-metronome/session-metronome';
import { SessionSummary } from '../../components/session-summary/session-summary';
import { SessionToolDock } from '../../components/session-tool-dock/session-tool-dock';
import { SheetMusicPanel } from '../../components/sheet-music-panel/sheet-music-panel';
import { PracticeSessionService } from '../../data-access/practice-session.service';
import {
  PracticeSessionDetailResponse,
  PracticeSessionCompletionFormValue,
  PracticeSessionNavigationState,
  PracticeTechnique,
  SessionTool,
} from '../../models/practice-session.models';

@Component({
  selector: 'app-practice-session',
  imports: [
    PracticeSessionHeader,
    SessionMetronome,
    SessionSummary,
    SheetMusicPanel,
    SessionToolDock,
    ContentSkeletonLoading,
    PracticeSessionCompletionModal,
    RouterLink,
  ],
  templateUrl: './practice-session.html',
  styleUrl: './practice-session.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PracticeSession implements OnInit, OnDestroy {
  private readonly _seoService = inject(SeoService);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);
  private readonly _metronomeAudioService = inject(MetronomeAudioService);
  private readonly _practiceSessionService = inject(PracticeSessionService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _location = inject(Location);
  private readonly _toastrNotificationService = inject(ToastrNotificationService);
  private readonly _destroySubject = new Subject<void>();
  private readonly _sessionId = this._activatedRoute.snapshot.paramMap.get('id') ?? '';
  private readonly _isFreshSession = this._readFreshSessionState();
  private _practiceSession: PracticeSessionDetailResponse | null = null;
  private _musicId = '';
  private _isLoading = false;
  private _errorMessage = '';
  private _elapsedTime = '00:00:00';
  private _elapsedSeconds = 0;
  private _isTimerRunning = false;
  private _timerIntervalId: ReturnType<typeof setInterval> | null = null;
  private _timerReferenceTime = 0;
  private _pausedSeconds = 0;
  private _pauseStartedAt: number | null = null;
  private _sessionArtist = '';
  private _sessionMusicTitle = '';
  private _sessionDescription = '';
  private _tempo = 72;
  private _isMetronomeRunning = false;
  private _isMetronomeStarting = false;
  private _isDestroyed = false;
  private _isCompletionModalOpen = false;
  private _isCompletingSession = false;
  private _completionErrorMessage = '';
  private _activeTool: SessionTool = 'notes';
  private _techniques: readonly PracticeTechnique[] = [
    { icon: 'gesture', label: 'Palm Mute Consistente', isActive: true },
    { icon: 'bolt', label: 'Ataque de Palheta', isActive: false },
    { icon: 'music_note', label: 'Precisão de Riffs', isActive: false },
  ];

  ngOnInit(): void {
    this._seoService.updateSeo({
      title: 'Sessão de Prática',
      description: 'Ambiente de prática focada do Lydian.',
      keywords: ['prática musical', 'metrônomo', 'sessão', 'Lydian'],
    });
    this._loadPracticeSession();
  }

  ngOnDestroy(): void {
    this._isDestroyed = true;
    this._pauseSessionTimer(false);
    this._metronomeAudioService.stop();
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  get practiceSession(): PracticeSessionDetailResponse | null {
    return this._practiceSession;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get errorMessage(): string {
    return this._errorMessage;
  }

  get elapsedTime(): string {
    return this._elapsedTime;
  }

  get isTimerRunning(): boolean {
    return this._isTimerRunning;
  }

  get sessionStatusLabel(): string {
    if (this._isTimerRunning) {
      return 'Sessão em andamento';
    }

    return this._elapsedSeconds > 0 ? 'Sessão pausada' : 'Sessão pronta';
  }

  get sessionEyebrow(): string {
    if (this._isTimerRunning) {
      return 'Praticando agora';
    }

    return this._elapsedSeconds > 0 ? 'Timer pausado' : 'Tudo pronto para começar';
  }

  get canDisplaySession(): boolean {
    return this._practiceSession !== null;
  }

  get sessionArtist(): string {
    return this._sessionArtist;
  }

  get sessionMusicTitle(): string {
    return this._sessionMusicTitle;
  }

  get sessionDescription(): string {
    return this._sessionDescription;
  }

  get tempo(): number {
    return this._tempo;
  }

  get isMetronomeRunning(): boolean {
    return this._isMetronomeRunning;
  }

  get activeTool(): SessionTool {
    return this._activeTool;
  }

  get techniques(): readonly PracticeTechnique[] {
    return this._techniques;
  }

  get isCompletionModalOpen(): boolean {
    return this._isCompletionModalOpen;
  }

  get isCompletingSession(): boolean {
    return this._isCompletingSession;
  }

  get completionErrorMessage(): string {
    return this._completionErrorMessage;
  }

  get wholePracticeMinutes(): number {
    return Math.floor(this._elapsedSeconds / 60);
  }

  public changeTempo(tempo: number): void {
    this._tempo = Math.min(220, Math.max(40, tempo));
    this._metronomeAudioService.updateTempo(this._tempo);
  }

  public toggleSessionTimer(): void {
    if (this._isTimerRunning) {
      this._pauseSessionTimer();
      return;
    }

    this._startSessionTimer();
  }

  public async toggleMetronome(): Promise<void> {
    if (this._isMetronomeStarting) {
      return;
    }

    if (this._isMetronomeRunning) {
      this._metronomeAudioService.stop();
      this._isMetronomeRunning = false;
      return;
    }

    this._isMetronomeStarting = true;
    const didStart = await this._metronomeAudioService.start(this._tempo);
    this._isMetronomeStarting = false;

    if (this._isDestroyed) {
      return;
    }

    this._isMetronomeRunning = didStart;
    this._changeDetectorRef.markForCheck();
  }

  public selectTechnique(index: number): void {
    this._techniques = this._techniques.map((technique, techniqueIndex) => ({
      ...technique,
      isActive: techniqueIndex === index,
    }));
  }

  public selectTool(tool: SessionTool): void {
    this._activeTool = tool;
  }

  public requestSessionCompletion(): void {
    if (this._isCompletingSession) {
      return;
    }

    this._pauseSessionTimer();
    this._completionErrorMessage = '';
    this._isCompletionModalOpen = true;
  }

  public cancelSessionCompletion(): void {
    if (this._isCompletingSession) {
      return;
    }

    this._isCompletionModalOpen = false;
    this._completionErrorMessage = '';
  }

  public completeSession(formValue: PracticeSessionCompletionFormValue): void {
    if (this._isCompletingSession || !this._sessionId || !this._musicId) {
      return;
    }

    this._isCompletingSession = true;
    this._completionErrorMessage = '';
    const songNotes = formValue.songNotes.trim();
    const sessionNotes = formValue.sessionNotes.trim();
    const mood = formValue.mood.trim();
    const selectedTechniqueIds = this._techniques
      .filter((technique) => technique.isActive && technique.id)
      .map((technique) => technique.id as string);

    this._practiceSessionService
      .finishPracticeSession(this._sessionId, {
        ended_at: new Date().toISOString(),
        duration_seconds: this._elapsedSeconds,
        paused_seconds: this._getTotalPausedSeconds(),
        ...(sessionNotes ? { notes: sessionNotes } : {}),
        ...(mood ? { mood } : {}),
        song: {
          song_id: this._musicId,
          seconds_practiced: this._elapsedSeconds,
          practiced_bpm: this._tempo,
          progress_rating: formValue.progressRating,
          repetitions: formValue.repetitions,
          quality_rating: formValue.qualityRating,
          ...(songNotes ? { notes: songNotes } : {}),
          ...(selectedTechniqueIds.length > 0 ? { technique_ids: selectedTechniqueIds } : {}),
        },
      })
      .pipe(takeUntil(this._destroySubject))
      .subscribe({
        next: () => {
          this._toastrNotificationService.success(
            `Prática encerrada com ${this._formatSeconds(this._elapsedSeconds)} de tempo ativo.`,
            'Sessão concluída',
          );
          void this._router.navigate(['/music-details', this._musicId]);
        },
        error: (error: unknown) => {
          this._isCompletingSession = false;
          this._completionErrorMessage = this._getCompleteSessionErrorMessage(error);
          this._toastrNotificationService.error(
            this._completionErrorMessage,
            'Falha ao encerrar sessão',
          );
          this._changeDetectorRef.markForCheck();
        },
        complete: () => {
          this._isCompletingSession = false;
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  private _readFreshSessionState(): boolean {
    const navigationState: unknown = this._location.getState();
    return Boolean(
      navigationState &&
      typeof navigationState === 'object' &&
      (navigationState as PracticeSessionNavigationState).practiceSessionFresh,
    );
  }

  private _startSessionTimer(): void {
    if (this._timerIntervalId !== null || this._isDestroyed) {
      return;
    }

    if (this._pauseStartedAt !== null) {
      this._pausedSeconds += Math.max(0, Math.floor((Date.now() - this._pauseStartedAt) / 1000));
      this._pauseStartedAt = null;
    }

    this._isTimerRunning = true;
    this._timerReferenceTime = Date.now() - this._elapsedSeconds * 1000;
    this._timerIntervalId = setInterval(() => {
      this._elapsedSeconds = Math.max(
        0,
        Math.floor((Date.now() - this._timerReferenceTime) / 1000),
      );
      this._elapsedTime = this._formatSeconds(this._elapsedSeconds);
      this._changeDetectorRef.markForCheck();
    }, 250);
    this._changeDetectorRef.markForCheck();
  }

  private _pauseSessionTimer(trackPause = true): void {
    const wasRunning = this._timerIntervalId !== null;
    if (this._timerIntervalId !== null) {
      clearInterval(this._timerIntervalId);
      this._timerIntervalId = null;
    }

    this._isTimerRunning = false;
    if (trackPause && wasRunning && this._pauseStartedAt === null) {
      this._pauseStartedAt = Date.now();
    }
    if (!this._isDestroyed) {
      this._changeDetectorRef.markForCheck();
    }
  }

  private _loadPracticeSession(): void {
    if (!this._sessionId) {
      this._errorMessage = 'Não foi possível identificar a sessão de prática solicitada.';
      return;
    }

    this._isLoading = true;
    this._errorMessage = '';

    this._practiceSessionService
      .getPracticeSession(this._sessionId)
      .pipe(takeUntil(this._destroySubject))
      .subscribe({
        next: (response) => {
          this._practiceSession = response.data;
          this._populateSessionData(response.data);
          this._updateSessionSeo(response.data);
        },
        error: (error: unknown) => {
          this._isLoading = false;
          this._errorMessage = this._getPracticeSessionErrorMessage(error);
          this._toastrNotificationService.error(this._errorMessage, 'Falha na sessão de prática');
          this._changeDetectorRef.markForCheck();
        },
        complete: () => {
          this._isLoading = false;
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  private _populateSessionData(practiceSession: PracticeSessionDetailResponse): void {
    const primarySessionSong = practiceSession.practice_session_songs[0]?.songs;

    this._musicId = primarySessionSong?.id ?? '';
    this._elapsedSeconds = this._isFreshSession
      ? 0
      : this._calculateSessionElapsedSeconds(practiceSession);
    this._elapsedTime = this._formatSeconds(this._elapsedSeconds);
    this._sessionArtist =
      primarySessionSong?.artist ?? practiceSession.title ?? 'Sessão de prática';
    this._sessionMusicTitle = primarySessionSong?.title ?? 'Repertório livre';
    this._sessionDescription = this._createSessionDescription(practiceSession);
    this._tempo = primarySessionSong?.bpm ?? 72;

    const techniques =
      primarySessionSong?.song_techniques?.map(({ techniques }) => techniques) ?? [];
    if (techniques.length > 0) {
      this._techniques = techniques.map((technique, index) => ({
        id: technique.id,
        icon: ['gesture', 'bolt', 'music_note'][index % 3],
        label: technique.name,
        isActive: index === 0,
      }));
    }

    if (this._isFreshSession) {
      this._pauseStartedAt = Date.now();
    }
  }

  private _createSessionDescription(practiceSession: PracticeSessionDetailResponse): string {
    const primarySessionSong = practiceSession.practice_session_songs[0]?.songs;
    const details = [
      primarySessionSong?.tuning ? `Afinação ${primarySessionSong.tuning}.` : '',
      practiceSession.focus_area ? `Foco em ${practiceSession.focus_area}.` : '',
      practiceSession.notes ?? '',
    ].filter((detail) => detail.trim().length > 0);

    return details.join(' ') || 'Sessão focada em desenvolver consistência e precisão musical.';
  }

  private _calculateSessionElapsedSeconds(practiceSession: PracticeSessionDetailResponse): number {
    const durationInSeconds =
      practiceSession.duration_seconds ??
      (practiceSession.duration_minutes !== null
        ? practiceSession.duration_minutes * 60
        : this._calculateElapsedSeconds(practiceSession.started_at, practiceSession.ended_at));

    return Math.max(0, Math.floor(durationInSeconds));
  }

  private _formatSeconds(elapsedSeconds: number): string {
    const hours = Math.floor(elapsedSeconds / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;

    return [hours, minutes, seconds]
      .map((timePart) => timePart.toString().padStart(2, '0'))
      .join(':');
  }

  private _getTotalPausedSeconds(): number {
    const currentPauseSeconds =
      this._pauseStartedAt === null
        ? 0
        : Math.max(0, Math.floor((Date.now() - this._pauseStartedAt) / 1000));
    return this._pausedSeconds + currentPauseSeconds;
  }
  private _calculateElapsedSeconds(startedAt: string, endedAt: string | null): number {
    const startTime = new Date(startedAt).getTime();
    const endTime = endedAt ? new Date(endedAt).getTime() : Date.now();

    if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
      return 0;
    }

    return (endTime - startTime) / 1000;
  }

  private _updateSessionSeo(practiceSession: PracticeSessionDetailResponse): void {
    const sessionTitle = practiceSession.title ?? this._sessionMusicTitle;

    this._seoService.updateSeo({
      title: sessionTitle,
      description: `Acompanhe a sessão de prática ${sessionTitle} no Lydian.`,
      keywords: ['prática musical', 'metrônomo', 'sessão', 'Lydian'],
    });
  }

  private _getPracticeSessionErrorMessage(error: unknown): string {
    if (!(error instanceof ApiRequestError)) {
      return 'Não foi possível carregar a sessão de prática.';
    }

    if (error.statusCode === 404) {
      return 'A sessão de prática solicitada não foi encontrada.';
    }

    if (error.statusCode === 401) {
      return 'Sua sessão expirou. Entre novamente para consultar esta prática.';
    }

    if (error.statusCode === 403) {
      return 'Você não possui permissão para consultar esta sessão de prática.';
    }

    if (error.statusCode === 500) {
      return 'A API encontrou um erro ao carregar a sessão. Tente novamente em instantes.';
    }

    return error.message || 'Não foi possível carregar a sessão de prática.';
  }

  private _getCompleteSessionErrorMessage(error: unknown): string {
    if (!(error instanceof ApiRequestError)) {
      return 'Não foi possível salvar e encerrar a sessão de prática.';
    }

    const messageByStatus: Readonly<Record<number, string>> = {
      400: 'Revise as anotações e a avaliação antes de encerrar a sessão.',
      401: 'Sua sessão expirou. Entre novamente para salvar esta prática.',
      403: 'Você não possui permissão para encerrar esta sessão de prática.',
      404: 'A sessão ou a música associada não foi encontrada.',
      429: 'Muitas solicitações foram realizadas. Aguarde um instante e tente novamente.',
      500: 'A API encontrou um erro ao encerrar a sessão. Tente novamente em instantes.',
    };

    return messageByStatus[error.statusCode] ?? error.message;
  }
}
