import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LibraryMusic } from '../../../library/models/musics.models';

@Component({
  selector: 'app-setlist-music-picker',
  imports: [NgOptimizedImage],
  templateUrl: './setlist-music-picker.html',
  styleUrl: './setlist-music-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetlistMusicPicker {
  @Input() musics: readonly LibraryMusic<string>[] = [];
  @Input() isSubmitting = false;
  @Input() errorMessage = '';
  @Output() readonly cancelled = new EventEmitter<void>();
  @Output() readonly musicSelected = new EventEmitter<string>();
}
