import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyPractice } from './daily-practice';

describe('DailyPractice', () => {
  let component: DailyPractice;
  let fixture: ComponentFixture<DailyPractice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyPractice],
    }).compileComponents();

    fixture = TestBed.createComponent(DailyPractice);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('practice', {
      userName: 'Alex',
      completedMinutes: 45,
      targetMinutes: 60,
      remainingMinutes: 15,
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate the daily progress percentage', () => {
    expect(component.progressPercentage).toBe(75);
  });
});
