import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-music-techniques',
  imports: [],
  templateUrl: './music-techniques.html',
  styleUrl: './music-techniques.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicTechniques {
  @Input() techniques: readonly string[] = [];
  @Input() technicalFocus = '';
}
