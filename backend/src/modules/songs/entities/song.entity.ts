export interface Song {
  id: string;
  user_id: string;
  title: string;
  artist: string;
  album: string | null;
  genre: string | null;
  musical_key: string | null;
  capo: number | null;
  tuning: string | null;
  bpm: number | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
  spotify_track_id: string | null;
  spotify_preview_url: string | null;
  spotify_external_url: string | null;
  cover_image_url: string | null;
  notes: string | null;
  duration_seconds: number | null;
  provider: 'apple_music' | 'spotify' | 'manual' | 'other' | null;
  provider_track_id: string | null;
  preview_url: string | null;
  external_url: string | null;
  learning_status: 'new' | 'learning' | 'maintaining' | 'mastered' | 'archived';
  target_bpm: number | null;
  priority: number;
  last_practiced_at: string | null;
  created_at: string;
  updated_at: string;
}
