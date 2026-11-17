export type SetlistContext = 'Show' | 'Ensaio' | 'Gig' | 'Repertório';
export type SetlistVisibility = 'private' | 'public' | 'unlisted';

export interface SetlistDraft {
  readonly title: string;
  readonly context: SetlistContext;
  readonly description: string;
}

export interface SetlistSummary<TId extends string | number = number> extends SetlistDraft {
  readonly id: TId;
  readonly songCount: number | null;
  readonly duration: string;
  readonly updatedAt: string;
  readonly artworkUrls: readonly string[];
  readonly eventDate: string;
  readonly venue: string;
}

export interface CreateSetlistRequest {
  readonly name: string;
  readonly description?: string;
  readonly visibility?: SetlistVisibility;
}

export interface SetlistResponse {
  readonly id: string;
  readonly user_id: string;
  readonly name: string;
  readonly description: string | null;
  readonly visibility: SetlistVisibility;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface SetlistDataResponse {
  readonly data: SetlistResponse;
}

export interface SetlistsPaginationMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
}

export interface ListSetlistsQuery {
  readonly page?: number;
  readonly limit?: number;
  readonly search?: string;
  readonly sort_by?: 'created_at' | 'updated_at' | 'name';
  readonly sort_order?: 'asc' | 'desc';
}

export interface SetlistListItemResponse extends SetlistResponse {
  readonly song_count: number;
  readonly duration_seconds: number;
  readonly missing_duration_count: number;
  readonly cover_image_urls: readonly string[];
}

export interface SetlistsListResponse {
  readonly data: readonly SetlistListItemResponse[];
  readonly meta: SetlistsPaginationMeta;
}

export type SetlistSongDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface SetlistSongApiResponse {
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
  readonly difficulty: SetlistSongDifficulty | null;
  readonly spotify_track_id: string | null;
  readonly spotify_preview_url: string | null;
  readonly spotify_external_url: string | null;
  readonly cover_image_url: string | null;
  readonly notes: string | null;
  readonly duration_seconds?: number | null;
  readonly created_at: string;
  readonly updated_at: string;
  readonly deleted_at: string | null;
}

export interface UpdateSetlistRequest {
  readonly name?: string;
  readonly description?: string;
  readonly visibility?: SetlistVisibility;
}

export interface SetlistSongDetailResponse {
  readonly id: string;
  readonly setlist_id: string;
  readonly song_id: string;
  readonly position: number;
  readonly notes: string | null;
  readonly created_at: string;
  readonly songs: SetlistSongApiResponse;
}

export interface SetlistDetailResponse extends SetlistResponse {
  readonly setlist_songs: readonly SetlistSongDetailResponse[];
}

export interface SetlistDetailDataResponse {
  readonly data: SetlistDetailResponse;
}

export interface SetlistDetailsListResponse {
  readonly data: readonly SetlistDetailResponse[];
  readonly meta: SetlistsPaginationMeta;
}

export interface AddSongToSetlistRequest {
  readonly song_id: string;
  readonly position?: number;
  readonly notes?: string;
}

export interface UpdateSetlistSongRequest {
  readonly position?: number;
  readonly notes?: string;
}

export interface SetlistSongResponse {
  readonly id: string;
  readonly setlist_id: string;
  readonly song_id: string;
  readonly position: number;
  readonly notes: string | null;
  readonly created_at: string;
}

export interface SetlistSongDataResponse {
  readonly data: SetlistSongResponse;
}

export interface SetlistSongDeletedResponse {
  readonly setlist_id: string;
  readonly song_id: string;
}

export interface SetlistSongDeletedDataResponse {
  readonly data: SetlistSongDeletedResponse;
}

export interface DeletedSetlistResponse {
  readonly id: string;
}

export interface DeletedSetlistDataResponse {
  readonly data: DeletedSetlistResponse;
}
