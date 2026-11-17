import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DailyPracticeSummary } from '../../models/home.models';

@Component({
  selector: 'app-daily-practice',
  imports: [],
  templateUrl: './daily-practice.html',
  styleUrl: './daily-practice.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DailyPractice {
  @Input({ required: true }) practice!: DailyPracticeSummary;

  private readonly _circleCircumference = 659.73;

  get progressPercentage(): number {
    if (!this.practice.targetMinutes) {
      return 0;
    }

    return Math.min((this.practice.completedMinutes / this.practice.targetMinutes) * 100, 100);
  }

  get progressOffset(): number {
    return this._circleCircumference * (1 - this.progressPercentage / 100);
  }
}
