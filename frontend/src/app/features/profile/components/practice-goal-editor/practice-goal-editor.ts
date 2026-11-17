import {
  ChangeDetectionStrategy,
  Component,
  OnChanges,
  inject,
  input,
  output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '../../../../shared/ui/button/button';
import { PracticeGoal, UpdatePracticeGoalRequest } from '../../models/practice-goal.models';

@Component({
  selector: 'app-practice-goal-editor',
  imports: [ReactiveFormsModule, Button],
  templateUrl: './practice-goal-editor.html',
  styleUrl: './practice-goal-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PracticeGoalEditor implements OnChanges {
  private readonly _formBuilder = inject(FormBuilder);

  readonly goal = input.required<PracticeGoal>();
  readonly isSaving = input(false);
  readonly saved = output<UpdatePracticeGoalRequest>();

  readonly form = this._formBuilder.nonNullable.group({
    dailyTargetMinutes: [60, [Validators.required, Validators.min(1), Validators.max(1440)]],
    weeklyTargetDays: [5, [Validators.required, Validators.min(1), Validators.max(7)]],
    timezone: ['America/Sao_Paulo', [Validators.required, Validators.maxLength(100)]],
  });

  ngOnChanges(): void {
    const goal = this.goal();
    this.form.patchValue({
      dailyTargetMinutes: Math.max(1, Math.round(goal.daily_target_seconds / 60)),
      weeklyTargetDays: goal.weekly_target_days,
      timezone: goal.timezone,
    });
  }

  public submit(): void {
    if (this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.saved.emit({
      daily_target_seconds: value.dailyTargetMinutes * 60,
      weekly_target_days: value.weeklyTargetDays,
      timezone: value.timezone.trim(),
    });
  }
}
