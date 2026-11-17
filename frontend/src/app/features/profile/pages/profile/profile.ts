import { isPlatformBrowser } from '@angular/common';
import { PracticeSummaryService } from '../../data-access/practice-summary.service';
import { PracticeSummary, goalPercentage } from '../../models/practice-summary.models';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { SeoService } from '../../../../core/seo/seo.service';
import { DashboardShell } from '../../../../shared/ui/dashboard-shell/dashboard-shell';
import { ContentSkeletonLoading } from '../../../../shared/ui/content-skeleton-loading/content-skeleton-loading';
import { AchievementCard } from '../../components/achievement-card/achievement-card';
import { ProfileIdentity } from '../../components/profile-identity/profile-identity';
import { PracticeGoalEditor } from '../../components/practice-goal-editor/practice-goal-editor';
import { ProfileStatCard } from '../../components/profile-stat-card/profile-stat-card';
import { RecentAchievements } from '../../components/recent-achievements/recent-achievements';
import { SkillMatrix } from '../../components/skill-matrix/skill-matrix';
import { TrainingIntensity } from '../../components/training-intensity/training-intensity';
import {
  AchievementPreview,
  MusicianProfile,
  ProfileAchievement,
  ProfileStat,
  SkillMetric,
  TrainingMetric,
  UserProfileResponse,
} from '../../models/profile.models';
import { ProfileService } from '../../services/profile.service';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { ToastrNotificationService } from '../../../../core/notifications/toastr-notification.service';
import { PracticeGoalService } from '../../data-access/practice-goal.service';
import { PracticeGoal, UpdatePracticeGoalRequest } from '../../models/practice-goal.models';

