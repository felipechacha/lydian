import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
  @Input() currentPage = 1;
  @Input() pageSize = 12;
  @Input() totalItems = 0;
  @Input() ariaLabel = 'Paginação';
  @Output() readonly pageSelected = new EventEmitter<number>();

  get totalPages(): number {
    if (this.pageSize <= 0 || this.totalItems <= 0) {
      return 0;
    }

    return Math.ceil(this.totalItems / this.pageSize);
  }

  get visiblePages(): readonly number[] {
    const totalPages = this.totalPages;

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const firstVisiblePage = Math.min(Math.max(this.currentPage - 2, 1), totalPages - 4);

    return Array.from({ length: 5 }, (_, index) => firstVisiblePage + index);
  }

  get firstVisibleItem(): number {
    return this.totalItems === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get lastVisibleItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  public selectPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }

    this.pageSelected.emit(page);
  }
}
