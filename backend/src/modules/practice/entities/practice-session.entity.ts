export interface PracticeSession {
  id: string;
  user_id: string;
  title: string | null;
  started_at: string;
  ended_at: string | null;
  duration_minutes: number | null;
  duration_seconds: number | null;
  paused_seconds: number;
  notes: string | null;
  mood: string | null;
  focus_area: string | null;
  created_at: string;
  updated_at: string;
}

export interface PracticeSessionSong {
  id: string;
  practice_session_id: string;
  song_id: string;
  minutes_practiced: number | null;
  notes: string | null;
  progress_rating: number | null;
  seconds_practiced: number | null;
  practiced_bpm: number | null;
  repetitions: number | null;
  quality_rating: number | null;
  created_at: string;
}
