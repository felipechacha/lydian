import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { PracticeGoalEditor } from './practice-goal-editor';

describe('PracticeGoalEditor', () => {
  let component: PracticeGoalEditor;
  let fixture: ComponentFixture<PracticeGoalEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PracticeGoalEditor],
    }).compileComponents();

    fixture = TestBed.createComponent(PracticeGoalEditor);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('goal', {
      user_id: 'user-id',
      daily_target_seconds: 3600,
      weekly_target_days: 5,
      timezone: 'America/Sao_Paulo',
      created_at: null,
      updated_at: null,
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should convert the daily target from minutes to seconds', () => {
    const saved = vi.fn();
    component.saved.subscribe(saved);
    component.form.patchValue({ dailyTargetMinutes: 45, weeklyTargetDays: 4 });

    component.submit();

    expect(saved).toHaveBeenCalledWith({
      daily_target_seconds: 2700,
      weekly_target_days: 4,
      timezone: 'America/Sao_Paulo',
    });
  });
});
