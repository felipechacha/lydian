import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-musics-hero',
  imports: [RouterLink],
  templateUrl: './musics-hero.html',
  styleUrl: './musics-hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicsHero {
  readonly musicCount = input.required<number>();
}
