import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticeHistoryFilters } from './practice-history-filters';

describe('PracticeHistoryFilters', () => {
  let component: PracticeHistoryFilters;
  let fixture: ComponentFixture<PracticeHistoryFilters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PracticeHistoryFilters],
    }).compileComponents();

    fixture = TestBed.createComponent(PracticeHistoryFilters);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
