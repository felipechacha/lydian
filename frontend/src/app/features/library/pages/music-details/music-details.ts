import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Subject, switchMap, takeUntil } from 'rxjs';
import { MetronomeAudioService } from '../../../../core/audio/metronome-audio.service';
import { ApiRequestError } from '../../../../core/http/api-request.error';
import { SeoService } from '../../../../core/seo/seo.service';
import { ToastrNotificationService } from '../../../../core/notifications/toastr-notification.service';
import { ContentSkeletonLoading } from '../../../../shared/ui/content-skeleton-loading/content-skeleton-loading';
import { ConfirmationModal } from '../../../../shared/ui/confirmation-modal/confirmation-modal';
import { DashboardShell } from '../../../../shared/ui/dashboard-shell/dashboard-shell';
import { PracticeSessionSetupModal } from '../../../practice/components/practice-session-setup-modal/practice-session-setup-modal';
import { PracticeSessionService } from '../../../practice/data-access/practice-session.service';
import {
  PracticeSessionHistoryItem,
  PracticeSessionSetupFormValue,
  StartPracticeSessionRequest,
} from '../../../practice/models/practice-session.models';
import { TechniquesService } from '../../../techniques/data-access/techniques.service';
import { Technique } from '../../../techniques/models/technique.models';
import { MiniMetronome } from '../../components/mini-metronome/mini-metronome';
import { MusicDetailsEditor } from '../../components/music-details-editor/music-details-editor';
import { MusicDetailsHero } from '../../components/music-details-hero/music-details-hero';
import { MusicRating } from '../../components/music-rating/music-rating';
import { MusicTechniques } from '../../components/music-techniques/music-techniques';
import { PracticeDiary } from '../../components/practice-diary/practice-diary';
import { PracticeDiaryDetailModal } from '../../components/practice-diary-detail-modal/practice-diary-detail-modal';
import { ProgressMonitor } from '../../components/progress-monitor/progress-monitor';
import { LibraryService } from '../../data-access/library.service';
import {
  MusicDetailsEditorValue,
  PracticeDiaryEntry,
  ProgressBar,
} from '../../models/music-details.models';
import { ApiSongDifficulty, SongResponse } from '../../models/add-music.models';
import { LibraryMusic, MusicDifficulty } from '../../models/musics.models';

