import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-setlist-track-controls',
  imports: [ReactiveFormsModule],
  templateUrl: './setlist-track-controls.html',
  styleUrl: './setlist-track-controls.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetlistTrackControls implements OnChanges {
  @Input() position = 0;
  @Input() trackCount = 0;
  @Input() notes = '';
  @Input() isSaving = false;
  @Output() readonly moved = new EventEmitter<-1 | 1>();
  @Output() readonly notesSaved = new EventEmitter<string>();

  protected readonly notesControl = new FormControl('', {
    nonNullable: true,
    validators: Validators.maxLength(1000),
  });

  ngOnChanges(): void {
    if (!this.notesControl.dirty) {
      this.notesControl.setValue(this.notes, { emitEvent: false });
    }
  }

  public saveNotes(): void {
    if (this.isSaving || this.notesControl.invalid) {
      this.notesControl.markAsTouched();
      return;
    }
    this.notesSaved.emit(this.notesControl.value.trim());
    this.notesControl.markAsPristine();
  }
}
