import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SetlistDetailsData, SetlistEditValue } from '../../models/setlist-details.models';
import { SetlistVisibility } from '../../models/setlist.models';

@Component({
  selector: 'app-edit-setlist-panel',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-setlist-panel.html',
  styleUrl: './edit-setlist-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditSetlistPanel {
  private readonly _formBuilder = inject(FormBuilder);
  private _setlist: SetlistDetailsData | null = null;

  @Input({ required: true })
  set setlist(value: SetlistDetailsData) {
    this._setlist = value;
    this.setlistForm.reset({
      name: value.title,
      description: value.description === 'Setlist sem descrição.' ? '' : value.description,
      visibility: value.visibility,
    });
  }
  get setlist(): SetlistDetailsData | null {
    return this._setlist;
  }

  @Input() isSubmitting = false;
  @Input() errorMessage = '';
  @Output() readonly cancelled = new EventEmitter<void>();
  @Output() readonly saved = new EventEmitter<SetlistEditValue>();

  protected readonly visibilityOptions: readonly {
    readonly value: SetlistVisibility;
    readonly label: string;
  }[] = [
    { value: 'private', label: 'Privado' },
    { value: 'unlisted', label: 'Não listado' },
    { value: 'public', label: 'Público' },
  ];
  protected readonly setlistForm = this._formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)],
    visibility: ['private' as SetlistVisibility, Validators.required],
  });

  public submit(): void {
    if (this.isSubmitting || this.setlistForm.invalid) {
      this.setlistForm.markAllAsTouched();
      return;
    }
    this.saved.emit(this.setlistForm.getRawValue());
  }
}
