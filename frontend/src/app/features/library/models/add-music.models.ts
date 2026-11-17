import { Technique } from '../../techniques/models/technique.models';

export interface MusicSearchResult {
  readonly id: number;
  readonly title: string;
  readonly composer: string;
  readonly album?: string;
  readonly genre?: string;
  readonly artworkUrl: string;
  readonly bpm: number;
  readonly key: string;
  readonly capo: number;
  readonly tuning: string;
  readonly difficulty: string;
  readonly difficultyLevel: number;
  readonly techniques: readonly string[];
  readonly techniqueIds?: readonly string[];
  readonly provider?: MusicProvider;
  readonly providerTrackId?: string;
  readonly previewUrl?: string;
  readonly externalUrl?: string;
  readonly durationSeconds?: number;
}

export interface AppleMusicSearchResult {
  readonly id: number;
  readonly title: string;
  readonly artist: string;
  readonly album: string;
  readonly genre?: string;
  readonly artworkUrl: string;
  readonly previewUrl: string | null;
  readonly appleMusicUrl: string;
  readonly durationSeconds?: number;
}

export interface AppleMusicPreviewProgress {
  readonly musicId: number | null;
  readonly progressPercentage: number;
  readonly remainingSeconds: number;
}

export type ApiSongDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type MusicProvider = 'apple_music' | 'spotify' | 'manual' | 'other';
export type SongLearningStatus = 'new' | 'learning' | 'maintaining' | 'mastered' | 'archived';

export interface CreateSongRequest {
  readonly title: string;
  readonly artist: string;
  readonly album?: string;
  readonly genre?: string;
  readonly musical_key?: string;
  readonly capo?: number;
  readonly tuning?: string;
  readonly bpm?: number;
  readonly difficulty?: ApiSongDifficulty;
  readonly spotify_track_id?: string;
  readonly spotify_preview_url?: string;
  readonly spotify_external_url?: string;
  readonly cover_image_url?: string;
  readonly notes?: string;
  readonly duration_seconds?: number;
  readonly provider?: MusicProvider;
  readonly provider_track_id?: string;
  readonly preview_url?: string;
  readonly external_url?: string;
  readonly learning_status?: SongLearningStatus;
  readonly target_bpm?: number;
  readonly priority?: number;
}

export type UpdateSongRequest = Partial<CreateSongRequest>;

export interface UpdateSongTechniquesRequest {
  readonly technique_ids: readonly string[];
}

export interface SongTechniqueResponse {
  readonly techniques: Technique;
}

export interface SongResponse {
  readonly id: string;
  readonly user_id: string;
  readonly title: string;
  readonly artist: string;
  readonly album: string | null;
  readonly genre: string | null;
  readonly musical_key: string | null;
  readonly capo: number | null;
  readonly tuning: string | null;
  readonly bpm: number | null;
  readonly difficulty: ApiSongDifficulty | null;
  readonly spotify_track_id: string | null;
  readonly spotify_preview_url: string | null;
  readonly spotify_external_url: string | null;
  readonly cover_image_url: string | null;
  readonly notes: string | null;
  readonly duration_seconds?: number | null;
  readonly provider?: MusicProvider | null;
  readonly provider_track_id?: string | null;
  readonly preview_url?: string | null;
  readonly external_url?: string | null;
  readonly learning_status?: SongLearningStatus;
  readonly target_bpm?: number | null;
  readonly priority?: number;
  readonly last_practiced_at?: string | null;
  readonly song_techniques?: readonly SongTechniqueResponse[];
  readonly created_at: string;
  readonly updated_at: string;
  readonly deleted_at: string | null;
}

export interface SongDataResponse {
  readonly data: SongResponse;
}

export interface DeletedSongResponse {
  readonly id: string;
}

export interface DeletedSongDataResponse {
  readonly data: DeletedSongResponse;
}

export interface SongsPaginationMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
}

export interface ListSongsQuery {
  readonly page?: number;
  readonly limit?: number;
  readonly search?: string;
  readonly sort_by?: 'created_at' | 'updated_at' | 'title' | 'artist' | 'bpm';
  readonly sort_order?: 'asc' | 'desc';
}

export interface SongsListResponse {
  readonly data: readonly SongResponse[];
  readonly meta: SongsPaginationMeta;
}
