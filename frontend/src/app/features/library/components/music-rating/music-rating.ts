import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-music-rating',
  imports: [],
  templateUrl: './music-rating.html',
  styleUrl: './music-rating.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicRating {
  @Input() rating = 0;
  @Input() notes = '';
  @Output() readonly ratingChanged = new EventEmitter<number>();
  @Output() readonly notesChanged = new EventEmitter<string>();

  protected readonly stars = [1, 2, 3, 4, 5];

  public updateNotes(event: Event): void {
    this.notesChanged.emit((event.target as HTMLTextAreaElement).value);
  }
}
