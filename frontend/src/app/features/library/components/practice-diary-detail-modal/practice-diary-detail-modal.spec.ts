import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticeDiaryDetailModal } from './practice-diary-detail-modal';

describe('PracticeDiaryDetailModal', () => {
  let component: PracticeDiaryDetailModal;
  let fixture: ComponentFixture<PracticeDiaryDetailModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PracticeDiaryDetailModal],
    }).compileComponents();

    fixture = TestBed.createComponent(PracticeDiaryDetailModal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('entry', {
      sessionId: 'session-id',
      session: 7,
      title: 'Prática de Enter Sandman',
      date: 'Hoje, 18:12',
      duration: '12 min',
      progress: 80,
      tempo: 72,
      mood: 'satisfied',
      focusArea: 'Palm mute',
      sessionNotes: 'Boa consistência.',
      songNotes: 'Revisar o refrão.',
      accent: 'secondary',
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')?.textContent).toContain(
      'Boa consistência.',
    );
  });

  it('should emit the close action', () => {
    const closeSpy = vi.spyOn(component.closed, 'emit');

    fixture.nativeElement.querySelector('.practice-detail-header-custom button').click();

    expect(closeSpy).toHaveBeenCalledOnce();
  });
});
