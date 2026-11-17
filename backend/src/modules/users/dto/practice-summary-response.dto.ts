import { ApiProperty } from '@nestjs/swagger';

export class PracticeSummaryGoalDto {
  @ApiProperty() daily_target_seconds: number;
  @ApiProperty() weekly_target_days: number;
}
export class PracticeSummaryTotalsDto {
  @ApiProperty() duration_seconds: number;
  @ApiProperty() session_count: number;
  @ApiProperty() practiced_days: number;
  @ApiProperty() mastered_songs: number;
  @ApiProperty({ nullable: true, type: Number }) average_bpm: number | null;
}
export class PracticeSummaryStreakDto {
  @ApiProperty() current_days: number;
  @ApiProperty() longest_days: number;
}
export class PracticeSummaryDailyDto {
  @ApiProperty() duration_seconds: number;
  @ApiProperty() session_count: number;
  @ApiProperty() goal_reached: boolean;
}
export class PracticeSummaryCalendarDto extends PracticeSummaryDailyDto {
  @ApiProperty({ format: 'date' }) date: string;
}
export class PracticeSummaryWeekDto {
  @ApiProperty({ format: 'date' }) starts_on: string;
  @ApiProperty() duration_seconds: number;
  @ApiProperty() practiced_days: number;
}
export class PracticeSummaryCurrentWeekDto extends PracticeSummaryWeekDto {
  @ApiProperty() goal_reached_days: number;
  @ApiProperty() goal_reached: boolean;
  @ApiProperty() previous_duration_seconds: number;
}
export class PracticeSummarySkillDto {
  @ApiProperty({ format: 'uuid' }) technique_id: string;
  @ApiProperty() key: string;
  @ApiProperty() name: string;
  @ApiProperty() category: string;
  @ApiProperty() session_count: number;
  @ApiProperty() seconds_practiced: number;
  @ApiProperty() repetitions: number;
  @ApiProperty({ type: Number, nullable: true }) average_quality: number | null;
  @ApiProperty({ type: Number, nullable: true }) average_bpm: number | null;
  @ApiProperty({ format: 'date' }) last_practiced_on: string;
}
export class PracticeSummaryAchievementDto {
  @ApiProperty({ enum: ['first-session', 'seven-day-streak', 'ten-hours'] })
  key: string;
  @ApiProperty() target: number;
  @ApiProperty() progress: number;
  @ApiProperty() unlocked: boolean;
}
export class PracticeSummaryResponseDto {
  @ApiProperty() timezone: string;
  @ApiProperty({ format: 'date-time' }) as_of: string;
  @ApiProperty({ format: 'date' }) today: string;
  @ApiProperty({ type: PracticeSummaryGoalDto }) goal: PracticeSummaryGoalDto;
  @ApiProperty({ type: PracticeSummaryTotalsDto })
  totals: PracticeSummaryTotalsDto;
  @ApiProperty({ type: PracticeSummaryStreakDto })
  streak: PracticeSummaryStreakDto;
  @ApiProperty({ type: PracticeSummaryDailyDto })
  daily: PracticeSummaryDailyDto;
  @ApiProperty({ type: PracticeSummaryCurrentWeekDto })
  week: PracticeSummaryCurrentWeekDto;
  @ApiProperty({ type: [PracticeSummaryCalendarDto] })
  calendar: PracticeSummaryCalendarDto[];
  @ApiProperty({ type: [PracticeSummaryWeekDto] })
  weekly_evolution: PracticeSummaryWeekDto[];
  @ApiProperty({ type: [PracticeSummarySkillDto] })
  skills: PracticeSummarySkillDto[];
  @ApiProperty({ type: [PracticeSummaryAchievementDto] })
  achievements: PracticeSummaryAchievementDto[];
}
