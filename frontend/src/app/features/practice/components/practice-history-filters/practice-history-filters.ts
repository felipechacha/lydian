import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  PracticeHistoryFilterValue,
  PracticeHistoryMusicOption,
} from '../../models/practice-session.models';

@Component({
  selector: 'app-practice-history-filters',
  imports: [ReactiveFormsModule],
  templateUrl: './practice-history-filters.html',
  styleUrl: './practice-history-filters.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PracticeHistoryFilters {
  private readonly _formBuilder = inject(FormBuilder);
  @Input() musics: readonly PracticeHistoryMusicOption[] = [];
  @Input() isLoading = false;
  @Output() readonly filtersApplied = new EventEmitter<PracticeHistoryFilterValue>();

  protected readonly filtersForm = this._formBuilder.nonNullable.group({
    search: [''],
    songId: [''],
    from: [''],
    to: [''],
    sortBy: ['started_at' as PracticeHistoryFilterValue['sortBy']],
    sortOrder: ['desc' as PracticeHistoryFilterValue['sortOrder']],
  });

  public applyFilters(): void {
    this.filtersApplied.emit(this.filtersForm.getRawValue());
  }

  public clearFilters(): void {
    this.filtersForm.reset({
      search: '',
      songId: '',
      from: '',
      to: '',
      sortBy: 'started_at',
      sortOrder: 'desc',
    });
    this.applyFilters();
  }
}
