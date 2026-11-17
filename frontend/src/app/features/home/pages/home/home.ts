import { isPlatformBrowser } from '@angular/common';
import { Component, OnDestroy, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { ToastrNotificationService } from '../../../../core/notifications/toastr-notification.service';
import { SeoService } from '../../../../core/seo/seo.service';
import { DashboardShell } from '../../../../shared/ui/dashboard-shell/dashboard-shell';
import { DailyPractice } from '../../components/daily-practice/daily-practice';
import { NextPracticeCard } from '../../components/next-practice-card/next-practice-card';
import { PracticeStreakCard } from '../../components/practice-streak-card/practice-streak-card';
import { RecentSessionsCard } from '../../components/recent-sessions-card/recent-sessions-card';
import { WeeklyPerformance } from '../../components/weekly-performance/weekly-performance';
import {
  DailyPracticeSummary,
  PracticeStreak,
  RecentPracticeSession,
  UpcomingPractice,
  WeeklyPerformanceSummary,
} from '../../models/home.models';
import { AuthService } from '../../../../core/auth/auth.service';
import { ContentSkeletonLoading } from '../../../../shared/ui/content-skeleton-loading/content-skeleton-loading';
import { PracticeSessionService } from '../../../practice/data-access/practice-session.service';
import { PracticeSessionHistoryItem } from '../../../practice/models/practice-session.models';
import { PracticeSummaryService } from '../../../profile/data-access/practice-summary.service';
import { PracticeSummary, goalPercentage } from '../../../profile/models/practice-summary.models';
// Alternativa de loading com waves preservada para avaliação:
// import { MusicLoading } from '../../../../shared/ui/music-loading/music-loading';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    DashboardShell,
    DailyPractice,
    NextPracticeCard,
    PracticeStreakCard,
    RecentSessionsCard,
    WeeklyPerformance,
    // MusicLoading,
    ContentSkeletonLoading,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit, OnDestroy {
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor(
    private _seoService: SeoService,
    private _authService: AuthService,
    private _toastrNotificationService: ToastrNotificationService,
    private _practiceSessionService: PracticeSessionService,
    private _practiceSummaryService: PracticeSummaryService,
    private _router: Router,
  ) {}

  // private readonly _seoService = inject(SeoService);

  private _dailyPractice: DailyPracticeSummary = {
    userName: '',
    completedMinutes: 0,
    targetMinutes: 60,
    remainingMinutes: 60,
  };

  private _currentUserName: string = '';
  private _loading: boolean = false;
  private readonly _destroySubject = new Subject<void>();

  private readonly _upcomingPractice: UpcomingPractice = {
    title: 'Escolha uma música',
    composer: 'Na sua biblioteca',
    technicalFocus: ['Seu repertório', 'Sua próxima prática'],
  };

  private _practiceStreak: PracticeStreak = {
    days: 0,
    week: [
      { label: 'S', completionPercentage: 0, isCompleted: false },
      { label: 'T', completionPercentage: 0, isCompleted: false },
      { label: 'Q', completionPercentage: 0, isCompleted: false },
      { label: 'Q', completionPercentage: 0, isCompleted: false },
      { label: 'S', completionPercentage: 0, isCompleted: false },
      { label: 'S', completionPercentage: 0, isCompleted: false },
      { label: 'D', completionPercentage: 0, isCompleted: false },
    ],
  };

  private _recentSessions: readonly RecentPracticeSession[] = [];

  private _weeklyPerformance: WeeklyPerformanceSummary = {
    score: 0,
    variation: null,
    recommendedFocus: 'Nenhuma prática nesta semana',
    metrics: [
      { label: 'BPM médio', value: '—', tone: 'success' },
      { label: 'Prática semanal', value: '0 min', tone: 'primary' },
      { label: 'Obras dominadas', value: '0', tone: 'default' },
    ],
  };

  ngOnInit(): void {
    this._seoService.updateSeo({
      title: 'Painel de prática',
      description: 'Acompanhe sua rotina, sessões recentes e evolução musical no Lydian.',
      keywords: ['prática musical', 'painel', 'progresso', 'Lydian'],
    });

    if (this._isBrowser) {
      this._loadDashboard();
    } else {
      this._loading = false;
    }
  }

  ngOnDestroy(): void {
    this._destroySubject.next();
    this._destroySubject.complete();
  }

  get dailyPractice(): DailyPracticeSummary {
    return {
      userName: this._currentUserName,
      completedMinutes: this._dailyPractice.completedMinutes,
      targetMinutes: this._dailyPractice.targetMinutes,
      remainingMinutes: this._dailyPractice.remainingMinutes,
    };
  }

  get upcomingPractice(): UpcomingPractice {
    return this._upcomingPractice;
  }

  get practiceStreak(): PracticeStreak {
    return this._practiceStreak;
  }

  get recentSessions(): readonly RecentPracticeSession[] {
    return this._recentSessions;
  }

  get weeklyPerformance(): WeeklyPerformanceSummary {
    return this._weeklyPerformance;
  }

  get isLoading(): boolean {
    return this._loading;
  }

  public openMusicDetails(songId: string): void {
    if (!songId) {
      return;
    }

    void this._router.navigate(['/music-details', songId]);
  }

  public openPracticeHistory(): void {
    void this._router.navigate(['/practice-history']);
  }

  private _loadDashboard(): void {
    this._loading = true;

    forkJoin({
      user: this._authService.getCurrentUser(),
      summary: this._practiceSummaryService.getPracticeSummary(),
      history: this._practiceSessionService.getRecentPracticeSessions(3),
    })
      .pipe(takeUntil(this._destroySubject))
      .subscribe({
        next: ({ user, summary, history }) => {
          this._currentUserName = user.data.display_name ?? 'Músico Lydian';
          this._applyPracticeSummary(summary.data);
          this._recentSessions = history
            .slice(0, 3)
            .map((item) => this._createRecentSession(item))
            .filter((session): session is RecentPracticeSession => session !== null);
        },
        error: () => {
          this._loading = false;
          this._toastrNotificationService.error(
            'Não foi possível carregar os dados da home.',
            'Falha na home',
          );
        },
        complete: () => {
          this._loading = false;
        },
      });
  }

  private _applyPracticeSummary(summary: PracticeSummary): void {
    const targetMinutes = Math.ceil(summary.goal.daily_target_seconds / 60);
    const completedMinutes = Math.floor(summary.daily.duration_seconds / 60);
    this._dailyPractice = {
      userName: this._currentUserName,
      targetMinutes,
      completedMinutes,
      remainingMinutes: Math.max(
        0,
        Math.ceil((summary.goal.daily_target_seconds - summary.daily.duration_seconds) / 60),
      ),
    };
    this._practiceStreak = {
      days: summary.streak.current_days,
      week: summary.calendar.map((day, index) => ({
        label: ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'][index],
        completionPercentage: goalPercentage(
          day.duration_seconds,
          summary.goal.daily_target_seconds,
        ),
        isCompleted: day.goal_reached,
      })),
    };
    this._weeklyPerformance = {
      score: goalPercentage(summary.week.practiced_days, summary.goal.weekly_target_days),
      variation:
        summary.week.previous_duration_seconds > 0
          ? Math.round(
              (summary.week.duration_seconds / summary.week.previous_duration_seconds - 1) * 100,
            )
          : null,
      recommendedFocus: `${summary.week.practiced_days} de ${summary.goal.weekly_target_days} dias de prática`,
      metrics: [
        {
          label: 'BPM médio',
          value:
            summary.totals.average_bpm === null
              ? '—'
              : `${Math.round(summary.totals.average_bpm)} BPM`,
          tone: 'success',
        },
        {
          label: 'Prática semanal',
          value: `${Math.floor(summary.week.duration_seconds / 60)} min`,
          tone: 'primary',
        },
        { label: 'Obras dominadas', value: String(summary.totals.mastered_songs), tone: 'default' },
      ],
    };
  }

  private _createRecentSession(
    historyItem: PracticeSessionHistoryItem,
  ): RecentPracticeSession | null {
    const { session } = historyItem;
    const sessionSong = session.practice_session_songs[0];

    if (!sessionSong) {
      return null;
    }

    const seconds = sessionSong.seconds_practiced ?? session.duration_seconds ?? 0;
    const minutes = Math.floor(seconds / 60);
    const rating = sessionSong.progress_rating ?? 0;
    return {
      sessionId: session.id,
      songId: sessionSong.song_id,
      title: sessionSong.songs.title,
      description: `${sessionSong.songs.artist} • ${minutes}m de prática`,
      grade: this._getSessionGrade(rating),
      gradeTone: rating >= 4 ? 'success' : 'primary',
    };
  }

  private _getSessionGrade(rating: number): string {
    return ['—', 'D', 'C', 'B', 'A', 'A+'][rating] ?? '—';
  }
}
