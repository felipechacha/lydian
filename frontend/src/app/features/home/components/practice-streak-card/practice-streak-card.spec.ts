import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticeStreakCard } from './practice-streak-card';

describe('PracticeStreakCard', () => {
  let component: PracticeStreakCard;
  let fixture: ComponentFixture<PracticeStreakCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PracticeStreakCard],
    }).compileComponents();

    fixture = TestBed.createComponent(PracticeStreakCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('streak', {
      days: 12,
      week: [{ label: 'S', completionPercentage: 60, isCompleted: true }],
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
