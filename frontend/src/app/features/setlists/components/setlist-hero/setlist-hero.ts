import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-setlist-hero',
  imports: [],
  templateUrl: './setlist-hero.html',
  styleUrl: './setlist-hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetlistHero {
  @Input() setlistCount = 0;
  @Input() totalSongs: number | null = 0;
  @Output() readonly createRequested = new EventEmitter<void>();
}