@Component({
  selector: 'app-music-details',
  imports: [
    DashboardShell,
    ContentSkeletonLoading,
    MusicDetailsHero,
    ProgressMonitor,
    MusicTechniques,
    MusicRating,
    PracticeDiary,
    PracticeDiaryDetailModal,
    ConfirmationModal,
    MiniMetronome,
    PracticeSessionSetupModal,
    MusicDetailsEditor,
  ],
  templateUrl: './music-details.html',
  styleUrl: './music-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicDetails implements OnInit, OnDestroy {
  private readonly _seoService = inject(SeoService);
  private readonly _libraryService = inject(LibraryService);
  private readonly _practiceSessionService = inject(PracticeSessionService);
  private readonly _techniquesService = inject(TechniquesService);
  private readonly _changeDetectorRef = inject(ChangeDetectorRef);
  private readonly _metronomeAudioService = inject(MetronomeAudioService);
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _router = inject(Router);
  private readonly _toastrNotificationService = inject(ToastrNotificationService);
  private readonly _destroySubject = new Subject<void>();
  private readonly _artworkFallbackUrl = '/images/music-cover-placeholder.svg';
  private readonly _musicId = this._activatedRoute.snapshot.paramMap.get('id') ?? '';
  private _music: LibraryMusic<string> | null = null;
  private _song: SongResponse | null = null;
  private _techniqueCatalog: readonly Technique[] = [];
  private _isLoadingTechniques = false;
  private _techniquesErrorMessage = '';
  private _isSavingMusic = false;
  private _isLoading = false;
  private _isDeletingMusic = false;
  private _isDeleteMusicConfirmationOpen = false;
  private _errorMessage = '';
  private _deleteMusicErrorMessage = '';
  private readonly _isPracticeSetupOpen = signal(false);
  private readonly _selectedDiaryEntry = signal<PracticeDiaryEntry | null>(null);
  private _isCreatingPractice = false;
  private _practiceCreationErrorMessage = '';
  private _isSaved = false;
  private _rating = 4;
  private _practiceNotes = '';
  private _tempo = 72;
  private _isMetronomeRunning = false;
  private _isMetronomeStarting = false;
  private _isDestroyed = false;

  private readonly _progressBars: readonly ProgressBar[] = [
    { value: 28 },
    { value: 36 },
    { value: 31 },
    { value: 46 },
    { value: 43 },
    { value: 55 },
    { value: 61 },
    { value: 57 },
    { value: 69 },
    { value: 76 },
    { value: 81 },
    { value: 92, isCurrent: true },
  ];

  private _diaryEntries: readonly PracticeDiaryEntry[] = [];

  ngOnInit(): void {
    this._seoService.updateSeo({
      title: 'Detalhes da música',
      description: 'Consulte os detalhes e acompanhe sua prática musical no Lydian.',
      keywords: ['detalhes da música', 'progresso musical', 'prática', 'Lydian'],
    });
    this._loadMusicDetails();
    this.loadTechniques();
  }

  ngOnDestroy(): void {
    this._isDestroyed = true;
    this._metronomeAudioService.stop();
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  get music(): LibraryMusic<string> | null {
    return this._music;
  }

  get song(): SongResponse | null {
    return this._song;
  }

  get techniqueCatalog(): readonly Technique[] {
    return this._techniqueCatalog;
  }

  get isLoadingTechniques(): boolean {
    return this._isLoadingTechniques;
  }

  get techniquesErrorMessage(): string {
    return this._techniquesErrorMessage;
  }

  get isSavingMusic(): boolean {
    return this._isSavingMusic;
  }

  get isLoading(): boolean {
    return this._isLoading;
  }

  get errorMessage(): string {
    return this._errorMessage;
  }

  get isDeletingMusic(): boolean {
    return this._isDeletingMusic;
  }

  get isDeleteMusicConfirmationOpen(): boolean {
    return this._isDeleteMusicConfirmationOpen;
  }

  get deleteMusicErrorMessage(): string {
    return this._deleteMusicErrorMessage;
  }

  get isPracticeSetupOpen(): boolean {
    return this._isPracticeSetupOpen();
  }

  get isCreatingPractice(): boolean {
    return this._isCreatingPractice;
  }

  get practiceCreationErrorMessage(): string {
    return this._practiceCreationErrorMessage;
  }

  get isSaved(): boolean {
    return this._isSaved;
  }

  get rating(): number {
    return this._rating;
  }

  get practiceNotes(): string {
    return this._practiceNotes;
  }

  get tempo(): number {
    return this._tempo;
  }

  get isMetronomeRunning(): boolean {
    return this._isMetronomeRunning;
  }

  get progressBars(): readonly ProgressBar[] {
    return this._progressBars;
  }

  get diaryEntries(): readonly PracticeDiaryEntry[] {
    return this._diaryEntries;
  }

  get selectedDiaryEntry(): PracticeDiaryEntry | null {
    return this._selectedDiaryEntry();
  }

  public toggleSaved(): void {
    this._isSaved = !this._isSaved;
  }

  public updateRating(rating: number): void {
    this._rating = rating;
  }

  public updatePracticeNotes(notes: string): void {
    this._practiceNotes = notes;
  }

  public openDiaryEntry(entry: PracticeDiaryEntry): void {
    this._selectedDiaryEntry.set(entry);
  }

  public closeDiaryEntry(): void {
    this._selectedDiaryEntry.set(null);
  }

  public openPracticeSetup(): void {
    if (this._isCreatingPractice || !this._music) {
      return;
    }

    this._practiceCreationErrorMessage = '';
    this._isPracticeSetupOpen.set(true);
  }

  public closePracticeSetup(): void {
    if (this._isCreatingPractice) {
      return;
    }

    this._isPracticeSetupOpen.set(false);
    this._practiceCreationErrorMessage = '';
  }

  public createPracticeSession(formValue: PracticeSessionSetupFormValue): void {
    if (this._isCreatingPractice || !this._musicId) {
      return;
    }

    this._isCreatingPractice = true;
    this._practiceCreationErrorMessage = '';

    const payload = this._createPracticeSessionPayload(formValue);
    this._practiceSessionService
      .startPracticeSession(payload)
      .pipe(takeUntil(this._destroySubject))
      .subscribe({
        next: (response) => {
          this._toastrNotificationService.success(
            'Sua sessão foi criada e já está pronta para começar.',
            'Sessão criada',
          );
          void this._router.navigate(['/practice-session', response.data.id], {
            state: { practiceSessionFresh: true },
          });
        },
        error: (error: unknown) => {
          this._isCreatingPractice = false;
          this._practiceCreationErrorMessage = this._getCreatePracticeSessionErrorMessage(error);
          this._toastrNotificationService.error(
            this._practiceCreationErrorMessage,
            'Falha ao criar sessão',
          );
          this._changeDetectorRef.markForCheck();
        },
        complete: () => {
          this._isCreatingPractice = false;
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  public saveMusicDetails(value: MusicDetailsEditorValue): void {
    if (this._isSavingMusic || !this._musicId) {
      return;
    }

    this._isSavingMusic = true;
    this._libraryService
      .updateMusic(this._musicId, value.song)
      .pipe(
        switchMap(() =>
          this._libraryService.updateMusicTechniques(this._musicId, {
            technique_ids: value.techniqueIds,
          }),
        ),
        takeUntil(this._destroySubject),
      )
      .subscribe({
        next: (response) => {
          this._song = response.data;
          this._music = this._createLibraryMusic(response.data);
          this._tempo = this._music.bpm || 72;
          this._toastrNotificationService.success(
            'Os dados de estudo da música foram atualizados.',
            'Música atualizada',
          );
        },
        error: () => {
          this._isSavingMusic = false;
          this._toastrNotificationService.error(
            'Não foi possível atualizar todos os dados da música.',
            'Falha ao atualizar',
          );
          this._changeDetectorRef.markForCheck();
        },
        complete: () => {
          this._isSavingMusic = false;
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  public loadTechniques(): void {
    this._isLoadingTechniques = true;
    this._techniquesErrorMessage = '';
    this._techniquesService
      .getTechniques()
      .pipe(takeUntil(this._destroySubject))
      .subscribe({
        next: (response) => {
          this._techniqueCatalog = response.data;
        },
        error: () => {
          this._isLoadingTechniques = false;
          this._techniquesErrorMessage = 'Não foi possível carregar o catálogo de técnicas.';
          this._changeDetectorRef.markForCheck();
        },
        complete: () => {
          this._isLoadingTechniques = false;
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  public requestMusicDeletion(): void {
    if (this._isDeletingMusic) {
      return;
    }

    this._deleteMusicErrorMessage = '';
    this._isDeleteMusicConfirmationOpen = true;
  }

  public cancelMusicDeletion(): void {
    if (this._isDeletingMusic) {
      return;
    }

    this._isDeleteMusicConfirmationOpen = false;
    this._deleteMusicErrorMessage = '';
  }

  public deleteMusic(): void {
    if (this._isDeletingMusic || !this._musicId) {
      return;
    }

    this._isDeletingMusic = true;
    this._deleteMusicErrorMessage = '';
    this._libraryService
      .deleteMusic(this._musicId)
      .pipe(takeUntil(this._destroySubject))
      .subscribe({
        next: () => {
          this._toastrNotificationService.success(
            'A música foi excluída da sua biblioteca.',
            'Música excluída',
          );
          void this._router.navigate(['/musics']);
        },
        error: (error: unknown) => {
          this._isDeletingMusic = false;
          this._deleteMusicErrorMessage = this._getDeleteMusicErrorMessage(error);
          this._toastrNotificationService.error(
            this._deleteMusicErrorMessage,
            'Falha ao excluir música',
          );
          this._changeDetectorRef.markForCheck();
        },
        complete: () => {
          this._isDeletingMusic = false;
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  public changeTempo(tempo: number): void {
    this._tempo = Math.min(220, Math.max(40, tempo));
    this._metronomeAudioService.updateTempo(this._tempo);
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

  private _loadMusicDetails(): void {
    if (!this._musicId) {
      this._errorMessage = 'Não foi possível identificar a música solicitada.';
      return;
    }

    this._isLoading = true;
    this._errorMessage = '';

    this._libraryService
      .getMusicDetails(this._musicId)
      .pipe(takeUntil(this._destroySubject))
      .subscribe({
        next: (response) => {
          this._song = response.data;
          this._music = this._createLibraryMusic(response.data);
          this._tempo = this._music.bpm || 72;
          this._updateMusicSeo(this._music);
          this._loadPracticeDiary();
        },
        error: (error: unknown) => {
          this._isLoading = false;
          this._errorMessage = this._getMusicDetailsErrorMessage(error);
          this._toastrNotificationService.error(this._errorMessage, 'Falha nos detalhes da música');
          this._changeDetectorRef.markForCheck();
        },
        complete: () => {
          this._isLoading = false;
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  private _createPracticeSessionPayload(
    formValue: PracticeSessionSetupFormValue,
  ): StartPracticeSessionRequest {
    const title = formValue.title.trim();
    const focusArea = formValue.focusArea.trim();
    const mood = formValue.mood.trim();
    const notes = formValue.notes.trim();

    return {
      song_id: this._musicId,
      title,
      started_at: new Date().toISOString(),
      practiced_bpm: this._tempo,
      technique_ids: this._song?.song_techniques?.map(({ techniques }) => techniques.id) ?? [],
      ...(focusArea ? { focus_area: focusArea } : {}),
      ...(mood ? { mood } : {}),
      ...(notes ? { notes } : {}),
    };
  }

  private _createLibraryMusic(music: SongResponse): LibraryMusic<string> {
    return {
      id: music.id,
      title: music.title,
      composer: music.artist,
      artworkUrl: this._resolveArtworkUrl(music.cover_image_url),
      bpm: music.bpm ?? 0,
      targetBpm: music.target_bpm,
      durationSeconds: music.duration_seconds,
      difficulty: this._mapDifficulty(music.difficulty),
      masteryPercentage: 0,
      status: music.learning_status ?? 'learning',
      priority: music.priority,
      lastPracticedAt: music.last_practiced_at,
      techniques: music.song_techniques?.map(({ techniques }) => techniques.name) ?? [],
      technicalFocus: music.notes ?? undefined,
    };
  }

  private _loadPracticeDiary(): void {
    this._practiceSessionService
      .getRecentSessionsForSong(this._musicId)
      .pipe(
        map((history) => this._createDiaryEntries(history)),
        takeUntil(this._destroySubject),
      )
      .subscribe({
        next: (entries) => {
          this._diaryEntries = entries;
          this._changeDetectorRef.markForCheck();
        },
        error: (error: unknown) => {
          this._diaryEntries = [];
          this._toastrNotificationService.error(
            this._getPracticeDiaryErrorMessage(error),
            'Falha no histórico de prática',
          );
          this._changeDetectorRef.markForCheck();
        },
      });
  }

  private _createDiaryEntries(
    history: readonly PracticeSessionHistoryItem[],
  ): readonly PracticeDiaryEntry[] {
    return history
      .slice(0, 3)
      .map((item, index) => this._createDiaryEntry(item, index))
      .filter((entry): entry is PracticeDiaryEntry => entry !== null);
  }

  private _createDiaryEntry(
    historyItem: PracticeSessionHistoryItem,
    index: number,
  ): PracticeDiaryEntry | null {
    const { session, sequence } = historyItem;
    const song = session.practice_session_songs.find(
      (sessionSong) => sessionSong.song_id === this._musicId,
    );

    if (!song) {
      return null;
    }

    return {
      sessionId: session.id,
      session: sequence,
      title: session.title ?? `Prática de ${song.songs.title}`,
      date: this._formatPracticeDate(session.started_at),
      duration: this._formatDuration(
        song.seconds_practiced ??
          session.duration_seconds ??
          (song.minutes_practiced ?? session.duration_minutes ?? 0) * 60,
      ),
      progress: (song.progress_rating ?? 0) * 20,
      tempo: song.practiced_bpm ?? song.songs.bpm ?? 0,
      mood: session.mood,
      focusArea: session.focus_area,
      sessionNotes: session.notes,
      songNotes: song.notes,
      accent: (['secondary', 'primary', 'tertiary'] as const)[index % 3],
    };
  }

  private _formatDuration(durationSeconds: number): string {
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes} min`;
  }

  private _formatPracticeDate(startedAt: string): string {
    const sessionDate = new Date(startedAt);

    if (!Number.isFinite(sessionDate.getTime())) {
      return 'Data indisponível';
    }

    const time = new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(sessionDate);
    const today = new Date();
    const sessionDay = new Date(
      sessionDate.getFullYear(),
      sessionDate.getMonth(),
      sessionDate.getDate(),
    ).getTime();
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const dayDifference = Math.round((todayDay - sessionDay) / 86_400_000);

    if (dayDifference === 0) {
      return `Hoje, ${time}`;
    }

    if (dayDifference === 1) {
      return `Ontem, ${time}`;
    }

    const date = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
    })
      .format(sessionDate)
      .replace('.', '');

    return `${date}, ${time}`;
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

  private _updateMusicSeo(music: LibraryMusic<string>): void {
    this._seoService.updateSeo({
      title: music.title,
      description: `Detalhes, progresso e histórico de prática de ${music.title}, por ${music.composer}.`,
      keywords: ['detalhes da música', 'progresso musical', 'prática', 'Lydian'],
    });
  }

  private _getMusicDetailsErrorMessage(error: unknown): string {
    if (!(error instanceof ApiRequestError)) {
      return 'Não foi possível carregar os detalhes da música.';
    }

    if (error.statusCode === 404) {
      return 'A música solicitada não foi encontrada na sua biblioteca.';
    }

    if (error.statusCode === 401) {
      return 'Sua sessão expirou. Entre novamente para consultar esta música.';
    }

    if (error.statusCode === 403) {
      return 'Você não possui permissão para consultar esta música.';
    }

    if (error.statusCode === 500) {
      return 'A API encontrou um erro ao carregar a música. Tente novamente em instantes.';
    }

    return error.message || 'Não foi possível carregar os detalhes da música.';
  }

  private _getDeleteMusicErrorMessage(error: unknown): string {
    if (!(error instanceof ApiRequestError)) {
      return 'Não foi possível excluir a música da sua biblioteca.';
    }

    if (error.statusCode === 404) {
      return 'A música solicitada não foi encontrada na sua biblioteca.';
    }

    if (error.statusCode === 401) {
      return 'Sua sessão expirou. Entre novamente para excluir esta música.';
    }

    if (error.statusCode === 403) {
      return 'Você não possui permissão para excluir esta música.';
    }

    if (error.statusCode === 429) {
      return 'Muitas solicitações foram realizadas. Aguarde um instante e tente novamente.';
    }

    if (error.statusCode === 500) {
      return 'A API encontrou um erro ao excluir a música. Tente novamente em instantes.';
    }

    return error.message || 'Não foi possível excluir a música da sua biblioteca.';
  }

  private _getCreatePracticeSessionErrorMessage(error: unknown): string {
    if (!(error instanceof ApiRequestError)) {
      return 'Não foi possível criar e associar a sessão de prática.';
    }

    const messageByStatus: Readonly<Record<number, string>> = {
      400: 'Revise as informações da sessão e tente novamente.',
      401: 'Sua sessão expirou. Entre novamente para iniciar a prática.',
      403: 'Você não possui permissão para iniciar esta prática.',
      404: 'A música não foi encontrada na sua biblioteca.',
      409: 'Esta música já está associada à sessão criada.',
      429: 'Muitas solicitações foram realizadas. Aguarde um instante e tente novamente.',
      500: 'A API encontrou um erro ao criar a sessão. Tente novamente em instantes.',
    };

    return messageByStatus[error.statusCode] ?? error.message;
  }

  private _getPracticeDiaryErrorMessage(error: unknown): string {
    if (!(error instanceof ApiRequestError)) {
      return 'Não foi possível carregar as sessões recentes desta música.';
    }

    if (error.statusCode === 401) {
      return 'Sua sessão expirou. Entre novamente para consultar o histórico.';
    }

    if (error.statusCode === 429) {
      return 'Muitas solicitações foram realizadas. Aguarde um instante e tente novamente.';
    }

    return error.message || 'Não foi possível carregar as sessões recentes desta música.';
  }
}
