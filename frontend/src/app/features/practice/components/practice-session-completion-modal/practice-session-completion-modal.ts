import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '../../../../shared/ui/button/button';
import { PracticeSessionCompletionFormValue } from '../../models/practice-session.models';

@Component({
  selector: 'app-practice-session-completion-modal',
  imports: [ReactiveFormsModule, Button],
  templateUrl: './practice-session-completion-modal.html',
  styleUrl: './practice-session-completion-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PracticeSessionCompletionModal {
  private readonly _formBuilder = inject(FormBuilder);

  readonly musicTitle = input.required<string>();
  readonly elapsedTime = input.required<string>();
  readonly durationMinutes = input.required<number>();
  readonly isSubmitting = input(false);
  readonly errorMessage = input('');

  readonly cancelled = output<void>();
  readonly submitted = output<PracticeSessionCompletionFormValue>();

  readonly form = this._formBuilder.nonNullable.group({
    sessionNotes: ['', Validators.maxLength(5000)],
    songNotes: ['', Validators.maxLength(2000)],
    progressRating: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    qualityRating: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    repetitions: [0, [Validators.required, Validators.min(0)]],
    mood: ['satisfied', Validators.maxLength(50)],
  });

  protected readonly moodOptions = [
    { value: 'satisfied', label: 'Satisfeito' },
    { value: 'focused', label: 'Focado' },
    { value: 'challenged', label: 'Desafiado' },
    { value: 'tired', label: 'Cansado' },
  ] as const;

  protected readonly ratingOptions = [1, 2, 3, 4, 5] as const;

  public selectRating(rating: number): void {
    this.form.controls.progressRating.setValue(rating);
  }

  public selectQualityRating(rating: number): void {
    this.form.controls.qualityRating.setValue(rating);
  }

  public submit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitted.emit(this.form.getRawValue());
  }

  public cancel(): void {
    if (!this.isSubmitting()) {
      this.cancelled.emit();
    }
  }
}
