import { PracticeSummary } from '../app/features/profile/models/practice-summary.models';

export function createPracticeSummary(): PracticeSummary {
  return {
    timezone: 'America/Sao_Paulo',
    as_of: '2026-10-12T12:00:00Z',
    today: '2026-10-12',
    goal: { daily_target_seconds: 3600, weekly_target_days: 5 },
    totals: {
      duration_seconds: 360000,
      session_count: 150,
      practiced_days: 80,
      mastered_songs: 4,
      average_bpm: null,
    },
    streak: { current_days: 3, longest_days: 7 },
    daily: { duration_seconds: 5400, session_count: 120, goal_reached: true },
    week: {
      starts_on: '2026-10-12',
      duration_seconds: 5400,
      practiced_days: 1,
      goal_reached_days: 1,
      goal_reached: false,
      previous_duration_seconds: 10800,
    },
    calendar: Array.from({ length: 7 }, (_, index) => ({
      date: `2026-10-${12 + index}`,
      duration_seconds: index === 0 ? 5400 : 0,
      session_count: index === 0 ? 120 : 0,
      goal_reached: index === 0,
    })),
    weekly_evolution: [],
    skills: [
      {
        technique_id: 'technique-1',
        key: 'test',
        name: 'Teste',
        category: 'rhythm',
        session_count: 1,
        seconds_practiced: 3600,
        repetitions: 2,
        average_quality: null,
        average_bpm: null,
        last_practiced_on: '2026-10-12',
      },
    ],
    achievements: [
      { key: 'first-session', target: 1, progress: 1, unlocked: true },
      { key: 'seven-day-streak', target: 7, progress: 7, unlocked: true },
      { key: 'ten-hours', target: 36000, progress: 36000, unlocked: true },
    ],
  };
}
