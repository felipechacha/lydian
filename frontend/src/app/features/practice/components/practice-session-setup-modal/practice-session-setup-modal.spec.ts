import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticeSessionSetupModal } from './practice-session-setup-modal';

describe('PracticeSessionSetupModal', () => {
  let component: PracticeSessionSetupModal;
  let fixture: ComponentFixture<PracticeSessionSetupModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PracticeSessionSetupModal],
    }).compileComponents();

    fixture = TestBed.createComponent(PracticeSessionSetupModal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('musicTitle', 'Enter Sandman');
    fixture.componentRef.setInput('musicArtist', 'Metallica');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.form.controls.title.value).toBe('Prática de Enter Sandman');
  });

  it('should emit the valid session configuration', () => {
    let submittedValue: unknown;
    component.submitted.subscribe((value) => {
      submittedValue = value;
    });

    component.form.patchValue({ focusArea: 'Palm mute', notes: 'Treinar o riff.' });
    component.submit();

    expect(submittedValue).toEqual(component.form.getRawValue());
  });
});
