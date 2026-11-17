export interface StageModeTrack {
  readonly musicId: string;
  readonly orderLabel: string;
  readonly title: string;
  readonly composer: string;
  readonly bpm: number | null;
  readonly cue: string;
}

export interface StageModeSetlist {
  readonly id: string;
  readonly title: string;
  readonly context: string;
  readonly venue: string;
  readonly eventDate: string;
  readonly duration: string;
  readonly tracks: readonly StageModeTrack[];
}
