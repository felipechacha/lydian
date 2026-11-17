import { SongLearningStatus } from './add-music.models';

export type MusicFilter = 'all' | SongLearningStatus;
export type LibraryMusicStatus = SongLearningStatus | 'practicing';
export type MusicDifficulty = 'Fácil' | 'Médio' | 'Difícil';

export interface MusicFilterOption {
  readonly label: string;
  readonly value: MusicFilter;
}

export interface LibraryMusic<MusicId extends string | number = number> {
  readonly id: MusicId;
  readonly title: string;
  readonly composer: string;
  readonly artworkUrl: string;
  readonly bpm: number;
  readonly targetBpm?: number | null;
  readonly durationSeconds?: number | null;
  readonly difficulty: MusicDifficulty;
  readonly masteryPercentage?: number;
  readonly status: LibraryMusicStatus;
  readonly priority?: number;
  readonly lastPracticedAt?: string | null;
  readonly techniques?: readonly string[];
  readonly technicalFocus?: string;
}
