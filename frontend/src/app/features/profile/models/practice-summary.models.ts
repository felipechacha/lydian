export interface PracticeSummary {
  readonly timezone: string;
  readonly as_of: string;
  readonly today: string;
  readonly goal: { readonly daily_target_seconds: number; readonly weekly_target_days: number };
  readonly totals: {
    readonly duration_seconds: number;
    readonly session_count: number;
    readonly practiced_days: number;
    readonly mastered_songs: number;
    readonly average_bpm: number | null;
  };
  readonly streak: { readonly current_days: number; readonly longest_days: number };
  readonly daily: {
    readonly duration_seconds: number;
    readonly session_count: number;
    readonly goal_reached: boolean;
  };
  readonly week: {
    readonly starts_on: string;
    readonly duration_seconds: number;
    readonly practiced_days: number;
    readonly goal_reached_days: number;
    readonly goal_reached: boolean;
    readonly previous_duration_seconds: number;
  };
  readonly calendar: readonly {
    readonly date: string;
    readonly duration_seconds: number;
    readonly session_count: number;
    readonly goal_reached: boolean;
  }[];
  readonly weekly_evolution: readonly {
    readonly starts_on: string;
    readonly duration_seconds: number;
    readonly practiced_days: number;
  }[];
  readonly skills: readonly {
    readonly technique_id: string;
    readonly key: string;
    readonly name: string;
    readonly category: string;
    readonly session_count: number;
    readonly seconds_practiced: number;
    readonly repetitions: number;
    readonly average_quality: number | null;
    readonly average_bpm: number | null;
    readonly last_practiced_on: string | null;
  }[];
  readonly achievements: readonly {
    readonly key: 'first-session' | 'seven-day-streak' | 'ten-hours';
    readonly target: number;
    readonly progress: number;
    readonly unlocked: boolean;
  }[];
}

export interface PracticeSummaryDataResponse {
  readonly data: PracticeSummary;
}

export function goalPercentage(progress: number, target: number): number {
  return target > 0 ? Math.min(100, Math.max(0, Math.round((progress / target) * 100))) : 0;
}
