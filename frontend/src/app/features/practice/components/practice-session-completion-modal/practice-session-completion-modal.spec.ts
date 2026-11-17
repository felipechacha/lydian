import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticeSessionCompletionModal } from './practice-session-completion-modal';

describe('PracticeSessionCompletionModal', () => {
  let component: PracticeSessionCompletionModal;
  let fixture: ComponentFixture<PracticeSessionCompletionModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PracticeSessionCompletionModal],
    }).compileComponents();

    fixture = TestBed.createComponent(PracticeSessionCompletionModal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('musicTitle', 'Enter Sandman');
    fixture.componentRef.setInput('elapsedTime', '00:03:42');
    fixture.componentRef.setInput('durationMinutes', 3);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit notes and progress when completing the session', () => {
    let submittedValue: unknown;
    component.submitted.subscribe((value) => {
      submittedValue = value;
    });
    component.form.patchValue({
      sessionNotes: 'Boa consistência.',
      songNotes: 'Revisar o refrão.',
      progressRating: 4,
    });

    component.submit();

    expect(submittedValue).toEqual(component.form.getRawValue());
  });
});
