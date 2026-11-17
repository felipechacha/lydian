import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SetlistDetailsData } from '../../models/setlist-details.models';

@Component({
  selector: 'app-setlist-details-hero',
  imports: [RouterLink],
  templateUrl: './setlist-details-hero.html',
  styleUrl: './setlist-details-hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetlistDetailsHero {
  @Input() setlist!: SetlistDetailsData;
  @Input() songCount = 0;
  @Input() duration = '0 min';
  @Output() readonly addMusicRequested = new EventEmitter<void>();
  @Output() readonly stageModeRequested = new EventEmitter<void>();
  @Output() readonly editSetlistRequested = new EventEmitter<void>();
  @Output() readonly deleteSetlistRequested = new EventEmitter<void>();
}
