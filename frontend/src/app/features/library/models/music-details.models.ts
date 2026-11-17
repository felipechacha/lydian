export interface PracticeDiaryEntry {
  readonly sessionId: string;
  readonly session: number;
  readonly title: string;
  readonly date: string;
  readonly duration: string;
  readonly progress: number;
  readonly tempo: number;
  readonly mood: string | null;
  readonly focusArea: string | null;
  readonly sessionNotes: string | null;
  readonly songNotes: string | null;
  readonly accent: 'primary' | 'secondary' | 'tertiary';
}

export interface ProgressBar {
  readonly value: number;
  readonly isCurrent?: boolean;
}

export interface MusicDetailsEditorValue {
  readonly song: UpdateSongRequest;
  readonly techniqueIds: readonly string[];
}
import { UpdateSongRequest } from './add-music.models';
