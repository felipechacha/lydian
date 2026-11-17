import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UpcomingPractice } from '../../models/home.models';

@Component({
  selector: 'app-next-practice-card',
  imports: [RouterLink],
  templateUrl: './next-practice-card.html',
  styleUrl: './next-practice-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NextPracticeCard {
  @Input({ required: true }) practice!: UpcomingPractice;
}
