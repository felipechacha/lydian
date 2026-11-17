import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pagination } from './pagination';

describe('Pagination', () => {
  let component: Pagination;
  let fixture: ComponentFixture<Pagination>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pagination],
    }).compileComponents();

    fixture = TestBed.createComponent(Pagination);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate a five-page window around the current page', () => {
    fixture.componentRef.setInput('currentPage', 6);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('totalItems', 120);
    fixture.detectChanges();

    expect(component.totalPages).toBe(12);
    expect(component.visiblePages).toEqual([4, 5, 6, 7, 8]);
    expect(component.firstVisibleItem).toBe(51);
    expect(component.lastVisibleItem).toBe(60);
  });

  it('should emit only valid page changes', () => {
    const selectedPages: number[] = [];
    fixture.componentRef.setInput('currentPage', 2);
    fixture.componentRef.setInput('pageSize', 10);
    fixture.componentRef.setInput('totalItems', 30);
    component.pageSelected.subscribe((page) => selectedPages.push(page));

    component.selectPage(2);
    component.selectPage(0);
    component.selectPage(4);
    component.selectPage(3);

    expect(selectedPages).toEqual([3]);
  });
});
