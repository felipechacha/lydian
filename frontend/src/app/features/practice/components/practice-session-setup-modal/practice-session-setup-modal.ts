import { ChangeDetectionStrategy, Component, OnInit, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '../../../../shared/ui/button/button';
import { PracticeSessionSetupFormValue } from '../../models/practice-session.models';

@Component({
  selector: 'app-practice-session-setup-modal',
  imports: [ReactiveFormsModule, Button],
  templateUrl: './practice-session-setup-modal.html',
  styleUrl: './practice-session-setup-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PracticeSessionSetupModal implements OnInit {
  private readonly _formBuilder = inject(FormBuilder);

  readonly musicTitle = input.required<string>();
  readonly musicArtist = input.required<string>();
  readonly suggestedFocus = input('');
  readonly isSubmitting = input(false);
  readonly errorMessage = input('');

  readonly cancelled = output<void>();
  readonly submitted = output<PracticeSessionSetupFormValue>();

  readonly form = this._formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    focusArea: ['', Validators.maxLength(200)],
    mood: ['focused', Validators.maxLength(50)],
    notes: ['', Validators.maxLength(5000)],
  });

  protected readonly moodOptions = [
    { value: 'focused', label: 'Focado' },
    { value: 'motivated', label: 'Motivado' },
    { value: 'calm', label: 'Tranquilo' },
    { value: 'challenged', label: 'Desafiado' },
  ] as const;

  ngOnInit(): void {
    this.form.patchValue({
      title: `Prática de ${this.musicTitle()}`,
      focusArea: this.suggestedFocus().slice(0, 200),
    });
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
