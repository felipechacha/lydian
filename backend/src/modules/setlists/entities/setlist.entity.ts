export interface Setlist {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  visibility: 'private' | 'public' | 'unlisted';
  created_at: string;
  updated_at: string;
}

export interface SetlistSong {
  id: string;
  setlist_id: string;
  song_id: string;
  position: number;
  notes: string | null;
  created_at: string;
}

export interface SetlistSummary extends Setlist {
  song_count: number;
  duration_seconds: number;
  missing_duration_count: number;
  cover_image_urls: string[];
}
