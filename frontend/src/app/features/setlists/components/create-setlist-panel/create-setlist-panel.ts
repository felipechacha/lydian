import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SetlistContext, SetlistDraft } from '../../models/setlist.models';

@Component({
  selector: 'app-create-setlist-panel',
  imports: [ReactiveFormsModule],
  templateUrl: './create-setlist-panel.html',
  styleUrl: './create-setlist-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateSetlistPanel {
  private readonly _formBuilder = inject(FormBuilder);
  @Input() isSubmitting = false;
  @Input() errorMessage = '';
  @Output() readonly cancelled = new EventEmitter<void>();
  @Output() readonly setlistCreated = new EventEmitter<SetlistDraft>();

  protected readonly contexts: readonly SetlistContext[] = ['Show', 'Ensaio', 'Gig', 'Repertório'];
  protected readonly setlistForm = this._formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
    context: ['Show' as SetlistContext, Validators.required],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(180)]],
  });

  get titleCharacterCount(): number {
    return this.setlistForm.controls.title.value.length;
  }

  get descriptionCharacterCount(): number {
    return this.setlistForm.controls.description.value.length;
  }

  public submit(): void {
    if (this.isSubmitting || this.setlistForm.invalid) {
      this.setlistForm.markAllAsTouched();
      return;
    }

    this.setlistCreated.emit(this.setlistForm.getRawValue());
    this.setlistForm.reset({ title: '', context: 'Show', description: '' });
  }
}
