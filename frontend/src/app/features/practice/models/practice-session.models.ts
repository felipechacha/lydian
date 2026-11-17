import { SongResponse } from '../../library/models/add-music.models';
import { Technique } from '../../techniques/models/technique.models';

export type SessionTool = 'microphone' | 'camera' | 'notes' | 'help';

export interface PracticeTechnique {
  readonly id?: string;
  readonly icon: string;
  readonly label: string;
  readonly isActive: boolean;
}

export interface PracticeSessionSetupFormValue {
  readonly title: string;
  readonly focusArea: string;
  readonly mood: string;
  readonly notes: string;
}

export interface PracticeSessionCompletionFormValue {
  readonly sessionNotes: string;
  readonly songNotes: string;
  readonly progressRating: number;
  readonly mood: string;
  readonly repetitions: number;
  readonly qualityRating: number;
}

export interface CreatePracticeSessionRequest {
  readonly title?: string;
  readonly started_at?: string;
  readonly notes?: string;
  readonly mood?: string;
  readonly focus_area?: string;
}

export interface UpdatePracticeSessionRequest extends CreatePracticeSessionRequest {
  readonly ended_at?: string;
  readonly duration_minutes?: number;
  readonly duration_seconds?: number;
  readonly paused_seconds?: number;
}

export interface AddPracticeSessionSongRequest {
  readonly song_id: string;
  readonly minutes_practiced?: number;
  readonly seconds_practiced?: number;
  readonly practiced_bpm?: number;
  readonly notes?: string;
  readonly progress_rating?: number;
  readonly repetitions?: number;
  readonly quality_rating?: number;
  readonly technique_ids?: readonly string[];
}

export type UpdatePracticeSessionSongRequest = Partial<
  Omit<AddPracticeSessionSongRequest, 'song_id'>
>;

export interface StartPracticeSessionRequest {
  readonly song_id: string;
  readonly title?: string;
  readonly started_at?: string;
  readonly notes?: string;
  readonly mood?: string;
  readonly focus_area?: string;
  readonly practiced_bpm?: number;
  readonly technique_ids?: readonly string[];
}

export interface FinishPracticeSessionSongRequest {
  readonly song_id: string;
  readonly seconds_practiced?: number;
  readonly practiced_bpm?: number;
  readonly progress_rating?: number;
  readonly repetitions?: number;
  readonly quality_rating?: number;
  readonly notes?: string;
  readonly technique_ids?: readonly string[];
}

export interface FinishPracticeSessionRequest {
  readonly ended_at?: string;
  readonly duration_seconds?: number;
  readonly paused_seconds?: number;
  readonly notes?: string;
  readonly mood?: string;
  readonly focus_area?: string;
  readonly song: FinishPracticeSessionSongRequest;
}

export interface PracticeSessionNavigationState {
  readonly practiceSessionFresh?: boolean;
}

export interface PracticeSessionTechniqueResponse {
  readonly techniques: Technique;
}

export interface PracticeSessionSongResponse {
  readonly id: string;
  readonly practice_session_id: string;
  readonly song_id: string;
  readonly minutes_practiced: number | null;
  readonly seconds_practiced?: number | null;
  readonly practiced_bpm?: number | null;
  readonly notes: string | null;
  readonly progress_rating: number | null;
  readonly repetitions?: number | null;
  readonly quality_rating?: number | null;
  readonly created_at: string;
}

export interface PracticeSessionSongDetailResponse extends PracticeSessionSongResponse {
  readonly songs: SongResponse;
  readonly practice_session_techniques?: readonly PracticeSessionTechniqueResponse[];
}

export interface PracticeSessionResponse {
  readonly id: string;
  readonly user_id: string;
  readonly title: string | null;
  readonly started_at: string;
  readonly ended_at: string | null;
  readonly duration_minutes: number | null;
  readonly duration_seconds?: number | null;
  readonly paused_seconds?: number;
  readonly notes: string | null;
  readonly mood: string | null;
  readonly focus_area: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface PracticeSessionDetailResponse extends PracticeSessionResponse {
  readonly practice_session_songs: readonly PracticeSessionSongDetailResponse[];
}

export interface PracticeSessionDataResponse {
  readonly data: PracticeSessionDetailResponse;
}

export interface PracticeSessionMutationDataResponse {
  readonly data: PracticeSessionResponse;
}

export interface PaginationMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
}

export interface PracticeSessionsDataResponse {
  readonly data: readonly PracticeSessionResponse[];
  readonly meta: PaginationMeta;
}

export interface PracticeHistoryDataResponse {
  readonly data: readonly PracticeSessionDetailResponse[];
  readonly meta: PaginationMeta;
}

export interface ListPracticeSessionsQuery {
  readonly page?: number;
  readonly limit?: number;
  readonly search?: string;
  readonly sort_by?:
    | 'started_at'
    | 'created_at'
    | 'duration_seconds'
    | 'duration_minutes'
    | 'title';
  readonly sort_order?: 'asc' | 'desc';
}

export interface ListPracticeHistoryQuery extends ListPracticeSessionsQuery {
  readonly song_id?: string;
  readonly from?: string;
  readonly to?: string;
}

export interface PracticeSessionHistoryItem {
  readonly session: PracticeSessionDetailResponse;
  readonly sequence: number;
}

export interface PracticeHistoryFilterValue {
  readonly search: string;
  readonly songId: string;
  readonly from: string;
  readonly to: string;
  readonly sortBy: NonNullable<ListPracticeHistoryQuery['sort_by']>;
  readonly sortOrder: NonNullable<ListPracticeHistoryQuery['sort_order']>;
}

export interface PracticeHistoryMusicOption {
  readonly id: string;
  readonly title: string;
  readonly artist: string;
}

export interface PracticeSessionSongDataResponse {
  readonly data: PracticeSessionSongResponse;
}

export interface DeletedPracticeSessionDataResponse {
  readonly data: { readonly id: string };
}