@Component({
  selector: 'app-profile',
  imports: [
    DashboardShell,
    ContentSkeletonLoading,
    ProfileIdentity,
    ProfileStatCard,
    SkillMatrix,
    TrainingIntensity,
    RecentAchievements,
    AchievementCard,
    PracticeGoalEditor,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile implements OnInit, OnDestroy {
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly _practiceSummaryService = inject(PracticeSummaryService);
  constructor(
    private _profileService: ProfileService,
    private _practiceGoalService: PracticeGoalService,
    private _seoService: SeoService,
    private _cdr: ChangeDetectorRef,
    private _toastrNotificationService: ToastrNotificationService,
  ) {}

  // private readonly _seoService = inject(SeoService);
  private _profile: MusicianProfile | null = null;
  private _practiceGoal: PracticeGoal | null = null;
  private _loading: boolean = false;
  private _isSavingGoal = false;
  private _unsubscribe$ = new Subject<void>();

  private _stats: readonly ProfileStat[] = [];
  private _skills: readonly SkillMetric[] = [];
  private _trainingMetrics: readonly TrainingMetric[] = [];
  private _recentAchievements: readonly AchievementPreview[] = [];
  private _achievements: readonly ProfileAchievement[] = [];

  ngOnInit(): void {
    this._seoService.updateSeo({
      title: 'Perfil',
      description: 'Acompanhe suas preferências, objetivos e evolução musical no Lydian.',
      keywords: ['perfil musical', 'objetivos', 'progresso musical', 'Lydian'],
    });

    if (this._isBrowser) {
      this._loadProfileData();
    }
  }

  ngOnDestroy(): void {
    this._unsubscribe$.next();
    this._unsubscribe$.complete();
  }

  get isLoading(): boolean {
    return this._loading;
  }

  get profile(): MusicianProfile | null {
    return this._profile;
  }

  get practiceGoal(): PracticeGoal | null {
    return this._practiceGoal;
  }

  get isSavingGoal(): boolean {
    return this._isSavingGoal;
  }

  public savePracticeGoal(payload: UpdatePracticeGoalRequest): void {
    if (this._isSavingGoal) {
      return;
    }

    this._isSavingGoal = true;
    this._practiceGoalService
      .updatePracticeGoal(payload)
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe({
        next: (response) => {
          this._practiceGoal = response.data;
          this._refreshPracticeSummary();
          this._toastrNotificationService.success(
            'Sua rotina de prática foi atualizada.',
            'Meta salva',
          );
        },
        error: () => {
          this._isSavingGoal = false;
          this._toastrNotificationService.error(
            'Não foi possível atualizar sua meta de prática.',
            'Falha ao salvar meta',
          );
          this._cdr.markForCheck();
        },
        complete: () => {
          this._isSavingGoal = false;
          this._cdr.markForCheck();
        },
      });
  }

  get stats(): readonly ProfileStat[] {
    return this._stats;
  }

  get skills(): readonly SkillMetric[] {
    return this._skills;
  }

  get trainingMetrics(): readonly TrainingMetric[] {
    return this._trainingMetrics;
  }

  get recentAchievements(): readonly AchievementPreview[] {
    return this._recentAchievements;
  }

  get achievements(): readonly ProfileAchievement[] {
    return this._achievements;
  }

  private _loadProfileData(): void {
    this._loading = true;

    forkJoin({
      profile: this._profileService.getProfile(),
      goal: this._practiceGoalService.getPracticeGoal(),
      summary: this._practiceSummaryService.getPracticeSummary(),
    })
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe({
        next: ({ profile, goal, summary }) => {
          this._profile = this._mapProfileDataToMusicianProfile(profile.data);
          this._practiceGoal = goal.data;
          this._applyPracticeSummary(summary.data);
        },
        error: () => {
          this._loading = false;
          this._toastrNotificationService.error(
            'Não foi possível carregar seu perfil.',
            'Falha no perfil',
          );
          this._cdr.markForCheck();
        },
        complete: () => {
          this._loading = false;
          this._cdr.markForCheck();
        },
      });
  }

  private _refreshPracticeSummary(): void {
    this._practiceSummaryService
      .getPracticeSummary()
      .pipe(takeUntil(this._unsubscribe$))
      .subscribe({
        next: ({ data }) => {
          this._applyPracticeSummary(data);
          this._cdr.markForCheck();
        },
        error: () =>
          this._toastrNotificationService.error(
            'A meta foi salva, mas os indicadores não puderam ser atualizados.',
            'Falha ao atualizar indicadores',
          ),
        complete: () => this._cdr.markForCheck(),
      });
  }

  private _applyPracticeSummary(summary: PracticeSummary): void {
    this._stats = [
      {
        label: 'Tempo Total de Prática',
        value: (summary.totals.duration_seconds / 3600).toLocaleString('pt-BR', {
          maximumFractionDigits: 1,
        }),
        unit: 'hrs',
        icon: 'timer',
        highlight: String(summary.totals.session_count),
        highlightLabel: 'sessões concluídas',
        tone: 'primary',
      },
      {
        label: 'Sequência Atual',
        value: String(summary.streak.current_days),
        unit: 'dias',
        icon: 'local_fire_department',
        highlight: String(summary.streak.longest_days),
        highlightLabel: 'dias de recorde',
        tone: 'secondary',
      },
      {
        label: 'Obras Dominadas',
        value: String(summary.totals.mastered_songs),
        unit: 'peças',
        icon: 'library_music',
        highlight: String(summary.totals.practiced_days),
        highlightLabel: 'dias de prática',
        tone: 'tertiary',
      },
    ];
    const categories = ['articulation', 'expression', 'harmony', 'theory', 'reading', 'rhythm'];
    const labels = ['Articulação', 'Expressão', 'Harmonia', 'Teoria', 'Leitura', 'Ritmo'];
    const positions: SkillMetric['position'][] = [
      'top',
      'top-right',
      'bottom-right',
      'bottom',
      'bottom-left',
      'top-left',
    ];
    // Techniques can share a session. These percentages describe recorded technique time,
    // not skill mastery or a percentage of the user's overall session time.
    const totalTechniqueSeconds = summary.skills.reduce(
      (total, skill) => total + skill.seconds_practiced,
      0,
    );
    this._skills = categories.map((category, index) => ({
      label: labels[index],
      position: positions[index],
      value: goalPercentage(
        summary.skills
          .filter((skill) => skill.category === category)
          .reduce((total, skill) => total + skill.seconds_practiced, 0),
        totalTechniqueSeconds,
      ),
    }));
    this._trainingMetrics = [
      {
        label: 'Meta diária',
        value: goalPercentage(summary.daily.duration_seconds, summary.goal.daily_target_seconds),
        tone: 'secondary',
      },
      {
        label: 'Frequência semanal',
        value: goalPercentage(summary.week.practiced_days, summary.goal.weekly_target_days),
        tone: 'primary',
      },
      {
        label: 'Dias com meta atingida',
        value: goalPercentage(summary.week.goal_reached_days, summary.goal.weekly_target_days),
        tone: 'tertiary',
      },
    ];
    const definitions = {
      'first-session': {
        title: 'Primeira prática',
        icon: 'military_tech',
        tone: 'secondary' as const,
        description: 'Conclua uma sessão de prática.',
      },
      'seven-day-streak': {
        title: 'Uma semana de ritmo',
        icon: 'schedule',
        tone: 'primary' as const,
        description: 'Pratique por sete dias consecutivos.',
      },
      'ten-hours': {
        title: 'Dez horas de música',
        icon: 'auto_awesome',
        tone: 'tertiary' as const,
        description: 'Acumule dez horas de prática.',
      },
    };
    this._achievements = summary.achievements.map((achievement) => ({
      ...definitions[achievement.key],
      tone: achievement.unlocked ? definitions[achievement.key].tone : 'neutral',
      description: `${definitions[achievement.key].description} ${achievement.unlocked ? 'Conquistado.' : `Progresso: ${goalPercentage(achievement.progress, achievement.target)}%.`}`,
    }));
    this._recentAchievements = summary.achievements.map((achievement) => ({
      label: definitions[achievement.key].title,
      icon: definitions[achievement.key].icon,
      tone: achievement.unlocked ? definitions[achievement.key].tone : 'neutral',
      isLocked: !achievement.unlocked,
    }));
    this._achievements = [
      ...this._achievements,
      {
        title: 'Novas conquistas',
        description: 'Continue construindo sua rotina de prática.',
        icon: 'lock',
        tone: 'neutral',
      },
    ];
    this._recentAchievements = [
      ...this._recentAchievements,
      { label: 'Próxima conquista', icon: 'lock', tone: 'neutral', isLocked: true },
    ];
  }

  private _mapProfileDataToMusicianProfile(data: UserProfileResponse): MusicianProfile {
    return {
      name: data.display_name ?? 'Músico Lydian',
      role: data.main_instrument ?? 'Instrumento não informado',
      membershipDays: this._countDaysOfMembership(data.created_at),
      level: this._mapExperienceLevel(data.experience_level),
      badges: [],
      isVerified: false,
      avatarUrl: data.avatar_url ?? '/images/profile-avatar-placeholder.svg',
    };
  }

  private _mapExperienceLevel(experienceLevel: string | null): number {
    const levelByExperience: Readonly<Record<string, number>> = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
      professional: 4,
    };
    return experienceLevel ? (levelByExperience[experienceLevel] ?? 0) : 0;
  }

  private _countDaysOfMembership(joinDate: string): number {
    if (!joinDate) {
      return 0;
    }

    const joinDateObj = new Date(joinDate);
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - joinDateObj.getTime();
    const daysOfMembership = Math.floor(timeDifference / (1000 * 3600 * 24));
    return daysOfMembership;
  }
}
