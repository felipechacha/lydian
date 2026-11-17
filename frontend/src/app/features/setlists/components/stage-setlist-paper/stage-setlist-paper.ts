import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { StageModeSetlist } from '../../models/stage-mode.models';

@Component({
  selector: 'app-stage-setlist-paper',
  imports: [],
  templateUrl: './stage-setlist-paper.html',
  styleUrl: './stage-setlist-paper.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StageSetlistPaper {
  @Input() setlist!: StageModeSetlist;
  @Input() currentTrackIndex = 0;
  @Input() playedMusicIds: ReadonlySet<string> = new Set<string>();
  @Output() readonly trackSelected = new EventEmitter<number>();
  @Output() readonly playedToggled = new EventEmitter<string>();

  get completedTrackCount(): number {
    return this.setlist.tracks.filter((track) => this.isTrackPlayed(track.musicId)).length;
  }

  public isTrackPlayed(musicId: string): boolean {
    return this.playedMusicIds.has(musicId);
  }

  public applyTrackClass(trackIndex: number, musicId: string): string {
    const classes = ['stage-track-custom'];

    if (trackIndex === this.currentTrackIndex) {
      classes.push('stage-track-custom--current');
    }

    if (this.isTrackPlayed(musicId)) {
      classes.push('stage-track-custom--played');
    }

    return classes.join(' ');
  }

  public applyPlayedButtonLabel(trackTitle: string, musicId: string): string {
    const action = this.isTrackPlayed(musicId) ? 'Desmarcar' : 'Marcar como tocada';
    return `${action}: ${trackTitle}`;
  }
}
