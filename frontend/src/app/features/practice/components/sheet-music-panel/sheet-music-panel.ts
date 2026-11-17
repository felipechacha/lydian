import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-sheet-music-panel',
  imports: [],
  templateUrl: './sheet-music-panel.html',
  styleUrl: './sheet-music-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SheetMusicPanel {
  readonly completionRequested = output<void>();
}
