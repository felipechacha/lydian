export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Timestamps = {
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export interface Database {
  public: {
    Tables: {
      password_recovery_requests: {
        Row: {
          token_hash: string;
          email_hash: string;
          created_at: string;
          expires_at: string;
          consumed_at: string | null;
        };
        Insert: {
          token_hash: string;
          email_hash: string;
          created_at?: string;
          expires_at: string;
          consumed_at?: string | null;
        };
        Update: { consumed_at?: string | null };
        Relationships: [];
      };
      users: {
        Row: Timestamps & {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          main_instrument: string | null;
          experience_level: string | null;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          main_instrument?: string | null;
          experience_level?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
        Relationships: [];
      };
      songs: {
        Row: Timestamps & {
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
          difficulty: string | null;
          spotify_track_id: string | null;
          spotify_preview_url: string | null;
          spotify_external_url: string | null;
          cover_image_url: string | null;
          notes: string | null;
          duration_seconds: number | null;
          provider: string | null;
          provider_track_id: string | null;
          preview_url: string | null;
          external_url: string | null;
          learning_status: string;
          target_bpm: number | null;
          priority: number;
          last_practiced_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          artist: string;
          album?: string | null;
          genre?: string | null;
          musical_key?: string | null;
          capo?: number | null;
          tuning?: string | null;
          bpm?: number | null;
          difficulty?: string | null;
          spotify_track_id?: string | null;
          spotify_preview_url?: string | null;
          spotify_external_url?: string | null;
          cover_image_url?: string | null;
          notes?: string | null;
          duration_seconds?: number | null;
          provider?: string | null;
          provider_track_id?: string | null;
          preview_url?: string | null;
          external_url?: string | null;
          learning_status?: string;
          target_bpm?: number | null;
          priority?: number;
          last_practiced_at?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['songs']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'songs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      setlists: {
        Row: Timestamps & {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          visibility: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          visibility?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['setlists']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'setlists_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      setlist_songs: {
        Row: {
          id: string;
          setlist_id: string;
          song_id: string;
          position: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          setlist_id: string;
          song_id: string;
          position: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database['public']['Tables']['setlist_songs']['Insert']
        >;
        Relationships: [
          {
            foreignKeyName: 'setlist_songs_setlist_id_fkey';
            columns: ['setlist_id'];
            isOneToOne: false;
            referencedRelation: 'setlists';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'setlist_songs_song_id_fkey';
            columns: ['song_id'];
            isOneToOne: false;
            referencedRelation: 'songs';
            referencedColumns: ['id'];
          },
        ];
      };
      practice_sessions: {
        Row: Timestamps & {
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
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string | null;
          started_at?: string;
          ended_at?: string | null;
          duration_minutes?: number | null;
          duration_seconds?: number | null;
          paused_seconds?: number;
          notes?: string | null;
          mood?: string | null;
          focus_area?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: Partial<
          Database['public']['Tables']['practice_sessions']['Insert']
        >;
        Relationships: [
          {
            foreignKeyName: 'practice_sessions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      practice_session_songs: {
        Row: {
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
        };
        Insert: {
          id?: string;
          practice_session_id: string;
          song_id: string;
          minutes_practiced?: number | null;
          notes?: string | null;
          progress_rating?: number | null;
          seconds_practiced?: number | null;
          practiced_bpm?: number | null;
          repetitions?: number | null;
          quality_rating?: number | null;
          created_at?: string;
        };
        Update: Partial<
          Database['public']['Tables']['practice_session_songs']['Insert']
        >;
        Relationships: [
          {
            foreignKeyName: 'practice_session_songs_practice_session_id_fkey';
            columns: ['practice_session_id'];
            isOneToOne: false;
            referencedRelation: 'practice_sessions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'practice_session_songs_song_id_fkey';
            columns: ['song_id'];
            isOneToOne: false;
            referencedRelation: 'songs';
            referencedColumns: ['id'];
          },
        ];
      };
      user_practice_goals: {
        Row: {
          user_id: string;
          daily_target_seconds: number;
          weekly_target_days: number;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          daily_target_seconds?: number;
          weekly_target_days?: number;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database['public']['Tables']['user_practice_goals']['Insert']
        >;
        Relationships: [
          {
            foreignKeyName: 'user_practice_goals_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      techniques: {
        Row: {
          id: string;
          key: string;
          name: string;
          category: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          name: string;
          category: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['techniques']['Insert']>;
        Relationships: [];
      };
      song_techniques: {
        Row: {
          song_id: string;
          technique_id: string;
          created_at: string;
        };
        Insert: {
          song_id: string;
          technique_id: string;
          created_at?: string;
        };
        Update: Partial<
          Database['public']['Tables']['song_techniques']['Insert']
        >;
        Relationships: [
          {
            foreignKeyName: 'song_techniques_song_id_fkey';
            columns: ['song_id'];
            isOneToOne: false;
            referencedRelation: 'songs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'song_techniques_technique_id_fkey';
            columns: ['technique_id'];
            isOneToOne: false;
            referencedRelation: 'techniques';
            referencedColumns: ['id'];
          },
        ];
      };
      practice_session_techniques: {
        Row: {
          practice_session_song_id: string;
          technique_id: string;
          created_at: string;
        };
        Insert: {
          practice_session_song_id: string;
          technique_id: string;
          created_at?: string;
        };
        Update: Partial<
          Database['public']['Tables']['practice_session_techniques']['Insert']
        >;
        Relationships: [
          {
            foreignKeyName: 'practice_session_techniques_practice_session_song_id_fkey';
            columns: ['practice_session_song_id'];
            isOneToOne: false;
            referencedRelation: 'practice_session_songs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'practice_session_techniques_technique_id_fkey';
            columns: ['technique_id'];
            isOneToOne: false;
            referencedRelation: 'techniques';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: {
      reorder_setlist_songs: {
        Args: { p_user_id: string; p_setlist_id: string; p_song_ids: string[] };
        Returns: string;
      };
      get_practice_summary: { Args: { p_user_id: string }; Returns: Json };
      list_setlist_summaries: {
        Args: {
          p_user_id: string;
          p_page?: number;
          p_limit?: number;
          p_search?: string;
          p_sort_by?: string;
          p_sort_order?: string;
        };
        Returns: Json;
      };
      start_practice_session: {
        Args: {
          p_user_id: string;
          p_song_id: string;
          p_title?: string;
          p_started_at?: string;
          p_notes?: string;
          p_mood?: string;
          p_focus_area?: string;
          p_practiced_bpm?: number;
          p_technique_ids?: string[];
        };
        Returns: string;
      };
      finish_practice_session: {
        Args: {
          p_user_id: string;
          p_session_id: string;
          p_song_id: string;
          p_ended_at: string;
          p_duration_seconds: number;
          p_paused_seconds?: number;
          p_notes?: string;
          p_mood?: string;
          p_focus_area?: string;
          p_song_notes?: string;
          p_seconds_practiced?: number;
          p_practiced_bpm?: number;
          p_progress_rating?: number;
          p_repetitions?: number;
          p_quality_rating?: number;
          p_technique_ids?: string[];
        };
        Returns: string;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}
