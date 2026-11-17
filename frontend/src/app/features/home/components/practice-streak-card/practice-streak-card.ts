import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { PracticeStreak } from '../../models/home.models';

@Component({
  selector: 'app-practice-streak-card',
  imports: [],
  templateUrl: './practice-streak-card.html',
  styleUrl: './practice-streak-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PracticeStreakCard {
  @Input({ required: true }) streak!: PracticeStreak;
}
