import { ChangeDetectionStrategy, Component, Input, output } from '@angular/core';
import { PracticeDiaryEntry } from '../../models/music-details.models';

@Component({
  selector: 'app-practice-diary',
  imports: [],
  templateUrl: './practice-diary.html',
  styleUrl: './practice-diary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PracticeDiary {
  @Input() entries: readonly PracticeDiaryEntry[] = [];
  readonly entrySelected = output<PracticeDiaryEntry>();
}
