export interface DailyPracticeSummary {
  userName: string;
  completedMinutes: number;
  targetMinutes: number;
  remainingMinutes: number;
}

export interface UpcomingPractice {
  title: string;
  composer: string;
  technicalFocus: readonly string[];
}

export interface StreakDay {
  label: string;
  completionPercentage: number;
  isCompleted: boolean;
}

export interface PracticeStreak {
  days: number;
  week: readonly StreakDay[];
}

export type SessionGradeTone = 'primary' | 'success';

export interface RecentPracticeSession {
  readonly sessionId: string;
  readonly songId: string;
  title: string;
  description: string;
  grade: string;
  gradeTone: SessionGradeTone;
}

export type PerformanceMetricTone = 'default' | 'primary' | 'success';

export interface PerformanceMetric {
  label: string;
  value: string;
  tone: PerformanceMetricTone;
}

export interface WeeklyPerformanceSummary {
  score: number;
  variation: number | null;
  recommendedFocus: string;
  metrics: readonly PerformanceMetric[];
}
