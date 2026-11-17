export interface PracticeGoal {
  readonly user_id: string;
  readonly daily_target_seconds: number;
  readonly weekly_target_days: number;
  readonly timezone: string;
  readonly created_at: string | null;
  readonly updated_at: string | null;
}

export interface PracticeGoalDataResponse {
  readonly data: PracticeGoal;
}

export interface UpdatePracticeGoalRequest {
  readonly daily_target_seconds?: number;
  readonly weekly_target_days?: number;
  readonly timezone?: string;
}
