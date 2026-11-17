import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-landing-waitlist-section',
  imports: [ReactiveFormsModule],
  templateUrl: './landing-waitlist-section.html',
  styleUrl: './landing-waitlist-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingWaitlistSection {
  private readonly _formBuilder = inject(FormBuilder);
  private _waitlistEmail = '';
  private _waitlistSubmissionPrepared = false;

  public readonly waitlistForm = this._formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get waitlistEmail(): string {
    return this._waitlistEmail;
  }

  get waitlistSubmissionPrepared(): boolean {
    return this._waitlistSubmissionPrepared;
  }

  public submitWaitlist(): void {
    if (this.waitlistForm.invalid) {
      this.waitlistForm.markAllAsTouched();
      return;
    }

    this._waitlistEmail = this.waitlistForm.controls.email.value.trim();
    this._waitlistSubmissionPrepared = true;
  }
}
